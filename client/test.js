const mapPlacement = L.map('mapPlacement').setView([53, 55], 13)

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(mapPlacement)