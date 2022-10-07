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
const url = "https://server.zonewarz.com"
const socket = io(url)

function ready(socket){
    socket.on("popup", (msg) => {
        document.popup(msg)
    })
    socket.on("GameData", (data) => {
        window.location = "/game"
    })
}

socket.on('connect', () => {
    const session = localStorage.getItem("session")
    socket.emit("session", session)

    socket.on("session", (session) => {
        localStorage.setItem("session", session)

        ready(socket)
    })
})

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

    function getShrink(){

        if(document.getElementById('speedSlow').checked == true){
            var shrinkOn = true
            var speedShrink = 1
            return {shrinkOn, speedShrink}
        }else if(document.getElementById('speedMedium').checked == true){
            var shrinkOn = true
            var speedShrink = 2
            return {shrinkOn, speedShrink}
        }else if(document.getElementById('speedFast').checked == true){
            var shrinkOn = true
            var speedShrink = 3
            return {shrinkOn, speedShrink}
        } else{
            var shrinkOn = false
            return {shrinkOn, speedShrink:0}
        }
    }

    var zone = getShrink()

    const gameData = {
        HostGame: document.forms['hostNameForm']['hostName'].value,
        
        HideTime: Number(document.forms['gameSettings']['htTime'].value),
        ZoneShrink: zone.shrinkOn,
        ShrinkSpeed: Number(zone.speedShrink),
        HeartBeatSensor: document.getElementById('heartBeat').checked,


        lon: Number(document.mapCenter.lng),
        lat: Number(document.mapCenter.lat),
        radius: Number(document.circleRadius),
    }

    socket.emit("HostGame", gameData.HostGame,
    {
        HideTime: gameData.HideTime,
        ZoneShrink: gameData.ZoneShrink,
        ShrinkSpeed: gameData.ShrinkSpeed,
        HeartBeatSensor: gameData.HeartBeatSensor
    },
    
    {
        lon: gameData.lon,
        lat: gameData.lat
    }, gameData.radius)

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

const joinGameSubmit = document.getElementById("joinGameSubmit")
const unameInput = document.getElementById("joinGametext")
const GIDinput = document.getElementById("GID")

joinGameSubmit.onclick = () => {
    socket.emit("JoinGame", GIDinput.value, unameInput.value)
}
