import { LeafletMap } from "./map.js";  

const map = new LeafletMap()

const leaveGame = document.getElementById("leave2")
const playersLobby = document.getElementById("playerList")

const startButton = document.getElementById("start")
const leaveLobby = document.getElementById("leave")

const lobby = document.getElementById("lobby")
const game = document.getElementById("game")

const stopGame = document.getElementById("stopgame")


function GameStart(socket, map){
    map.CenterMap()
}

function GameEnd(socket, map){

}

const playerMap = {}

function GameRunning(data, socket, map){
    function AddNew(player){
        const type = player.username == data.self.username ? "self" : "friend"
        playerMap[player.username].marker =  map.AddPlayerMarker(player.username, map.ConvertPosition(player.position), type)
    }

    function RemovePlayer(player){

    }

    const players = data.players
    players.push(data.self)

    for (var player of players){
        if (!playerMap[player.username]){
            AddNew(player)
            playerMap[player.username] = player
            continue
        }

        playerMap[player.username].marker.setLatLng(map.ConvertPosition(playerMap[player.username].position))
    }

    for (var username in playerMap){
        if (players.filter((item) => username == item.username).length < 1){
            RemovePlayer(playerMap[username])
        }
    }
}

function GameLobby(data, socket){
    function AddNew(player){
        playersLobby.innerHTML += `<div class="player" id="${player.username}">
            <p>${player.username}</p>
        </div>`
    }

    function RemovePlayer(player){
        playersLobby.getElementById(player.username).remove()
    }

    const playerMap = {}

    const players = data.players
    players.push(data.self)

    for (var player of players){
        if (!playerMap[player.username]){
            AddNew(player)
            playerMap[player.username] = player
        }
    }

    for (var username in playerMap){
        if (players.filter((item) => username == item.username).length < 1){
            RemovePlayer(playerMap[username])
        }
    }
}


function ready(socket, map, init) {
    document.getElementById("id").innerText = init.GID

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
        if (data.started) {
            GameRunning(data, socket, map)
        } else {
            GameLobby(data, socket)
        }

        if (data.started == true && n == false){
            game.style.visibility = "visible"
            lobby.style.display = "none"

            n = true
            GameStart(socket, map)
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
    })
}




map.init("gameMap").then(() => {
    map.CenterMap()

    const socket = io("http://localhost:3000")
    socket.on('connect', () => {
        const session = localStorage.getItem("session")
        socket.emit("session", session)

        socket.on("session", (session) => {
            localStorage.setItem("session", session)
            
            socket.once("GameData", (data) => ready(socket, map, data))
        })
    })
})
