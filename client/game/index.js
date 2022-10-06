import { LeafletMap } from "./map.js";  

const map = new LeafletMap()

function GameStart(socket, map){
    
}

function ready(socket, map, init) {
    const playersLobby = document.getElementById("playerList")
    const startButton = document.getElementById("start")
    const leaveGame = document.getElementById("leave")

    const lobby = document.getElementById("lobby")
    const game = document.getElementById("game")

    const stopGame = document.getElementById("stopgame")

    document.getElementById("id").innerText = init.GID

    const playerMap = {}

    startButton.onclick = () => {
        socket.emit("StartGame")
    }

    stopGame.onclick = () => {
        socket.emit("ResetGame")
    }

    leaveGame.onclick = () => {
        if (init.self.host){
            socket.emit("EndGame")
        }
        socket.emit("LeaveGame")
        console.log("jasja")
        window.location.href = "/client/"
    }

    function AddNew(player){
        playersLobby.innerHTML += `<div class="player" id="${player.username}">
            <p>${player.username}</p>
        </div>`
    }

    function RemovePlayer(player){
        playersLobby.getElementById(player.username).remove()
    }

    socket.on("GameData", (data) => {
        console.log(data)
        const players = data.players
        players.push(data.self)


        if (data.started == true){
            game.style.visibility = "visible"
            lobby.style.display = "none"

            GameStart(socket, map)
        }

        if (data.started == false){
            lobby.style.display = "flex"
            game.style.visibility = "hidden"
        }

        if (data.self.host == true){
            startButton.style.display = "flex"
        }

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
