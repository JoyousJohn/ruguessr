let boundsGroup, districtBounds, map, currentMarker
let gameImgVisible = false

$(document).ready(function() {

    var southWest = L.latLng(40.4550081,-74.4957839), // Define the southwest corner of the bounds
    northEast = L.latLng(40.538852,-74.4074799), // Define the northeast corner of the bounds
    bounds = L.latLngBounds(southWest, northEast); // Create a LatLngBounds object

    map = L.map('map', {
        maxBounds: bounds, // Set the maximum bounds
        maxBoundsViscosity: 1.3, // Optional: Adjust the stickiness of the bounds (1.0 is default)
        zoomControl: false
    }).setView([40.507476,-74.4541267], 14);

    map.setMinZoom(13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGFwcHlqb2huIiwiYSI6ImNsdjY5M29meTBidXkyaXJxYnI1NWpxNzMifQ.FNhHOeMeeiPgbEj_CAe5pA', {
        maxZoom: 20,
        id: 'mapbox/streets-v11',
    }).addTo(map);

    // Add the GeoJSON layer to the map
    var districtsLayer = L.geoJSON(districts, {
        style: function(feature) {
            return {
                color: 'blue',
                fillOpacity: 0.05,
                weight: 3
            };
        }
    }).addTo(map);

    districtBounds = districtsLayer.getBounds();
    
    map.on('click', function(e) {
    
        if (!roundActive) return

        const clickPoint = turf.point([e.latlng.lng, e.latlng.lat]);
        const districtsCollection = turf.featureCollection(districts.features);
    
        let intersectingDistrict = null;
    
        for (const district of districtsCollection.features) {
            const isInside = turf.booleanPointInPolygon(clickPoint, district.geometry);
            if (isInside) {
                intersectingDistrict = district;
                break;
            }
        }
    
        if (intersectingDistrict) {    
            if (currentMarker) { map.removeLayer(currentMarker); }
            currentMarker = L.marker(e.latlng).addTo(map);
            clickedLatLng = e.latlng

            $('.directions').fadeOut();
            $('.confirm').show();
        }

    });

    map.on('movestart', function() {

        if (isMobile && gameImgVisible) {
            $('.game-image').width('30%')
            gameImgVisible = false
        }

    });

})

