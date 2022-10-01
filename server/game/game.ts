import {GID, PUUID, POSITION} from "./types"
import {PlayerType} from "./player"
import { Socket } from "socket.io"

export interface GameType {
    GID: GID,
    host: PUUID,
    started: boolean,

    hostedTime: number,

    initial: {
        radius: number,
        center: POSITION
    },
    current: {
        radius: number,
        center: POSITION
    },

    players: {
        [PUUID: PUUID]: PlayerType
    }
}

interface GamesType {
    [GID: GID]: GameType
}

export const games:GamesType = {}

const DeafultShrinkGameZoneInterval = 2500

const DeafultShrinkGameZoneMagnetude = 0.1


// One hour
const MaxGameDuration = 3_600_000
const MinZoneRadius = 10

function ShrinkGameZone(magnetude:number = DeafultShrinkGameZoneMagnetude){
    for (var gid in games){
        const game = games[gid]

        if (!game.started) continue

        game.current.radius -= magnetude
    }
}

export function ShrinkGameZoneInterval(magnetude = DeafultShrinkGameZoneMagnetude, interval = DeafultShrinkGameZoneInterval){
    setInterval(() => ShrinkGameZone(magnetude), interval)
}

export function RemoveGames(){
    for (var GID in games){
        const game = games[GID]

        if (Object.keys(game.players).length <= 0){
            delete games[GID]
        }

        if (new Date().getTime() - game.hostedTime > MaxGameDuration){
            delete games[GID]
        }

        if (game.current.radius < MinZoneRadius){
            delete games[GID]
        } 
    }
}