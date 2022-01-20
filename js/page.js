function loadBasicPage() {
    window.isLoadingBasicHTML = false;
    var obj = parseURLHash();
};

function loadBasicHTML() {
    window.isLoadingBasicHTML = true;
    var obj = parseURLHash();
    var username = getusername();
    document.body.innerHTML = fillTemplate(basicHTML.basic + basicHTML[obj.page], [
        [
            "username",
            username
        ]
    ]);
};

function loadPage() {
    if (window.isLoadingBasicHTML) {
        loadBasicHTML();
    } else loadBasicPage();
};

function parseURLHash() {
    var hash = location.href.substring(location.origin.length);
    if (hash.substring(0, 9) == "/404.html")
        hash = location.hash;
    return {
        page: hash.split("@")[0] || "index",
        arg: hash.split("@")[1] || ""
    };
};

function fillTemplate(string, options) {
    for (var i = 0; i < options.length; i++) {
        while (string.indexOf("{{$" + options[i][0] + "}}") !== -1) {
            string = string.replace("{{$" + options[i][0] + "}}", options[i][1]);
        };
    };
    return string;
};

basicHTML = {
    basic: `
    <center><h1>GitNovel</h1></center><hr>用户名<span id=username>{{$username}}</span> <a href=# onclick=javascript:logout();>退出登录</a><br>
    `,
    index: `
    <hr>图书馆<a href=/library>戳我</a><br>
    我的书籍<a href=/mybook>戳我</a><br>
    `
};