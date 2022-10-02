var map = L.map('map').setView([60.4, 5.3], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

var circle = L.circle([60.4, 5.3], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 100
}).addTo(map);

map.addEventListener('mousemove', ()=>{
    circle.setLatLng(map.getCenter())
});

document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';


const mapsize = document.getElementById('mapsize')

mapsize.oninput = function() {
    console.log(this.value)
    circle.setRadius(this.value)
  }