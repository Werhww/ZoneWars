//Gets position permission
const geolocationOptions = {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000,
}

//Function with gets players latitude and longitude
function getLocation() {
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumWait: 10000,     
        maximumAge: 0,          
        desiredAccuracy: 5,
    }

    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            geolocator.locate(options, function (err, location) {
                if (err) return reject(err)
                resolve({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                })
            })
        } else {
            reject("Browser does not support the Geolocation API")
            console.log("Browser does not support the Geolocation API")
        }
    })
}



export function escape(unsafe){
    return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
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

    ConvertPosition(position){
        return new L.LatLng(position.lat, position.lon)
    }

    CreateZone(position, radius){
        return L.circle([position.lng, position.lat], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.05,
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
        this.ct = this.CreateZone(position, radius)
    }

    SetZoneRadius(radius){
        this.ct.setRadius(radius)
    }

    RemoveZone(){
        if (this.ct)
        this.ct.remove()
        this.ct = undefined
    }

    CenterMap(zoom = undefined){
        this.map.setView(this.position, zoom);
    }


    AddPlayerMarker(username, position, type){
        return L.marker(position, {icon: new L.DivIcon({
            className: '',
            html: `
            <div class="marker ${type}" id="MUUID-${escape(username)}">
            <span>${escape(username)}</span>
            <img src="/assets/icons/circle.svg"/>
            </div>`
        })}).addTo(this.map)
    }

    async init(elem){
        this.position = await getLocation().catch(()=>{})

        setInterval(async () => {
            getLocation().then((position) => {this.position = position}).catch(console.error)
        }, 4000)

        this.map = L.map(elem).setView([this.position.lat, this.position.lng], 15)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(this.map)

        document.getElementsByClassName('leaflet-control-attribution' )[0].style.display = 'none';

    }
}