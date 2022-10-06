const popup = document.getElementById('popup')
const popup_text = document.getElementById('popup-text')
const popup_exit = document.getElementById('popup-exit')
const popup_blur = document.getElementById('popup-blur')

function popup_message(message){
    popup.style.display = 'flex'
    popup_blur.style.display = 'flex'
    popup_text.innerText = message
}

popup_exit.addEventListener('click', ()=>{
    popup.style.display = 'none'
    popup_blur.style.display = 'none'
})

popup_blur.addEventListener('click', ()=>{
    popup.style.display = 'none'
    popup_blur.style.display = 'none'
})