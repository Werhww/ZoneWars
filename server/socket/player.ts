import { GlobalDistanceMeters, Time, UUID } from "./utils";
import { GameSettings, GID, Vector2 } from "./types";
import config from "./config"

import { Game, games } from "./game";


import { Socket } from "socket.io";
import { EventEmitter } from "events";

export class Player extends EventEmitter {
    game?: Game

    username:string = "guest"
    position?:Vector2

    positionUpdateLastTime: number = 0
    outsideZoneStartTime: number = 0

    outsideZone: boolean = false
    eliminated:boolean = false

    seeker: boolean = false

    PlayerLoop: NodeJS.Timer

    constructor(public socket:Socket) {
        super()

        this.PlayerLoop = setInterval(() => {
            const game = this.GetGame()
            if (!game) return

            this.EmitGameData()

            // Dont eliminate seeker
            if (game.started && !this.seeker){
                this.UpdateOutsideZoneState()
                this.UpdateEliminatedState()
            }
        }, config.PlayerTickRate)

        this.AddSocketListeners(socket)
    }

    ReplaceSocket(socket:Socket){
        this.socket.removeAllListeners()
        this.AddSocketListeners(socket)
        this.socket = socket
    }   

    AddSocketListeners(socket:Socket){
        socket.on("HostGame", this.HostGame.bind(this))
        socket.on("StartGame", this.StartGame.bind(this))
        socket.on("EndGame", this.EndGame.bind(this))
        socket.on("KickPlayer", this.KickPlayer.bind(this))
        socket.on("SetSeeker", this.SetSeeker.bind(this))
        
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
            seeker: this.seeker,

            outsideZone: this.outsideZone,
            outsideZoneStartTime: this.outsideZoneStartTime,
            position: this.position ?? {lon: 0, lat:0},
            eliminated: this.eliminated,

            host: this.IsGameHost()
        }
    }

    GetClosestPlayer(){
        const game = this.GetGame()
        if (!game) return false
        if (!this.position) return 

        var closest:Player|undefined = undefined
        var distance:number|undefined = undefined


        for (var player of game.players){
            if (player.seeker || !player.position) continue

            const dis = GlobalDistanceMeters(
                this.position.lat,
                this.position.lon,
                player.position.lat,
                player.position.lon
            )

            if (!distance ||  dis < distance) {
                closest = player
                distance = dis
                continue
            }
        }

        if (!closest || !distance) return

        return {
            closest,
            distance
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
            if (this.seeker != v.seeker) return
            return v.GetSafeVersion()

        }).filter((v) => {if (v) return true})

        this.socket.emit("GameData", {
            GID: game.GID,
            time: new Date().getTime(),

            started: game.started,
            StartedTime: game.StartTime,
            
            radius: game.radius,
            center: game.center,

            settings: game.GameSettings,

            closest: this.GetClosestPlayer(),

            hiding: game.hiding,

            players: HiddenPlayers,
            host: game.HostUsername,
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

    ResetPlayer(){
        this.eliminated = false
        this.outsideZone = false

        this.positionUpdateLastTime = Time()
    }


    HostGame(username:string, settings:GameSettings, center:Vector2, radius:number){
        if (radius > config.MaxZoneRadius) {
            this.EmitPopup(config.messages.GameZoneToLarge)
            return
        }

        new Game(this, username, settings, center, radius)
    }

    StartGame(){
        const game = this.GetGame()
        if (!game || !this.IsGameHost()) return

        game.StartGame()
    }

    EndGame(){
        const game = this.GetGame()
        if (!game || !this.IsGameHost()) return

        game.EndGame()
    }

    JoinGame(username:string, GID:GID){
        const game = games[GID]
        if (!game) {
            this.EmitPopup(config.messages.GameNotFoud)
            return
        }
        if (game.GetPlayerByUsername(username)) {
            this.EmitPopup(config.messages.UsernameTaken)
            return
        }
        
        this.username = username
        this.game = game

        this.ResetPlayer()

        this.socket.emit("GameJoin")
        game.players.push(this)
    }

    LeaveGame(){
        const game = this.GetGame()
        if (!game) return

        game.RemovePlayer(this)
    }

    KickPlayer(username:string){
        const game = this.GetGame()
        if (!game || !this.IsGameHost()) return
        const player = game.GetPlayerByUsername(username)
        if (!player || username !== this.username) return

        game.RemovePlayer(player, config.messages.KickByHost)
    }
    
    SetSeeker(username:string, state:boolean){
        const game = this.GetGame()
        if (!game || !this.IsGameHost()) return
        const player = game.GetPlayerByUsername(username)
        if (!player || username !== this.username) return

        player.seeker = state
    }



    UpdatePosition(position:Vector2){
        this.positionUpdateLastTime = Time()
        this.position = position
    }


    ClearPlayer(){
        this.LeaveGame()
        clearInterval(this.PlayerLoop)
    }
}