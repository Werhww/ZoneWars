const creatGamebtn = document.getElementById('creatGamebtn')
const joinGamebtn = document.getElementById('joinGamebtn')
const settingbtn = document.getElementById('settingbtn')

const mainScreen = document.getElementById('mainScreen')
const creatGameMenu = document.getElementById('creatGameMenu')

creatGamebtn.addEventListener('click', ()=>{
    mainScreen.style.display = 'none'
    creatGameMenu.style.display = 'flex'
})