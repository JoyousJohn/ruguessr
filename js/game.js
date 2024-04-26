let points, round, locationId, clickedLatLng, line, realMarker
let roundActive = false
let isFinishing = false
let roundPoints = []
let roundDistances = []
let gameImgs = []

const maxPoints = 1000
const threshold = 50

function startGame(src='home') {

    if (src === 'home') {
        $('.splash').fadeOut();
        $('.ver').hide();
        $('.game').css('visibility', 'visible')
    } else if (src === 'again') {
        $('.finished').fadeOut();
        $('.game').show();
        $('.finished, .finished *:not(".finish-stats"):not(".ignore"):not(".ignore *"), .total-points, .play-again').hide(); // temp
        $('.points').text('0 points')
    }

    points = 0;
    round = 0;
    roundDistances = []
    roundPoints = []
    gameImgs = []

    $('.game-image').css('opacity', 1) // Image can have previous half opacity befire "play again"
    $('.finished').addClass('pointer') // If removed by skipping score animation or when anim completed

    genImages()
    newImage()

    setTimeout(() => {
        gameImgVisible = true // Delay so init fit bounds doesn't trigger
    }, 500);

}

function genImages() {
    const numOfImgs = Object.keys(locations).length
    const set = new Set();
    while (set.size < 5) {
        set.add(Math.floor(Math.random() * numOfImgs) + 1);
    }
    set.forEach(i => {
        $('.preload').append($('<img>').attr('src', `img/${i}.png`))
    })
    gameImgs = [...set]; 
}

function newImage() {

    if (line) map.removeLayer(line)
    locationId = gameImgs[round]

    $('.game-image').css('background-image', `url("img/${locationId}.png")`)
    $('.confirm').removeClass('next-round').text('CONFIRM').hide();
    $('.distance').hide();
    if (currentMarker) {
        map.removeLayer(currentMarker)
        map.removeLayer(realMarker)
    }

    map.setView([40.507476,-74.4541267], 13)

    roundActive = true;
    round++; // must be after locationId declaration
    $('.round').text(`ROUND ${round}/5`)

    setTimeout(() => { // wait for setView to finish
        if (isMobile && !gameImgVisible) {
            $('.game-image').width('90%');
            gameImgVisible = true
        }    
    }, 250);
}

function confirm() {

    const realLoc = locations[locationId].latlng
    const clickedPoint = turf.point([clickedLatLng.lng, clickedLatLng.lat]);

    const dist = parseInt(turf.distance(realLoc, clickedPoint, {units: 'meters'}));
    roundDistances.push(dist)
    let pts = maxPoints+threshold - parseInt(dist)

    if (pts > maxPoints) { pts = maxPoints; }
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
    $('.finished').css('display', 'flex');

    $('.game-stats-title').fadeIn();

    isFinishing = true
    fakeLvl = level

    setTimeout(() => {
        roundDistances.forEach((dist, idx) => {
            
            const delay = idx * 1150; // increase delay by 100ms for each iteration
            setTimeout(() => {

                if (isFinishing) {

                    $(`.r${idx + 1}`).text(`Round ${idx + 1}: ${dist}m away`).slideDown('slow');
                    
                    let p = maxPoints - dist
                    if (p < 0) { p = 0 }
                    const xpToAdd = Math.floor(p/100)
                    addXp(xpToAdd, useFake=true)

                    if (idx == 4 && isFinishing) {

                        setTimeout(() => {
                            $('.total-points').text(points + ' points!').slideDown();
                            if (isFinishing) { 
                                setTimeout(() => {
                                    $('.play-again').fadeIn();
                                    isFinishing = false
                                    $('.finished').removeClass('pointer')
                                }, 500);
                            }
                        }, 1500);

                    }

                }

            }, delay);
        });
    }, 1000);

    addXp(Math.floor(points/100), useFake=false, updateBar=false)

}

const isMobile = window.matchMedia("only screen and (max-width: 480px)").matches

$(document).ready(function() {
    
    if (!isMobile) {
        $('.game-image').on('mouseenter', function() {
            $(this).css('width', '550px')
            $(this).css('height', '450px')
        })   
        $('.game-image').on('mouseleave', function() {
            $(this).css('width', '350px')
            $(this).css('height', '250px')
        })  
    } else {
        $('.game-image').click(function() {
            if (!gameImgVisible) {
                $('.game-image').width('90%');
                gameImgVisible = true
            }
        })
    }
    
    $('.confirm').click(function() {

        if (roundActive) {
            confirm();
        } else if (round == 5) {
            finishGame();
        } else {
            newImage();
        }

    })

    $('.finished').click(function() {

        if (!isFinishing) return;

        roundDistances.forEach((dist, idx) => {
            $(`.r${idx + 1}`).text(`Round ${idx + 1}: ${dist}m away`).slideDown('fast');
        })
        $('.total-points').text(points + ' points!').slideDown('fast');
        $('.play-again').fadeIn();
        isFinishing = false

        updateProgressBar()

        $('.finished').removeClass('pointer')

    })

})