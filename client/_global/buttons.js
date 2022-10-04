//Main Screen Buttons
const creatGamebtn = document.getElementById('creatGamebtn')
const joinGamebtn = document.getElementById('joinGamebtn')
const settingbtn = document.getElementById('settingbtn')

// Menus
const mainScreen = document.getElementById('mainScreen')
const creatGameMenu = document.getElementById('creatGameMenu')
const creatGameMapPlacement = document.getElementById('creatGameMapPlacement')
const creatGameSettings = document.getElementById('creatGameSettings')

//Button
const mapback = document.getElementById('mapBack')
const mapnext = document.getElementById('mapNext')

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

mapback.addEventListener('click', ()=>{
    creatGameMenu.style.display = 'flex'
    creatGameMapPlacement.style.display = 'none'

})

mapnext.addEventListener('click', ()=>{
    creatGameMapPlacement.style.display = 'none'
    creatGameSettings.style.display = 'flex'

})

function gameback(){
    creatGameSettings.style.display = 'none'
    creatGameMapPlacement.style.display = 'flex'

    return false
}

function gameStart(){
    window.location.href = "./game";

    return false
}
