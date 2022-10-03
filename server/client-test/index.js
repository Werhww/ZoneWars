const socket = io()

function ready(socket) {
    socket.on("GameJoin", (data) => {
        console.log("GameJoin", data)
    })
    
    socket.on("GameOver", (data) => {
        console.log("GameOver")
    })
    
    socket.on("GameData", (data) => {
        console.log(data)
    })
    
    
    document.getElementById("host").onclick = () => {
        console.log("emit")
        socket.emit("HostGame", "powerkuu",
        {
            HideTime: 10000,
            ZoneShrink: true,
            ShrinkSpeed: 1,
            HeartBeatSensor: false
        },
        
        {
            lon: 10,
            lat: 10
        }, 20)
    }
    
    
    document.getElementById("start").onclick = () => {
        socket.emit("StartGame")
    }
    
    document.getElementById("position").onclick = () => {
        socket.emit("UpdatePosition", {
            lon: 10,
            lat: 10
        })
    }
    
    document.getElementById("position2").onclick = () => {
        socket.emit("UpdatePosition", {
            lon: 10,
            lat: 15
        })
    }
    
    document.getElementById("leave").onclick = () => {
        socket.emit("LeaveGame")
    }
    
    document.getElementById("end").onclick = () => {
        socket.emit("EndGame")
    }
}

socket.on('connect', () => {
    const session = localStorage.getItem("session")
    socket.emit("session", session)

    socket.on("session", (session) => {
        localStorage.setItem("session", session)
        ready(socket)
    })
})