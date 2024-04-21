let points, round, locationId, clickedLatLng, line, realMarker
let roundActive = false
let roundPoints = []
let roundDistances = []

function startGame(src='home') {

    if (src === 'home') {
        $('.splash').fadeOut();
        $('.ver').hide();
        $('.game').css('visibility', 'visible')
    } else if (src === 'again') {
        $('.finished').fadeOut();
        $('.game').show();
        $('.finished, .finished *:not(".finish-stats"):not(".ignore")').hide();
        $('.points').text('0 points')
    }

    points = 0;
    round = 0;

    newImage()

}

function newImage() {

    if (line) map.removeLayer(line)
    const numOfImgs = Object.keys(locations).length
    locationId = Math.floor(Math.random() * numOfImgs) + 1;
    $('.game-image').css('background-image', `url("img/${locationId}.png")`)
    $('.confirm').removeClass('next-round').text('CONFIRM').hide();
    $('.distance').hide();
    if (currentMarker) {
        map.removeLayer(currentMarker)
        map.removeLayer(realMarker)
    }

    map.setView([40.507476,-74.4541267], 13)

    roundActive = true;
    round++;
    $('.round').text(`ROUND ${round}/5`)
}

function confirm() {

    const realLoc = locations[locationId].latlng

    console.log('realLoc:', realLoc)
    console.log('clickedLatLng:', clickedLatLng)

    const clickedPoint = turf.point([clickedLatLng.lng, clickedLatLng.lat]);

    const dist = parseInt(turf.distance(realLoc, clickedPoint, {units: 'meters'}));
    roundDistances.push(dist)
    let pts = 5025 - parseInt(dist)

    if (pts > 5000) { pts = 5000; }
    if (pts < 0) { pts = 0; }

    $('.distance').text(`${dist}m away +${pts} points`).show();

    points += pts
    $('.points').text(points + ' points')
    roundPoints.push(pts)

    const realLatLng = L.latLng(realLoc[1], realLoc[0]);
    const clickedLatLngLeaflet = L.latLng(clickedLatLng.lat, clickedLatLng.lng);

    line = L.polyline([realLatLng, clickedLatLngLeaflet], {'color': 'red'}).addTo(map);

    let bounds = L.latLngBounds(realLatLng, clickedLatLngLeaflet);
    map.fitBounds(bounds);

    realMarker = L.marker(realLatLng).addTo(map);

    let confText = 'NEXT ROUND'
    if (round == 5) confText = 'FINISH GAME'

    $('.confirm').addClass('next-round').text(confText)

    roundActive = false
}

function finishGame() {

    $('.game').hide();
    $('.finished').show();

    $('.game-stats-title').fadeIn();

    setTimeout(() => {
        roundDistances.forEach((dist, idx) => {
            const delay = idx * 1150; // increase delay by 100ms for each iteration
            setTimeout(() => {
                $(`.r${idx + 1}`).text(`Round ${idx + 1}: ${dist}m away`).slideDown('slow');
    
                if (idx == 4) {
                    setTimeout(() => {
                        $('.total-points').text(points + ' points!').slideDown();
                        setTimeout(() => {
                            $('.play-again').fadeIn();
                        }, 500);
                    }, 1500);
                }
    
            }, delay);
        });
    }, 1000);

    // $('.game').css('visibility', 'visible')
}

$(document).ready(function() {
    
    $('.game-image').on('mouseenter', function() {
        $(this).css('width', '550px')
        $(this).css('height', '450px')
    })   
    $('.game-image').on('mouseleave', function() {
        $(this).css('width', '350px')
        $(this).css('height', '250px')
    })  
    
    $('.confirm').click(function() {

        if (roundActive) {
            confirm();
        } else if (round == 5) {
            finishGame();
        } else {
            newImage();
        }

    })

})