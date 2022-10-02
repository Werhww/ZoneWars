import { Vector2, GID } from "./types"
import { Time, UUID } from "./utils"
import config from "./config"

import {Player} from "./player"

interface GameSettings {
    HideTime: number,
    zoneShrink: boolean,
    ShrinkSpeed: 1|2|3,
    HeartBeatSensor: boolean
}

export const games:{
    [GID:GID]: Game
} = {}

export class Game {
    started:boolean = false
    players:Player[] = []
    hostedTime:number = Time()

    GameLoop: NodeJS.Timer
    ZoneLoop: NodeJS.Timer

    constructor(
        public host:Player, 
        public hostUsername:string,

        public center:Vector2,
        public radius:number, 
        public GID = UUID(true))
    {
        this.GameLoop = setInterval(() => {
            this.RemoveIdlePlayers()
            this.CheckRemoveSelf()
        }, config.GameTickRate)

        this.ZoneLoop = setInterval(() => {
            if (this.started){
                this.ShrinkRadius(config.ZoneShrinkAmount)
            }

        }, config.ZoneShrinkInterval)

        if(!games[GID]) games[GID] = this


        // Needs to be last
        host.JoinGame(hostUsername, this.GID)
    }

    EmitGlobal(event:string, ...args:any){
        for (var player of this.players){
            player.socket.emit(event, ...args)
        }
    }

    GetPlayerByUsername(username:string){
        for (var player of this.players){
            if (player.username === username) return player
        }
    }

    StartGame(){
        this.EmitGlobal("GameStart")

        this.started = true
    }

    EndGame(){
        this.started = false

        this.EmitGlobal("GameEnd")
        for (var player of this.players){
            player.EmitPopup(config.messages.GameEnded)
        }
        
        clearInterval(this.GameLoop)
        clearInterval(this.ZoneLoop)

        this.RemoveAllPlayers()
        delete games[this.GID]
    }

    CheckRemoveSelf(){
        for (var GID in games){
            const game = games[GID]
    
            if (Object.keys(game.players).length <= 0){
                game.EndGame()
            }
    
            if (new Date().getTime() - game.hostedTime > config.MaxGameDuration){
                game.EndGame()
            }
    
            if (game.radius < config.MinZoneRadius){
                game.EndGame()
            } 
        }
    }

    RemoveIdlePlayers(){
        for (var player of this.players){
            
            if (Time() - player.positionUpdateLastTime > config.PositionTimeout){
                this.RemovePlayer(player, config.messages.KickTimeout)
            }
        }
    }

    RemovePlayer(player:Player, message?:string){
        this.players = this.players.filter((v) => {
            if (v == player){
                if (message) v.EmitPopup(message)

                v.game = undefined
                return false
            }

            return true
        })
    }

    RemoveAllPlayers(){
        for (var player of this.players){
            player.LeaveGame()
        }
    }

    ShrinkRadius(magnetude:number){
        this.radius -= magnetude
    }
}