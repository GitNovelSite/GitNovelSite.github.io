function showMessageBox(message, options) {
    var color = [,
        "#32cd32", //MES_SUCCESS
        "#f0e68c", //MES_WARN
        "#ff0000", //MES_ERROR
        "#00bfff", //MES_INFO
    ];
    var box = document.createElement("div");
    box.style.position = "fixed";
    box.style.top = "30px";
    box.style.width = 80 + 10 * message.length + "px";
    box.style.height = "24px";
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
    setTimeout(function() {
        document.body.appendChild(box);
    }, 1080);
    //1.08s后显示通知
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