import { LeafletMap } from "./map.js"

const map = new LeafletMap()
const size = document.getElementById("mapSize")

const submitName = document.getElementById('submitName')
const onPosIcon = document.getElementById("onPosIcon")
const mapNext = document.getElementById('mapNext')

submitName.addEventListener('click', ()=>{
    map.init("mapPlacement").then(async () => {
        map.CreateCenterZone(100)

        map.CenterMap(14)

        map.MarkSelf()

        onPosIcon.onclick = () => {
            map.CenterMap()
        }
    
        size.oninput = function () {
            map.SetZoneRadius(this.value)
        }
    
        size.onchange = function () {
            map.SetZoneRadius(this.value)
        }   

        mapNext.onclick = ()=>{
            document.mapCenter = map.map.getCenter()
            document.circleRadius = map.ct.getRadius()
        }
    })  
})