export type GID = string

export interface Vector2 {
    lon: number,
    lat: number
}

export interface GameSettings {
    HideTime: number,
    ZoneShrink: boolean,
    ShrinkSpeed: 1|2|3,
    HeartBeatSensor: boolean
}