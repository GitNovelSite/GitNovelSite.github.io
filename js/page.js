function loadBasicPage() {
    setTimeout(function() {

        window.isLoadingBasicHTML = false;
        var obj = parseURLHash();
        ajax("/pageshow/" + (isMobile() ? "mobile" : "computer") + "/" + obj.page).then(function(arr) {
            //timeout = Math.random() * 4000;
            timeout = 1;
            setTimeout(function() {
                var page_content = arr[1];
                if (!window.isLoadingBasicHTML) {
                    ajax("/pagejs/" + obj.page).then(function(arr) {
                        var page_js = arr[1];
                        var username = getusername();
                        document.body.innerHTML = "If the page cannot be displayed, please close the AdBlock plugin and <a href=# onclick=javascript:location.reload();>refresh</a> the page.<br><div id=pageview></div>";
                        document.querySelector("#pageview").innerHTML = fillTemplate(page_content, [
                            [
                                "username", username
                            ]
                        ]);
                        if (username === "null" || username === null) {
                            document.querySelector("#_login_operation").innerHTML = "<a href=/login>注册/登录</a>";
                            document.querySelector("#username").innerHTML = "尚未登录";
                        }
                        eval(page_js);
                        if (typeof(PAGE_JS_MAIN) !== "undefined") {
                            PAGE_JS_MAIN();
                        };
                    }).catch(function(err) {
                        console.error(err);
                        document.body.innerHTML = "If the page cannot be displayed, please close the AdBlock plugin and <a href=# onclick=javascript:location.reload();>refresh</a> the page.<br><div id=pageview></div>";
                        document.querySelector("#pageview").innerHTML = "An error was encountered while loading the page:" + err[1] || err.message || err;
                    });
                }
            }, ((timeout > 1200) ? timeout - 2400 : timeout) & 0);
        }).catch(function(err) {
            if (!window.isLoadingBasicHTML) {
                console.error(err);
                document.body.innerHTML = "If the page cannot be displayed, please close the AdBlock plugin and <a href=# onclick=javascript:location.reload();>refresh</a> the page.<br><div id=pageview></div>";
                document.querySelector("#pageview").innerHTML = "An error was encountered while loading the page:" + err[1] || err.message || err;
            }
        });
    }, 1200);
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

    if (username === "null" || username === null) {
        document.querySelector("#_login_operation").innerHTML = "<a href=/login?return_uri=" + location.href + ">注册/登录</a>";
        document.querySelector("#username").innerHTML = "尚未登录";
    }
};

function loadPage() {
    if (window.isLoadingBasicHTML) {
        loadBasicHTML();
    } else loadBasicPage();
};

function parseURLHash() {
    var hash = location.href.substring(location.origin.length);
    if (hash.substring(0, 9) == "/404.html")
        hash = location.hash.substring(1);
    else if (hash == "" || hash == "/" || hash == "/#") {
        hash = "@";
    }
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
    If the page cannot be displayed, please close the AdBlock plugin and <a href=# onclick=javascript:location.reload();>refresh</a> the page.<br><center><h1>GitNovel</h1></center><hr>用户名<span id=username>{{$username}}</span> <span id=_login_operation><a href=# onclick=javascript:logout();>退出登录</a></span><br>
    `,
    index: `
    <hr>图书馆<a href=/library>戳我</a><br>
    我的书籍<a href=/mybook>戳我</a><br>
    `,
    login: `
    <hr>用户名 <input type=text id=username-input-area placeholder=Username maxlength=24><br>密码 <input type=password id=password placeholder=Password maxlength=16><br><input type=button value=登录 onclick=javascript:login();><br><a href=/register>注册</a>`,
    register: `
    <hr>用户名 <input type=text id=username-input-area placeholder=Username maxlength=24><br>密码 <input type=password id=password placeholder=Password maxlength=16><br>验证密码 <input type=password id=verify_password placeholder='Verify Password' maxlength=16><input type=button value=注册 onclick=javascript:register();><br><a href=/login>登录</a>`,
    library: `
    <hr>这个页面正在建设中......<br> 
    <a href=# onclick=javascript:location.reload();>加载完整页面</a><br>
    <a href=/>主页</a> 
    `
};

function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    };
};
var blob = function(buffer, cfg) {
    if (Blob)
        return new Blob(buffer, cfg);
    else if (BlobBuilder)
        return new BlobBuilder(buffer, cfg);
    else if (WebKitBlobBuilder)
        return new WebKitBlobBuilder(buffer, cfg);
    else if (MozBlobBuilder)
        return new MozBlobBuilder(buffer, cfg);
    else if (MSBlobBuilder)
        return new MSBlobBuilder(buffer, cfg);
    else return null;
};

function backPage() {
    history.go(-1);
    setTimeout(function() {
        location.reload();
    }, 500);
}