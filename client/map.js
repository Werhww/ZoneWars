//Gets position permission
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

//Function with gets players latitude and longitude
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


export class LeafletMap {
    constructor(){
    }

    CreateZone(position, radius){
        return L.circle([position.longitude, position.latitude], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: radius
        }).addTo(mapPlacement)
    }

    CreateCenterZone(radius){
        this.ct = this.CreateCenterZone(radius)
        
        this.map.addEventListener('move', ()=>{
            this.ct.setLatLng(this.map.getCenter())
        })
    }

    CreateSetZone(position, radius){
        this.ct = this.CreateZone(position, radius)
    }

    SetZoneRadius(radius){
        this.ct.setRadius(radius)
    }

    RemoveZone(){
        this.ct.remove()
    }

    CenterMap(){
        const position = getLocation()
        this.map.setView(new L.LatLng(position.longitude, position.latitude), 8);
    }


    AddPlayerMarker(){
        
    }

    async init(id){
        await GetPerms().catch(()=>{})

        setInterval(() => {
            
        }, 2000)

        this.map = L.map(id).setView([55, 55], 13)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(this.map)

        document.getElementsByClassName('leaflet-control-attribution' )[0].style.display = 'none';
    }
}