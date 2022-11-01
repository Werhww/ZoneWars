//Gets position permission
const geolocationOptions = {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000,
}

//Function with gets players latitude and longitude
function getLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((location) => {
                resolve({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                    acc: location.coords.accuracy
                })
            }, (err) => {
                reject(err)
            },
            geolocationOptions)
        } else {
            reject("Browser does not support the Geolocation API")
            console.log("Browser does not support the Geolocation API")
        }
    })
}



export function escape(unsafe){
    return unsafe
    .replace(/&/g, "&amp")
    .replace(/</g, "&lt")
    .replace(/>/g, "&gt")
    .replace(/"/g, "&quot")
    .replace(/'/g, "&#039")
}

// Makes tile 1px larger to hide white line
(function(){
    var originalInitTile = L.GridLayer.prototype._initTile
    L.GridLayer.include({
        _initTile: function (tile) {
            originalInitTile.call(this, tile)

            var tileSize = this.getTileSize()

            tile.style.width = tileSize.x + 1 + 'px'
            tile.style.height = tileSize.y + 1 + 'px'
        }
    })
})()


export class LeafletMap {
    constructor() {
    }

    MarkSelf() {
        this.AddPlayerMarker("", new L.LatLng(this.position.lat, this.position.lng), "self")
    }

    ConvertPosition(position) {
        return new L.LatLng(position.lat, position.lon)
    }

    CreateZone(position, radius) {
        return L.circle([position.lng, position.lat], {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.025,
            radius: radius
        }).addTo(this.map)
    }

    CreateCenterZone(radius) {
        const pos = this.map.getCenter()
        this.ct = this.CreateZone(pos, radius)

        this.map.addEventListener('move', ()=>{
            const pos = this.map.getCenter()
            this.ct.setLatLng(pos)
        })
    }

    CreateSetZone(position, radius) {
        this.ct = this.CreateZone(position, radius)
    }

    SetZoneRadius(radius) {
        this.ct.setRadius(radius)
    }

    RemoveZone() {
        if (this.ct)
        this.ct.remove()
        this.ct = undefined
    }

    CenterMap(zoom = undefined) {
        this.map.setView(this.position, zoom)
    }


    AddPlayerMarker(username, position, type) {
        return L.marker(position, {icon: new L.DivIcon({
            className: '',
            html: `
            <div class="marker ${type}" id="MUUID-${escape(username)}">
            <span>${escape(username)}</span>
            <img src="/assets/icons/circle.svg"/>
            </div>`
        })}).addTo(this.map)
    }
    
    async init(elem, popup = true) {
        if (document._map) {
            this.map = document._map.map
            this.ct = document._map.ct
            throw new Error("Map already initialized")
        }
        
        this.position = await getLocation().catch(()=>{})
        if (this.position.acc > 60) {
            if (popup){
                document.popup({
                    message: "Gps in not accurate. Try using a diffrent device!"
                })
            }
        }

        navigator.geolocation.watchPosition(
            (location) => {
                this.position = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                }
            },
            () => {
                console.error("Location error!")
            },
            geolocationOptions
        )


        this.map = L.map(elem).setView([this.position.lat, this.position.lng], 15)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(this.map)

        document.getElementsByClassName('leaflet-control-attribution' )[0].style.display = 'none'

        var originalInitTile = L.GridLayer.prototype._initTile
        L.GridLayer.include({
            _initTile: function (tile) {
                originalInitTile.call(this, tile)

                var tileSize = this.getTileSize()

                tile.style.width = tileSize.x + 2 + 'px'
                tile.style.height = tileSize.y + 2 + 'px'
            }
        })

        document._map = this
        return true
    }
}