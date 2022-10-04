import { LeafletMap } from "./map.js";  

const map = new LeafletMap()

map.init("gameMap").then(() => {
    map.CenterMap()

    map.CreateSetZone(L.LatLng[60.397076, 5.324383], 100)

    map.AddPlayerMarker("test", {
        lng: 5.324383,
        lat: 60.397076
    }, "self")

    map.AddPlayerMarker("tevvvst", {
        lng: 5.354383,
        lat: 60.397076
    }, "friend")
})
