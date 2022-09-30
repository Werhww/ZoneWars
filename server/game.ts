import {GID, PUUID, POSITION} from "./types"
import {PlayerType} from "./player"
import { Socket } from "engine.io"

export interface GameType {
    GID: GID,
    host: PUUID,
    started: boolean
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