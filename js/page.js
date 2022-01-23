function loadBasicPage() {
    setTimeout(function() {

        window.isLoadingBasicHTML = false;
        var obj = parseURLHash();
        ajax("/pageshow/" + obj.page).then(function(arr) {
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
                            document.querySelector("#_login_operation").innerHTML = "<a href=/login?return_uri=" + location.href + ">注册/登录</a>";
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
            }, (timeout > 1200) ? timeout - 2400 : timeout);
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
    `
};