import { LeafletMap } from "/client/game/map.js"

const map = new LeafletMap()
const size = document.getElementById("mapSize")
const submitName = document.getElementById('submitName')

submitName.addEventListener('click', ()=>{
    map.init("mapPlacement").then(async () => {
        map.CenterMap()
        map.CreateCenterZone(100)
    
        size.oninput = function () {
            map.SetZoneRadius(this.value)
        }
    
        size.onchange = function () {
            map.SetZoneRadius(this.value)
        }   
    })  
})