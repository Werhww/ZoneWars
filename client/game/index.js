import { LeafletMap } from "./map.js";  

const map = new LeafletMap()

map.init("gameMap").then(() => {
    map.CenterMap()
})
