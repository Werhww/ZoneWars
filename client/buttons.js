//Main Screen Buttons
const creatGamebtn = document.getElementById('creatGamebtn')
const joinGamebtn = document.getElementById('joinGamebtn')

// Menus
const mainScreen = document.getElementById('mainScreen')
const creatGameMenu = document.getElementById('creatGameMenu')
const creatGameMapPlacement = document.getElementById('creatGameMapPlacement')
const creatGameSettings = document.getElementById('creatGameSettings')

const joinGameMenu = document.getElementById('joinGame')

//Button
const backToMainScreen1 = document.getElementById('backToMainScreen1')
const backToMainScreen2 = document.getElementById('backToMainScreen2')
const mapback = document.getElementById('mapBack')
const mapnext = document.getElementById('mapNext')
const settingback = document.getElementById('back')


//Creat Game

creatGamebtn.addEventListener('click', ()=>{
    mainScreen.style.display = 'none'
    creatGameMenu.style.display = 'flex'
})

function fetchHostName(){
    const userName = document.forms['hostNameForm']['hostName'].value;
    if (userName == "" || userName.includes(" ")){
        alert("Name must be filled out");
        return false;
    }
    console.log(userName)
    
    creatGameMenu.style.display = 'none'
    creatGameMapPlacement.style.display = 'flex'

    return false
}

backToMainScreen1.addEventListener('click', ()=>{
    mainScreen.style.display = 'flex'
    creatGameMenu.style.display = 'none'
})

mapback.addEventListener('click', ()=>{
    creatGameMenu.style.display = 'flex'
    creatGameMapPlacement.style.display = 'none'

})

mapnext.addEventListener('click', ()=>{
    creatGameMapPlacement.style.display = 'none'
    creatGameSettings.style.display = 'flex'

})

settingback.addEventListener('click', ()=>{
    creatGameSettings.style.display = 'none'
    creatGameMapPlacement.style.display = 'flex'
})

function gameStart(){
    console.log()

    if(document.getElementById('speedSlow').checked == 'true'){
        shrinkOn = 'true'
        speedShrink = '1'
    }
    if(document.getElementById('speedMedium').checked == 'true'){
        shrinkOn = 'true'
        speedShrink = '2'
    }
    if(document.getElementById('speedFast').checked == 'true'){
        shrinkOn = 'true'
        speedShrink = '2'
    }


    const gameData = {
        HostGame: document.forms['hostNameForm']['hostName'].value,
        
        HideTime: document.forms['gameSettings']['htTime'].value,
        ZoneShrink: shrinkOn,
        ShrinkSpeed: speedShrink,
        HeartBeatSensor: document.getElementById('heartBeat').checked,


        lon: 10,
        lat: 10,
    }


   return false
}


//Join Game

joinGamebtn.addEventListener('click', ()=>{
    mainScreen.style.display = 'none'
    joinGameMenu.style.display = 'flex'
})

backToMainScreen2.addEventListener('click', ()=>{
    mainScreen.style.display = 'flex'
    joinGameMenu.style.display = 'none'
})

