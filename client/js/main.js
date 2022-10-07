const h = document.getElementById("hTime")
function showVal(val){
    if (val < 200000){
        h.style.color = "rgb(0,255,0)"
    }
    else if (val < 400000){
        h.style.color = "yellow"
    }
    else if (val < 600000){
        h.style.color = "red"
    }

    const mins = Math.floor(val / 60000)
    const secs = Math.floor((val / 1000) - (mins * 60))

    h.innerText = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

showVal(300000)
