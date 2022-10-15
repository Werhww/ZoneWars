const popup = document.getElementById('popup')
const popupText = document.getElementById('popup-text')


function recreateNode(el, withChildren) {
    if (withChildren) {
      el.parentNode.replaceChild(el.cloneNode(true), el)
    }
    else {
      var newEl = el.cloneNode(false)
      while (el.hasChildNodes()) newEl.appendChild(el.firstChild)
      el.parentNode.replaceChild(newEl, el)
    }
}

function popup_message(message, cantclose = false){

    // This prevents the page from scrolling down to where it was previously.
    if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    }
    // This is needed if the user scrolls down during page load and you want to make sure the page is scrolled to the top once it's fully loaded. This has Cross-browser support.
    window.scrollTo(0,0)
    
    const popup_exit = document.getElementById('popup-exit')
    const popup_blur = document.getElementById('popup-blur')  

    popup.style.display = 'flex'
    popup_blur.style.display = 'flex'
    popupText.innerText = message.message
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