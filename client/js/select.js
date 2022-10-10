import { LeafletMap } from "./map.js"

const map = new LeafletMap()
const size = document.getElementById("map-CircleRadius-range")

const submit_name = document.getElementById('submit-name')
const onPosIcon = document.getElementById("onPosIcon")
const host_map_back = document.getElementById('host-map-back')

submit_name.addEventListener('click', ()=>{
    map.init("host-map-placement").then(async () => {
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

        host_map_back.onclick = ()=>{
            document.mapCenter = map.map.getCenter()
            document.circleRadius = map.ct.getRadius()
        }
    })  
})