import { LeafletMap } from "./map.js";  

const map = new LeafletMap()

const leaveGame = document.getElementById("leave2")
const playersLobby = document.getElementById("playerList")

const startButton = document.getElementById("start")
const leaveLobby = document.getElementById("leave")

const lobby = document.getElementById("lobby")
const game = document.getElementById("game")

const stopGame = document.getElementById("stopgame")

const url = "http://10.0.0.9:3000"

function GameStart(socket, map, init){
    map.CenterMap()

    // ! What is  daFAKewakfaklnLKJFeklj
    map.CreateSetZone(map.ConvertPosition({
        lat: init.center.lon,
        lon: init.center.lat
    }), init.radius)
}

function GameEnd(socket, map){

}

const LobbyPlayerMap = {}
const GamePlayerMap = {}

function GameRunning(data, socket, map){
    function AddNew(player){
        const type = player.username == data.self.username ? "self" : "friend"

        GamePlayerMap[player.username].marker = map.AddPlayerMarker(player.username, map.ConvertPosition(player.position), type)
    }

    function RemovePlayer(player){
        GamePlayerMap[player.username].marker.removeFrom(map)
    }

    const players = data.players
    players.push(data.self)

    for (var player of players){
        if (!GamePlayerMap[player.username]){
            GamePlayerMap[player.username] = player
            AddNew(player)
            continue
        }

        GamePlayerMap[player.username].marker.setLatLng(map.ConvertPosition(player.position))
    }

    for (var username in GamePlayerMap){
        if (players.filter((item) => username == item.username).length < 1){
            RemovePlayer(GamePlayerMap[username])
        }
    }

    map.SetZoneRadius(data.radius)
}



function GameLobby(data, socket){
    function AddNew(player){
        playersLobby.innerHTML += `<div class="player" id="PUUID-${player.username}">
            <p>${player.username}</p>
        </div>`
    }

    function RemovePlayer(player){
        document.getElementById(`PUUID-${player.username}`).remove()
        delete LobbyPlayerMap[username]
    }

    const players = data.players
    players.push(data.self)

    for (var player of players){
        if (!LobbyPlayerMap[player.username]){
            AddNew(player)
            LobbyPlayerMap[player.username] = player
        }
    }

    for (var username in LobbyPlayerMap){
        if (players.filter((item) => username == item.username).length < 1){
            RemovePlayer(LobbyPlayerMap[username])
        }
    }
}


function ready(socket, map, init) {
    document.getElementById("id").innerText = init.GID

    socket.on("GameEnd", () => {
        window.location.href = "/client"
    })

    setInterval(() => {
        socket.emit("UpdatePosition", {
            lon: map.position.lng,
            lat: map.position.lat
        })
    }, 5000)

    startButton.onclick = () => {
        socket.emit("StartGame")
    }

    stopGame.onclick = () => {
        socket.emit("ResetGame")
    }

    leaveLobby.onclick = () => {
        if (init.self.host){
            socket.emit("EndGame")
        }
        socket.emit("LeaveGame")
        window.location.href = "/client/"
    }

    leaveGame.onclick = () => {
        socket.emit("LeaveGame")
        window.location.href = "/client/"
    }

    if (init.self.host) {
        leaveGame.style.display = "none"
        stopGame.style.display = "flex"
    } else {
        stopGame.style.display = "none"
        leaveGame.style.display = "flex"
    } 

    var n = !init.started
    socket.on("GameData", (data) => {

        if (data.started == true && n == false){
            game.style.visibility = "visible"
            lobby.style.display = "none"
    
            n = true
            GameStart(socket, map, data)
        }
        else if (data.started == false && n == true){
            n = false
            lobby.style.display = "flex"
            game.style.visibility = "hidden"

            GameEnd(socket, map)
        }

        if (data.self.host == true){
            startButton.style.display = "flex"
        }

        if (data.started) {
            GameRunning(data, socket, map)
        } else {
            GameLobby(data, socket)
        }
    })
}




map.init("gameMap").then(() => {
    map.CenterMap()

    const socket = io(url)
    socket.on('connect', () => {

        const session = localStorage.getItem("session")
        socket.emit("session", session)

        socket.on("session", (session) => {
            console.log("connect")
            localStorage.setItem("session", session)
            
            socket.once("GameData", (data) => ready(socket, map, data))
        })
    })
})
