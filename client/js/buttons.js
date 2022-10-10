//Main Screen Buttons
const landingHost = document.getElementById('landing-host')
const landingJoin = document.getElementById('landing-join')

// Menus
const landingPage = document.getElementById('landing-page')
const hostName = document.getElementById('host-name')
const hostMap = document.getElementById('host-map')
const hostGameSettings = document.getElementById('host-GameSettings')

const joinPage = document.getElementById('join')

//Button
const hostBack = document.getElementById('host-back')
const joinBack = document.getElementById('join-back')
const hostMapNext = document.getElementById('host-map-next')
const hostMapBack = document.getElementById('host-map-back')
const settingBack = document.getElementById('back')


// Cool
const joinSubmit = document.getElementById("join-submit")
const unameInput = document.getElementById("join-name")
const GIDinput = document.getElementById("GID")


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

landingHost.addEventListener('click', ()=>{
    landingPage.style.display = 'none'
    hostName.style.display = 'flex'
})

function fetchHostName(){
    const userName = document.forms['host-name-form']['host-name'].value;
    if (userName == "" || userName.includes(" ")){
        alert("Name must be filled out");
        return false;
    }
    
    hostName.style.display = 'none'
    hostMap.style.display = 'flex'

    return false
}

const params = (new URL(location)).searchParams
const join = params.get("join")

if (join){
    landingPage.style.display = 'none'
    joinPage.style.display = 'flex'

    GIDinput.value = join
}

hostBack.addEventListener('click', ()=>{
    landingPage.style.display = 'flex'
    hostName.style.display = 'none'
})

hostMapBack.addEventListener('click', ()=>{
    hostName.style.display = 'flex'
    hostMap.style.display = 'none'
})

hostMapNext.addEventListener('click', ()=>{
    hostMap.style.display = 'none'
    hostGameSettings.style.display = 'flex'
})

settingBack.addEventListener('click', ()=>{
    hostGameSettings.style.display = 'none'
    hostMap.style.display = 'flex'
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
        HostGame: document.forms['host-name-form']['host-name'].value,
        
        HideTime: Number(document.forms['GameSettings']['HideTime-range'].value),
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

landingJoin.addEventListener('click', ()=>{
    landingPage.style.display = 'none'
    joinPage.style.display = 'flex'
})

joinBack.addEventListener('click', ()=>{
    landingPage.style.display = 'flex'
    joinPage.style.display = 'none'
})


joinSubmit.onclick = () => {
    socket.emit("joinGame", GIDinput.value, unameInput.value)
}
