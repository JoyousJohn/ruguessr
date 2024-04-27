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

    let levelDiff = 0
    if (useFake === true) {
        console.log('currentLevel: ' + fakeLvl + ' newLevel: ' + levelCalc)
        levelDiff = levelCalc - fakeLvl
        fakeLvl = levelCalc
    } else {
        console.log('currentLevel: ' + level + ' newLevel: ' + levelCalc)
        levelDiff = levelCalc - level
        level = levelCalc
    }

    console.log('levelDiff: ', levelDiff)

    return levelDiff

}

function addXp(toAdd, useFake, updateBar=true) {
    if (useFake === true) {
        // console.log('adding ' + toAdd + ' fake xp')
        setXp(fakeXp+toAdd, useFake, updateBar=updateBar)
    } else {
        // console.log('adding ' + toAdd + ' real xp')
        setXp(xp+toAdd, useFake, updateBar)
    }
}

function setXp(newXp, useFake, updateBar=true) {

    if (useFake === true) {
        fakeXp = newXp
        // console.log('setting fake xp to ' + newXp)
    } else {
        xp = newXp
        // console.log('setting real xp to ' + newXp)
    }

    const levelDiff = updateLevel(useFake)

    if (updateBar === true) {
        // console.log('set xp triggered updateprogressbar')
        updateProgressBar(useFake, levelDiff)
    }

    localStorage.setItem('xp', xp);

}

$(document).ready(function() {
     
    updateLevel()
    updateProgressBar()

})

function barTransitionSec() {
    return parseFloat($('.level-progress').css('transition-duration'));
}

function updateProgressBar(useFake, levelDiff=0) {

    let useLvl, useXp

    if (useFake) {
        useLvl = fakeLvl
        useXp = fakeXp
    } else {
        useLvl = level
        useXp = xp
    }

    const neededXp = xpReq[useLvl + 1] - xpReq[useLvl]
    const hasXp = useXp - xpReq[useLvl]
    const progressPercent = hasXp/neededXp*100


    console.log('levelDiff input: ', levelDiff)

    if (levelDiff > 0) {

        const currBarTransition = barTransitionSec()
        const tempBarTransition = currBarTransition/levelDiff
        $('.level-progress').css('transition-duration', tempBarTransition + 's')

        $('.level-progress').width('100%')

        const oldLvl = useLvl - levelDiff

        for (let loopLvl = 0; loopLvl < levelDiff+1; loopLvl++) {

            // $('.level-progress').css('transition-duration', '0')
            // $('.level-progress').width('0%')

            console.log('timeout to get to lvl ' + (oldLvl + loopLvl) + ': ' + tempBarTransition * loopLvl * 1000 + 'ms')

            setTimeout(() => {

                if (loopLvl !== 0) { // Don't reset current level progress to 0
                    $('.level-progress').css('transition-duration', '0s')
                    $('.level-progress').width('0%')
                }

                setTimeout(() => { // Requires a delay to properly finish animating to width 0% first
                    console.log('setting .xp-current lvl to: ' + (oldLvl + loopLvl));
                    $('.level-progress').css('transition-duration', tempBarTransition + 's');

                    if (oldLvl + loopLvl === useLvl) {
                        $('.level-progress').width(progressPercent + '%')
                        $('.level-progress').css('transition-duration', currBarTransition + 's') // Last animation, to reset duration
                        console.log('resetting bar trans dur to ' + currBarTransition + 's')
                    } else {
                        $('.level-progress').width('105%');
                    }

                    $('.xp-current').text(oldLvl + loopLvl);
                    $('.xp-needed').text(oldLvl + loopLvl + 1);
                }, 1); 

            }, tempBarTransition * loopLvl * 1000);

        }


    // Else if level doesn't change
    } else {

        $('.xp-current').text(useLvl)
        $('.xp-needed').text(useLvl+1)
        $('.level-progress').width(progressPercent + '%')
        console.log('updating progress bar with ' + progressPercent + ' percent')

    }


}

