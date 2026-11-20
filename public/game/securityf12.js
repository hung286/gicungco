
      
document.addEventListener('contextmenu', e => e.preventDefault());


document.addEventListener('keydown', e => {
    if (e.keyCode === 123 || 
       (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
       (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }
});
    
