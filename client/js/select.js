import { LeafletMap } from "./map.js"

const map = new LeafletMap()
const size = document.getElementById("map-CircleRadius-range")

const join_submit = document.getElementById('join-submit')
const onPosIcon = document.getElementById("onPosIcon")
const host_map_next = document.getElementById('host-map-next')

join_submit.addEventListener('click', ()=>{
    map.init("host-map-placer").then(async () => {
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

        host_map_next.onclick = ()=>{
            document.mapCenter = map.map.getCenter()
            document.circleRadius = map.ct.getRadius()
        }
    })  
})