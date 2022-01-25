function checkWhiteList() {
    if (sessionStorage.ip) {
        var ip = sessionStorage.ip;
    } else return (async function() {
        getuserip();
        var sti = setInterval(function() {
            if (sessionStorage.ip) {
                clearInterval(sti);
                checkWhiteList();
            }
        });
    })();

    return new Promise(function(resolve, reject) {
        ajax("/file/private/whitelist?random=" + Math.random()).then(function(data) {
            data = JSON.parse(data[1]);
            var matched_flag = false;
            for (var i = 0; i < data["whitelist@gitnovel-config-file"]["ipv4"].length; i++) {
                if (sessionStorage.ip.match(new RegExp(data["whitelist@gitnovel-config-file"]["ipv4"][i]))) {
                    matched_flag = true;
                    break;
                };
            };
            if (!matched_flag) {
                document.body.innerHTML = "ip地址" + sessionStorage.ip + "不在访问白名单内";
                return reject();
            } else document.body.innerHTML = "<center><h1>GitNovel</h1><br>正在加载文件<br>请稍后<br></center><p id=loadBasicHTML style='position:fixed;bottom:0px;right:0px'><!--<a href=# onclick=javascript:loadBasicHTML();>加载基本HTML</a></p>-->";
            return resolve();
        }).catch(function(err) {
            document.body.innerHTML = "Error: Cannot load whitelist";
            return reject();
        });
    });
};

function getuserip() {
    var script_element = document.createElement('script');
    script_element.type = 'text/javascript';
    script_element.src = "https://pv.sohu.com/cityjson";
    document.body.appendChild(script_element);
    var sti = setInterval(function() {
        if (returnCitySN) {
            clearInterval(sti);
            sessionStorage.ip = returnCitySN.cip;
            return;
        };
    }, 200);
};