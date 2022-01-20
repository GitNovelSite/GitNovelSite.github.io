function loadBasicPage() {
    window.isLoadingBasicHTML = false;
    var obj = parseURLHash();
};

function loadBasicHTML() {
    window.isLoadingBasicHTML = true;
    var obj = parseURLHash();
    document.body.innerHTML = "<center><h1>GitNovel</h1></center>"
};

basicHTML = {
    index: `
    
    `
};