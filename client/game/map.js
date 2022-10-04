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
            navigator.geolocation.getCurrentPosition((position)=>{resolve(new L.LatLng(position.coords.latitude, position.coords.longitude))}, ()=>{},{
                enableHighAccuracy: true,
                timeout: 2000,
                maximumAge: 1000
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
        return L.circle([position.lng, position.lat], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: radius
        }).addTo(this.map)
    }

    CreateCenterZone(radius){
        const pos = this.map.getCenter()
        this.ct = this.CreateZone(pos, radius)

        this.map.addEventListener('move', ()=>{
            const pos = this.map.getCenter()
            this.ct.setLatLng(pos)
        })
    }

    CreateSetZone(position, radius){
        console.log(position)
        this.ct = this.CreateZone(position, radius)
    }

    SetZoneRadius(radius){
        this.ct.setRadius(radius)
    }

    RemoveZone(){
        this.ct.remove()
    }

    CenterMap(zoom = undefined){
        this.map.setView(this.position, zoom);
    }


    AddPlayerMarker(username, position, type){
        L.marker(position, {icon: new L.DivIcon({
            className: '',
            html: `
            <div class="marker ${type}">
            <span>${username}</span>
            <img src="/client/_assets/icons/circle.svg"/>
            </div>`
        })}).addTo(this.map)
    }

    async init(elem){
        await GetPerms().catch(()=>{})
        this.position = await getLocation()
        
        
        setInterval(async () => {
            this.position = await getLocation()
        }, 4000)

        console.log(this.position)
        this.map = L.map(elem).setView([this.position.lat, this.position.lng], 15)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(this.map)

        document.getElementsByClassName('leaflet-control-attribution' )[0].style.display = 'none';
    }
}