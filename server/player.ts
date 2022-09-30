import { Socket } from "socket.io";
import { GlobalDistanceMeters, UUID} from "./utils"

import {GID, PUUID, POSITION} from "./types"
import {games, GameType} from "./game"

export interface PlayerType {
    PUUID: PUUID,
    username: string,
    position: POSITION,

    inZone: boolean,
    eliminated: boolean,

    positionUpdateTime: number,
    inZoneTime: number,
}

const MaxZoneTime = 10000
const MaxTimeout = 10000

const GameTickRate = 1000

export class Connection {
    GID: string|undefined
    PUUID: string|undefined

    constructor(public socket: Socket) {
        setInterval(() => {
            if (this.IsInGame()){
                this.EmitAllGameData()
            }

            if (this.IsGameStarted()){
                this.UpdatePlayerZoneState()
                this.UpdatePlayerEliminationState()
            }
        }, GameTickRate)

        // Endpoints
        socket.on("HostGame", this.HostGame)
        socket.on("StartGame", this.StartGame)
        
        socket.on("JoinGame", (GID:GID, username:string) => {
            this.JoinGame(GID, username)
        })
        socket.on("LeaveGame", this.LeaveGame)

        socket.on("UpdatePosition", this.UpdatePlayerPosition)
    }



    GetGame():GameType|undefined{
        if (!this.IsInGame()) return
        return games[this.GID as GID]
    }

    GetPlayer():PlayerType|undefined{
        if (!this.IsInGame()) return
        return games[this.GID as GID][this.PUUID as PUUID]
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


    IsInZone():boolean{
        if (!this.IsGameStarted()) return false
        
        const game = this.GetGame() as GameType
        const player = this.GetPlayer() as PlayerType

        const distance = GlobalDistanceMeters(
            player.position.lat,
            player.position.lon,
            game.current.center.lat,
            game.current.center.lon
        )

        return distance <= game.current.radius
    }

    IsEliminated():boolean{
        if (!this.IsGameStarted()) return false

        const player = this.GetPlayer() as PlayerType

        if (new Date().getTime() - player.positionUpdateTime > MaxTimeout){
            return true
        }

        if (
            !player.inZone && 
            !this.IsInZone() && 
            new Date().getTime() - player.inZoneTime > MaxZoneTime
        ){
            return true
        } else {
            return false
        }
    }

    

    EmitJoinGame(){
        if (!this.IsInGame()) return

        this.socket.emit("JoinGame", {
            GID: this.GID,
            PUUID: this.PUUID,

            host: this.IsGameHost(),
        })  
    }

    EmitAllGameData(){
        if (!this.IsInGame()) return
        const game = this.GetGame() as GameType

        const HiddenPlayers = Object.values(game.players).map(v => {
            return {
                username: v.username,
                inZone: v.inZone,
                position: v.position,
                eliminated: v.eliminated,
            }
        })


        this.socket.emit("GameData", {
            GID: game.GID,

            started: game.started,

            radius: game.current.radius,
            center: game.current.center,

            players: HiddenPlayers
        })
    }


    UpdatePlayerPosition(position:POSITION){
        if (!this.IsGameStarted()) return

        const player = this.GetPlayer() as PlayerType

        if (player.eliminated) return

        player.position = position
        player.positionUpdateTime = new Date().getTime()
    }


    UpdatePlayerZoneState(){
        if (!this.IsGameStarted()) return
        const player = this.GetPlayer() as PlayerType

        if (this.IsInZone()){
            player.inZone = false
            player.inZoneTime = new Date().getTime()
        } {
            player.inZone = true
        }
    }

    UpdatePlayerEliminationState(){
        if (!this.IsGameStarted()) return
        const player = this.GetPlayer() as PlayerType

        player.eliminated = this.IsEliminated()
    }




    HostGame(username:string, center:POSITION, radius:number) {
        const GID = UUID(true)
        const PUUID = UUID()

        games[GID] = {
            GID: GID,
            host: PUUID,
            started: false,
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

        this.JoinGame(GID, username, PUUID)
    }

    StartGame(){
        if (!this.IsGameHost()) return
        const game = this.GetGame() as GameType

        game.started = true
    }

    JoinGame(GID:GID, username:string, PUUID = UUID()){
        if (this.IsInGame()) this.LeaveGame()

        games[GID].players[PUUID] = {
            PUUID,

            username: username,
            position: {
                lon: 0,
                lat: 0
            },

            inZone: false,
            eliminated: false,

            inZoneTime: 0,
            positionUpdateTime: new Date().getTime()
        }

        this.GID = GID
        this.PUUID = PUUID
    }

    LeaveGame(){
        if (!this.IsInGame()) return
        delete games[this.GID as GID].players[this.PUUID as PUUID]

        this.GID = undefined
        this.PUUID = undefined
    }
}