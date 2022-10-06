import { Vector2, GID, GameSettings } from "./types"
import { Time, UUID } from "./utils"
import config from "./config"

import {Player} from "./player"

export const games:{
    [GID:GID]: Game
} = {}

export class Game {
    started:boolean = false
    hiding:boolean = false

    players:Player[] = []
    HostedTime:number = Time()

    GameLoop: NodeJS.Timer
    ZoneLoop: NodeJS.Timer

    InitRadius: number
    InitCenter: Vector2

    StartTime: number = 0

    constructor(
        public host:Player, 
        public HostUsername:string,

        public GameSettings:GameSettings,

        public center:Vector2,
        public radius:number, 
        public GID = UUID(true))
    {
        this.InitCenter = center
        this.InitRadius = radius
        
        this.GameLoop = setInterval(() => {
            this.RemoveIdlePlayers()
            this.CheckRemoveSelf()
        }, config.GameTickRate)

        
        this.ZoneLoop = setInterval(() => {
            if (this.started && this.GameSettings.ZoneShrink && !this.hiding){
                this.ShrinkRadius(config.ZoneShrinkAmount)
            }
            
        }, config.ZoneShrinkInterval[GameSettings.ShrinkSpeed-1])

        if(!games[GID]) games[GID] = this


        // Needs to be last
        host.JoinGame(HostUsername, this.GID)
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
        this.StartTime = Time()

        this.started = true
        this.hiding = true

        setTimeout(() => {
            this.hiding = false
        }, this.GameSettings.HideTime)
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

    ResetGame(){
        this.started = false   
        this.hiding = false 
        this.StartTime = 0
        this.radius = this.InitRadius
        this.center = this.InitCenter

        this.EmitGlobal("GameReset")
        for (var player of this.players){
            player.ResetPlayer()
            player.EmitPopup(config.messages.GameEnded)
        }
    }

    CheckRemoveSelf(){
        for (var GID in games){
            const game = games[GID]
    
            if (Object.keys(game.players).length <= 0){
                game.EndGame()
            }
    
            if (new Date().getTime() - game.HostedTime > config.MaxGameDuration){
                game.ResetGame()
            }
    
            if (game.radius < config.MinZoneRadius){
                game.ResetGame()
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
                player.emit("end")

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