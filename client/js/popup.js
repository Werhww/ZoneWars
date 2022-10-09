const popup = document.getElementById('popup')
const popup_text = document.getElementById('popup-text')


function recreateNode(el, withChildren) {
    if (withChildren) {
      el.parentNode.replaceChild(el.cloneNode(true), el);
    }
    else {
      var newEl = el.cloneNode(false);
      while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
      el.parentNode.replaceChild(newEl, el);
    }
}

function popup_message(message, cantclose = false){
    const popup_exit = document.getElementById('popup-exit')
    const popup_blur = document.getElementById('popup-blur')  

    popup.style.display = 'flex'
    popup_blur.style.display = 'flex'
    popup_text.innerText = message.message
    if (cantclose){
        recreateNode(popup_exit)
        recreateNode(popup_blur)
    } else {  
        popup_exit.addEventListener('click', ()=>{
            popup.style.display = 'none'
            popup_blur.style.display = 'none'
        })
        
        popup_blur.addEventListener('click', ()=>{
            popup.style.display = 'none'
            popup_blur.style.display = 'none'
        })
    }
}


document.popup = popup_message