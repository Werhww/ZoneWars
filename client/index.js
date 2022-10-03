function handlePermission() {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        report(result.state);
        geoBtn.style.display = 'none';
      } else if (result.state === 'prompt') {
        report(result.state);
        geoBtn.style.display = 'none';
        navigator.geolocation.getCurrentPosition(revealPosition,positionDenied,geoSettings);
      } else if (result.state === 'denied') {
        report(result.state);
        geoBtn.style.display = 'inline';
      }
      result.addEventListener('change', () => {
        report(result.state);
      });
    });
}

handlePermission()


function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((postion)=>{resolve(postion.coords)});
        } else {
            reject()
        }
    })
}


async function init(){
    const postion = await getLocation()
    console.log(postion)
    const mapPlacement = L.map('mapPlacement').setView([postion.latitude, postion.longitude], 13)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(mapPlacement)

    var circle = L.circle([60.4, 5.3], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 100
    }).addTo(mapPlacement)

    mapPlacement.addEventListener('mousemove', ()=>{
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

    document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';
}

init()