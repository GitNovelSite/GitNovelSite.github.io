function showMessageBox(message, options) {
    var color = [,
        "#32cd32", //MES_SUCCESS
        "#f0e68c", //MES_WARN
        "#ff0000", //MES_ERROR
        "#00bfff", //MES_INFO
    ];
    var box = document.createElement("div");
    box.style.position = "fixed";
    box.style.width = 80 + 10 * message.length + "px";
    box.style.height = "24px";
    box.style.top = "5px";
    box.innerHTML = "<b>" + message + "</b>";
    box.style["background-color"] = "white";
    box.style.border = "2px dotted " + color[options];
    box.style["border-radius"] = "10px";
    box.style["font-size"] = "0.8em";
    box.style["text-align"] = "center";
    box.style["opacity"] = 0.8;
    box.style["left"] = "40%";

    setTimeout(function() {
        document.body.removeChild(box);
        //10s后移除通知

        msb_removeMessageListener(func_id);
        //移除监听器
    }, 10 * 1000);
    for (var i = 0; i < _msb_messagelistener.length; i++) {
        _msb_messagelistener[i]();
    };
    //发布事件通知

    if (_msb_messagelistener.length) {
        setTimeout(function() {
            document.body.appendChild(box);
            var sti = setInterval(function() {
                box.style["top"] = parseInt(box.style["top"]) + 1 + "px";
                //新的消息从顶向下每1/25s(40ms)移动1px 移到正常显示位置top:30px
            }, 40);
            setTimeout(function() {
                clearInterval(sti);
            }, 1000);
        }, 1080);
        //1.08s后显示消息
    } else {
        //如果length(listener) = 0 没有绑定事件 即第1条消息 不设发送延时
        document.body.appendChild(box);
        var sti = setInterval(function() {
            box.style["top"] = parseInt(box.style["top"]) + 1 + "px";
            //新的消息从顶向下每1/25s(40ms)移动1px 移到正常显示位置top:30px
        }, 40);
        setTimeout(function() {
            clearInterval(sti);
        }, 1000);
    }
    func_id = msb_addMessageListener(function() {
        var sti = setInterval(function() {
            box.style["top"] = parseInt(box.style["top"]) + 1 + "px";
            //收到新消息时，每1/40s(25ms)向下移动1px（给新的消息移出位置）
        }, 25);
        setTimeout(function() {
            clearInterval(sti);
            //1s后停止
        }, 1000);
    });
};

function msb_addMessageListener(func) {
    window._msb_messagelistener.push(func);
    return window._msb_messagelistener.length - 1;
};

function msb_removeMessageListener(id) {
    window._msb_messagelistener.splice(id, 1);
}
window._msb_messagelistener = [];
const MES_SUCCESS = 1;
const MES_WARN = 2;
const MES_ERROR = 3;
const MES_INFO = 4;

function tellUser(msg, status) {
    if (typeof(status) == "undefined" || !status) {
        status = MES_INFO;
    }
    if (window.isLoadingBasicHTML || 0) {
        alert([, "SUCCESS:", "WARN:", "ERROR:", "INFO:"][status] + msg);
    } else showMessageBox(msg, status);
}