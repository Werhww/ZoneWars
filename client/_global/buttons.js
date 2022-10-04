//Main Screen Buttons
const creatGamebtn = document.getElementById('creatGamebtn')
const joinGamebtn = document.getElementById('joinGamebtn')
const settingbtn = document.getElementById('settingbtn')

// Menus
const mainScreen = document.getElementById('mainScreen')
const creatGameMenu = document.getElementById('creatGameMenu')
const creatGameMapPlacement = document.getElementById('')

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
    return false
}

