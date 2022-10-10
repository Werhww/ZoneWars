//Main Screen Buttons
const landing_host = document.getElementById('landing-host')
const landing_join = document.getElementById('landing-join')

// Menus
const landing_page = document.getElementById('landing-page')
const host_name = document.getElementById('host-name')
const host_map = document.getElementById('host-map')
const host_GameSettings = document.getElementById('host-GameSettings')

const join_page = document.getElementById('join')

//Button
const host_back = document.getElementById('host-back')
const join_back = document.getElementById('join-back')
const host_map_next = document.getElementById('host-map-next')
const host_map_back = document.getElementById('host-map-back')
const settingback = document.getElementById('back')


// Cool
const join_submit = document.getElementById("join-submit")
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

landing_host.addEventListener('click', ()=>{
    landing_page.style.display = 'none'
    host_name.style.display = 'flex'
})

function fetchHostName(){
    const userName = document.forms['host-name-form']['host-name'].value;
    if (userName == "" || userName.includes(" ")){
        alert("Name must be filled out");
        return false;
    }
    
    host_name.style.display = 'none'
    host_map.style.display = 'flex'

    return false
}

const params = (new URL(location)).searchParams
const join = params.get("join")

if (join){
    landing_page.style.display = 'none'
    join_page.style.display = 'flex'

    GIDinput.value = join
}

host_back.addEventListener('click', ()=>{
    landing_page.style.display = 'flex'
    host_name.style.display = 'none'
})

host_map_back.addEventListener('click', ()=>{
    host_name.style.display = 'flex'
    host_map.style.display = 'none'
})

host_map_next.addEventListener('click', ()=>{
    host_map.style.display = 'none'
    host_GameSettings.style.display = 'flex'
})

settingback.addEventListener('click', ()=>{
    host_GameSettings.style.display = 'none'
    host_map.style.display = 'flex'
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

landing_join.addEventListener('click', ()=>{
    landing_page.style.display = 'none'
    join_page.style.display = 'flex'
})

join_back.addEventListener('click', ()=>{
    landing_page.style.display = 'flex'
    join_page.style.display = 'none'
})


join_submit.onclick = () => {
    socket.emit("join", GIDinput.value, unameInput.value)
}
