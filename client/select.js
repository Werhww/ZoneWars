import { LeafletMap } from "./game/map"

const map = new LeafletMap()
const size = document.getElementById("mapSize")
map.init("mapPlacement").then(async () => {
    await map.CenterMap()

    map.CreateCenterZone(100)
    size.oninput = function () {
        map.SetZoneRadius(this.value)
    }

    size.onchange = function () {
        map.SetZoneRadius(this.value)
    }   
})  