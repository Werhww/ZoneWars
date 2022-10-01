import { Socket } from "socket.io";
import { GlobalDistanceMeters, UUID} from "./utils"

import {GID, PUUID, POSITION} from "./types"
import {games, GameType} from "./game"

export interface PlayerType {
    PUUID: PUUID,
    username: string,
    position: POSITION,

    insideZone: boolean,
    eliminated: boolean,

    positionUpdateTime: number,
    insideZoneTime: number,
}

const MaxZoneTime = 10000
const MaxTimeout =  20000

const MaxGameZoneSize = 1000

const GameTickRate = 1000

const messages = {
    GameZoneToLarge: `Max zone size is ${MaxGameZoneSize}`,
    GameEnded: "Game has ended. If there is any hiders left, thay won.",
    GameNotFoud: "Game not found."
}

export class GameConnection {
    GID: string|undefined
    PUUID: string|undefined

    constructor(public socket: Socket) {
        setInterval(() => {
            if (this.GID){
                this.UpdateGameOverState()
            }

            if (this.IsInGame()){
                this.EmitAllGameData()
            }

            if (this.IsGameStarted()){
                this.UpdatePlayerZoneState()
                this.UpdatePlayerEliminationState()
            }
        }, GameTickRate)

        // Endpoints
        socket.on("HostGame", this.HostGame.bind(this))
        socket.on("StartGame", this.StartGame.bind(this))
        socket.on("EndGame", this.EndGame.bind(this))
        
        socket.on("JoinGame", (GID:GID, username:string) => {
            this.JoinGame(GID, username)
        })
        socket.on("LeaveGame", this.LeaveGame.bind(this))

        socket.on("UpdatePosition", this.UpdatePlayerPosition.bind(this))
    }



    GetGame():GameType|undefined{
        if (!this.IsInGame()) return
        return games[this.GID as GID]
    }

    GetPlayer():PlayerType|undefined{
        if (!this.IsInGame()) return
        return games[this.GID as GID].players[this.PUUID as PUUID]
    }




    IsInGame():boolean{
        if (this.GID !== undefined && games[this.GID]) {
            const game = games[this.GID]

            if (this.PUUID !== undefined && game.players[this.PUUID]){
                return true
            }
        }

        return false
    }

    IsGameOver():boolean{
        if (this.GID && this.PUUID && !games[this.GID]){
            return true
        }

        return false
    }

    IsGameStarted():boolean{
        if (!this.IsInGame()) return false
        const game = this.GetGame() as GameType

        return game.started
    }

    IsGameHost():boolean{
        if (!this.IsInGame()) return false
        const game = this.GetGame() as GameType

        return game.host === this.PUUID
    }


    IsInsideZone():boolean{
        if (!this.IsGameStarted()) return false
        
        const game = this.GetGame() as GameType
        const player = this.GetPlayer() as PlayerType

        const distance = GlobalDistanceMeters(
            player.position.lat,
            player.position.lon,
            game.current.center.lat,
            game.current.center.lon
        )

        console.log("Distance ", distance)

        return distance > game.current.radius
    }

    IsEliminated():boolean{
        if (!this.IsGameStarted()) return false

        const player = this.GetPlayer() as PlayerType

        if (new Date().getTime() - player.positionUpdateTime > MaxTimeout){
            console.log("Elimanated due to timout", new Date().getTime() - player.positionUpdateTime)
            return true
        }

        if (
            player.insideZone && 
            this.IsInsideZone() && 
            new Date().getTime() - player.insideZoneTime > MaxZoneTime
        ){
            console.log("Eleiminated due to zone time ", new Date().getTime() - player.insideZoneTime)
            return true
        } else {
            return false
        }
    }

    
    EmitGameOver(){
        this.socket.emit("GameOver")
        this.EmitPopup(messages.GameEnded, false)
    }

    EmitJoinGame(){
        if (!this.IsInGame()) return

        console.log("Joind game")

        this.socket.emit("GameJoin", {
            GID: this.GID,
            PUUID: this.PUUID,

            host: this.IsGameHost(),
        })  
    }


    EmitAllGameData(){
        if (!this.IsInGame()) return
        const game = this.GetGame() as GameType
        const player = this.GetPlayer() as PlayerType

        const HiddenPlayers = Object.values(game.players).map(v => {
            if (v.PUUID === this.PUUID) return

            return {
                username: v.username,
                inZone: v.insideZone,
                insideZoneTime: v.insideZoneTime,
                position: v.position,
                eliminated: v.eliminated,
            }
        }).filter((v) => {if (v) return true})

        this.socket.emit("GameData", {
            GID: game.GID,
            time: new Date().getTime(),

            started: game.started,

            radius: game.current.radius,
            center: game.current.center,

            players: HiddenPlayers,
            self: player 
        })
    }


    EmitPopup(message:string, error:boolean = false){
        this.socket.emit("popup", {
            message,
            error
        })
    }


    UpdatePlayerPosition(position:POSITION){
        if (!this.IsInGame()) return

        const player = this.GetPlayer() as PlayerType

        if (this.IsGameStarted() && player.eliminated) return

        player.position = position
        player.positionUpdateTime = new Date().getTime()

        console.log("New player position", position)
    }


    UpdateGameOverState(){
        if (this.IsGameOver()){
            this.EmitGameOver()

            this.GID = undefined
            this.PUUID = undefined
        }
    }

    UpdatePlayerZoneState(){
        if (!this.IsGameStarted()) return
        const player = this.GetPlayer() as PlayerType

        if (this.IsInsideZone()){
            if (!player.insideZone) player.insideZoneTime = new Date().getTime()
            player.insideZone = true
        } 
        else {
            player.insideZone = false
        }

        console.log("New ZoneState ", player.insideZone)
    }

    UpdatePlayerEliminationState(){
        if (!this.IsGameStarted()) return
        const player = this.GetPlayer() as PlayerType

        player.eliminated = this.IsEliminated()

        console.log("New EliminationState ", player.eliminated)
    }



    HostGame(username:string, center:POSITION, radius:number) {
        const GID = UUID(true)
        const PUUID = UUID(false)

        if (radius > MaxGameZoneSize) {
            this.EmitPopup(messages.GameZoneToLarge, true)
            return
        }

        games[GID] = {
            GID: GID,
            host: PUUID,
            started: false,

            hostedTime: new Date().getTime(),

            initial: {
                center,
                radius
            },
            current: {
                center,
                radius
            },

            players: {}
        }

        console.log("Game Hosting")


        this.JoinGame(GID, username, PUUID)
    }

    StartGame(){
        if (!this.IsGameHost()) return
        const game = this.GetGame() as GameType

        game.started = true

        console.log("Game Started")
    }

    EndGame(){
        if (this.IsGameHost()) delete games[this.GID as GID]
    }

    JoinGame(GID:GID, username:string, PUUID = UUID(false)){
        if (this.IsInGame()) this.LeaveGame()

        if(!games[GID]) {
            this.EmitPopup(messages.GameNotFoud, true)
            return
        }

        games[GID].players[PUUID] = {
            PUUID,

            username: username,
            position: {
                lon: 0,
                lat: 0
            },

            insideZone: false,
            eliminated: false,

            insideZoneTime: 0,
            positionUpdateTime: new Date().getTime()
        }

        this.GID = GID
        this.PUUID = PUUID

        this.EmitJoinGame()

        console.log("User Joined Game")

    }

    LeaveGame(){
        if (!this.IsInGame()) return
        delete games[this.GID as GID].players[this.PUUID as PUUID]

        console.log("User Left Game")

        this.GID = undefined
        this.PUUID = undefined
    }
}