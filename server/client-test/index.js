const socket = io()

socket.emit("HostGame", "powerkuu", {
    lon: 10,
    lat: 10
}, 20)  

socket.on("GameJoin", (data) => {
    console.log("hello", data)
})

socket.on("GameData", (data) => {
    console.log(data.time - data.inZoneTime)
})

document.getElementById("start").onclick = () => {
    socket.emit("StartGame")
}

document.getElementById("position").onclick = () => {
    socket.emit("UpdatePosition", {
        lon: 10,
        lat: 10
    })
}