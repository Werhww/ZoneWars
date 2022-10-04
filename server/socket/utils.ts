import { v4 as uuidv4 } from 'uuid'

export function GlobalDistanceMeters(
    lat1:number, 
    lon1:number, 
    lat2:number, 
    lon2:number
){
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;

    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in meters

    return d
}

export function UUID(simple:boolean):string {
    if (simple) return Math.floor(Math.random() * 100000000).toString().padStart(9, "0")
    else return uuidv4()
}

export function Time(){
    return new Date().getTime()
}