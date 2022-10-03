function GetPerms(){
    const geolocationOptions = {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
    }
    return new Promise((resolve, reject) => {
          
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
            () => {
                resolve()
            },
            () => {
                alert("U need to enable geolocation!")
                reject()
            },
            geolocationOptions
            )
        } else {
            reject()
            console.log("Browser does not support the Geolocation API")
        }
    })
}

function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((postion)=>{resolve(postion.coords)}, ()=>{},{
                enableHighAccuracy: true,
                timeout: 7000,
                maximumAge: 0
            });

        } else {
            reject()
        }
    })
}

// Makes tile 1px larger to hide white line
(function(){
    var originalInitTile = L.GridLayer.prototype._initTile
    L.GridLayer.include({
        _initTile: function (tile) {
            originalInitTile.call(this, tile);

            var tileSize = this.getTileSize();

            tile.style.width = tileSize.x + 1 + 'px';
            tile.style.height = tileSize.y + 1 + 'px';
        }
    });
})()


async function init(){
    await GetPerms().catch(()=>{})
    ///const postion = await getLocation()

    const mapPlacement = L.map('mapPlacement').setView([55, 55], 13)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(mapPlacement)
    document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';

    var circle = L.circle([60.4, 5.3], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 100
    }).addTo(mapPlacement)

    mapPlacement.addEventListener('move', ()=>{
        circle.setLatLng(mapPlacement.getCenter())
    })
    
    const mapsize = document.getElementById('mapSize')

    mapsize.oninput = function() {
        circle.setRadius(this.value)
    }
    

    const gameMap = L.map('gameMap').setView([60.4, 5.3], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(gameMap);

    var gameCircle = ()=>{
        var circle = L.circle([60.4, 5.3], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 100
        }).addTo(gameMap);
    }

    const onPosIcon = document.getElementById('onPosIcon')

    onPosIcon.addEventListener('click', ()=>{
        mapPlacement.setView(new L.LatLng(40.737, -73.923), 8);
    })

}
const h = document.getElementById("hTime")
function showVal(val){
    if (val < 200000){
        h.style.color = "rgb(0,255,0)"
    }
    else if (val < 400000){
        h.style.color = "yellow"
    }
    else if (val < 600000){
        h.style.color = "red"
    }

    const mins = Math.floor(val / 60000)
    const secs = Math.floor((val / 1000) - (mins * 60))

    h.innerText = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

showVal(300000)
init()