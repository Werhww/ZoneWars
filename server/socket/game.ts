import { Vector2, GID } from "./types"
import { Time, UUID } from "./utils"
import config from "./config"

import {Player} from "./player"

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

            console.log(this.players.length)
        }, 1000)

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

    StartGame(){
        this.EmitGlobal("GameStart")

        this.started = true
    }

    EndGame(){
        this.started = false

        this.EmitGlobal("GameEnd")
        
        delete games[this.GID]

        clearInterval(this.GameLoop)
        clearInterval(this.ZoneLoop)

        this.RemoveAllPlayers()
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
                this.RemovePlayer(player)
                player.game = undefined
            }
        }
    }

    RemovePlayer(player:Player){
        this.players = this.players.filter((v) => {
            return v != player
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