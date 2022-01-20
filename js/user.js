function getusername() {
    var token = localStorage.getItem("token");
    if (token == null)
        return null;
    token = token.split("#");
    var username = atob(token[0]);
    var ip = atob(token[1]);
    time = parseInt(new Date().getTime() / 1000 / 60 / 60 / 3);
    // 1000ms * 60secs * 60mins * 3hs

    var md5 = token[2];

    var md5_obj = new SparkMD5();
    md5_obj.append("username" + username + ":" + "ipv4" + ip + ":" + "time" + time + "@GitNovelSite.github.io@117.eb160de1de89d9058fcb0b968dbbbd68");
    var calc_md5 = md5_obj.end();

    if (calc_md5 == md5) {
        return username;
    } else {
        localStorage.removeItem("token");
        console.warn("Token expired");
        if (window.isLoadingBasicHTML || 0) {
            alert("Token expired.\nPlease login");
        } else showMessageBox("Token expired.", MES_ERROR);
    };
    return null;
};

function storeUsername(username) {
    var ip = sessionStorage.getItem("ip");
    time = parseInt(new Date().getTime() / 1000 / 60 / 60 / 3);
    // 1000ms * 60secs * 60mins * 3hs
    var md5_obj = new SparkMD5();
    md5_obj.append("username" + username + ":" + "ipv4" + ip + ":" + "time" + time + "@GitNovelSite.github.io@117.eb160de1de89d9058fcb0b968dbbbd68");
    var calc_md5 = md5_obj.end();
    localStorage.setItem("token", btoa(username) + "#" + btoa(ip) + "#" + calc_md5);
};

function logout() {
    for (var key in sessionStorage) {
        sessionStorage.removeItem(key);
    };

    for (var key in localStorage) {
        localStorage.removeItem(key);
    };
}