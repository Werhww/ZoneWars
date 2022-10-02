import { GlobalDistanceMeters, Time } from "./utils";
import { GID, Vector2 } from "./types";
import config from "./config"

import { Game, games } from "./game";


import { Socket } from "socket.io";

export class Player {
    game?: Game

    username:string = "guest"
    position?:Vector2

    positionUpdateLastTime: number = 0
    outsideZoneStartTime: number = 0

    outsideZone: boolean = false
    eliminated:boolean = false

    PlayerLoop: NodeJS.Timer

    constructor(public socket:Socket){
        console.log("New Player")
        this.PlayerLoop = setInterval(() => {
            const game = this.GetGame()
            if (!game) return

            this.EmitGameData()

            if (game.started){
                this.UpdateOutsideZoneState()
                this.UpdateEliminatedState()
            }
        }, 1000)

        socket.on("HostGame", this.HostGame.bind(this))
        socket.on("StartGame", this.StartGame.bind(this))
        socket.on("EndGame", this.EndGame.bind(this))
        
        socket.on("JoinGame", (GID:GID, username:string) => {
            this.JoinGame(GID, username)
        })
        socket.on("LeaveGame", this.LeaveGame.bind(this))

        socket.on("UpdatePosition", this.UpdatePosition.bind(this))
    }

    GetGame(){
        if (!this.game) return false
        else return this.game
    }

    GetSafeVersion(){
        return {
            username: this.username,
            outsideZone: this.outsideZone,
            outsideZoneStartTime: this.outsideZoneStartTime,
            position: this.position ?? {lon: 0, lat:0},
            eliminated: this.eliminated,
        }
    }



    IsGameHost(){
        const game = this.GetGame()
        if (!game) return false
        return game.host === this
    }




    EmitGameData(){
        const game = this.GetGame()
        if (!game) return

        const HiddenPlayers = Object.values(game.players).map(v => {
            if (v === this) return
            return v.GetSafeVersion()

        }).filter((v) => {if (v) return true})

        this.socket.emit("GameData", {
            GID: game.GID,
            time: new Date().getTime(),

            started: game.started,

            radius: game.radius,
            center: game.center,

            players: HiddenPlayers,

            self: this.GetSafeVersion()
        })
    }

    EmitPopup(message:string, error:boolean = false){
        this.socket.emit("popup", {
            message,
            error
        })
    }




    UpdateOutsideZoneState(){
        const game = this.GetGame()
        if (!game) return false
        if (!this.position) {
            if (!this.outsideZone){
                this.outsideZoneStartTime = Time()
            }
            this.outsideZone = true

            return
        }

        const distance = GlobalDistanceMeters(
            this.position.lat,
            this.position.lon,
            game.center.lat,
            game.center.lon
        )

        var state = distance > game.radius

        if (!this.outsideZone){
            this.outsideZoneStartTime = Time()
        }

        this.outsideZone = state
    }

    UpdateEliminatedState(){
        const state = (
            this.outsideZone && 
            Time() - this.outsideZoneStartTime 
            > config.ZoneEliminationTime
        )  

        this.eliminated = state
    }




    HostGame(username:string, center:Vector2, radius:number){
        new Game(this, username, center, radius)
    }

    StartGame(){
        const game = this.GetGame()
        if (!game || !this.IsGameHost()) return
        console.log("Game Starting")

        game.StartGame()
    }

    EndGame(){
        const game = this.GetGame()
        if (!game || !this.IsGameHost()) return

        game.EndGame()
    }

    JoinGame(username:string, GID:GID){
        const game = games[GID]
        if (!game) return
        
        this.username = username
        this.game = game

        this.eliminated = false
        this.outsideZone = false

        this.positionUpdateLastTime = Time()

        game.players.push(this)
    }

    LeaveGame(){
        const game = this.GetGame()
        if (!game) return

        game.RemovePlayer(this)
        this.game = undefined
    }



    UpdatePosition(position:Vector2){
        this.positionUpdateLastTime = Time()
        this.position = position
    }


    RemovePlayer(){
        this.LeaveGame()
        clearInterval(this.PlayerLoop)
    }
}