const xpString = localStorage.getItem('xp');
let xp = parseInt(xpString);
if (isNaN(xp)) xp = 0; 
let fakeXp = xp

const xpReq = {
    1: 0,
    2: 10, // +15
    3: 35, // +25
    4: 70, // +35
    5: 120, // +50
    6: 200, // +80
    7: 300, // +100
    8: 450, // +150
    9: 650, // +200
    10: 900, // +300
    11: 1300, // +400
    12: 1800, // +500
    13: 2400, // +600
    14: 3100, // +700
    15: 3900, // +800
}

let level, fakeLvl

function updateLevel(useFake) {
    
    let levelCalc = 1;

    let useXp

    if (useFake) {
        useXp = fakeXp
    } else {
        useXp = xp
    }

    for (let lvl in xpReq) {
        if (useXp >= xpReq[lvl]) {
            levelCalc = parseInt(lvl);
        } else {
            break;
        }
    }

    console.log(levelCalc)

    if (useFake === true) {
        fakeLvl = levelCalc
    } else {
        level = levelCalc
    }

}

function addXp(toAdd, useFake, updateBar=true) {
    if (useFake === true) {
        console.log('adding ' + toAdd + ' fake xp')
        setXp(fakeXp+toAdd, useFake, updateBar=updateBar)
    } else {
        console.log('adding ' + toAdd + ' real xp')
        setXp(xp+toAdd, useFake, updateBar)
    }
}

function setXp(newXp, useFake, updateBar=true) {

    if (useFake === true) {
        fakeXp = newXp
        console.log('setting fake xp to ' + newXp)
    } else {
        xp = newXp
        console.log('setting real xp to ' + newXp)
    }

    updateLevel(useFake)

    if (updateBar === true) {
        console.log('set xp triggered updateprogressbar')
        updateProgressBar(useFake)
    }

    localStorage.setItem('xp', xp);

}

$(document).ready(function() {
     
    updateLevel()
    updateProgressBar()

})

function updateProgressBar(useFake) {

    let useLvl, useXp

    if (useFake) {
        useLvl = fakeLvl
        useXp = fakeXp
    } else {
        useLvl = level
        useXp = xp
    }

    $('.xp-current').text(useLvl)
    $('.xp-needed').text(useLvl+1)

    const neededXp = xpReq[useLvl + 1] - xpReq[useLvl]
    const hasXp = useXp - xpReq[useLvl]
    const progressPercent = hasXp/neededXp*100
    $('.level-progress').width(progressPercent + '%')

    console.log('updating progress bar with ' + progressPercent + ' percent')

}

