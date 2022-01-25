function ajax(url, cfg) {
    if (typeof(cfg) == "undefined" || typeof(cfg) != "object" || !(cfg instanceof Object) || !cfg)
        cfg = {};
    if (typeof(cfg.async) == "undefined") {
        cfg.async = true;
    }
    return new Promise(function(resolve, reject) {
        if (typeof(url) == "undefined" || typeof(url) != "string") {
            return reject(new Error("Invalid URL"));
        }
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else var xhr = new ActiveXObject("Microsoft.XMLHTTP");

        xhr.open(cfg.method ? cfg.method : "GET", url, cfg.async ? true : false);

        if (cfg.responseType) {
            if (cfg.async) {
                xhr.responseType = cfg.responseType;
            } else console.warn("ajax.js Setting the response type is not allowed under the synchronous method of ajax.");
        };

        if (cfg.header) {
            if (typeof(cfg.header) == "object" && cfg.header instanceof Array) {
                for (var i = 0; i < cfg.header.length; i++) {
                    if (typeof(cfg.header) == "object") {
                        if (cfg.header instanceof Array) {
                            if (typeof(cfg.header[i][0]) == "string") {
                                if (typeof(cfg.header[i][1]) == "string") {
                                    xhr.setRequestHeader(cfg.header[i][0], cfg.header[i][1]);
                                } else console.warn("ajax.js Could not parse request header", cfg.header[i][1]);
                            } else console.warn("ajax.js Could not parse request header", cfg.header[i][0]);
                        } else if (cfg.header instanceof Object) {
                            if (typeof(cfg.header[i].key) == "string") {
                                if (typeof(cfg.header[i].val || cfg.header[i].value) == "string") {
                                    xhr.setRequestHeader(cfg.header[i].key, cfg.header[i].val || cfg.header[i].value);
                                } else console.warn("ajax.js Could not parse request header", cfg.header[i].key);
                            } else console.warn("ajax.js Could not parse request header", cfg.header[i].val || cfg.header[i].value);
                        } else console.warn("ajax.js Could not parse request header", cfg.header[i]);
                    } else console.warn("ajax.js Could not parse request header", cfg.header[i]);
                };
            } else console.warn("ajax.js Could not parse request header", cfg.header);;
        };

        xhr.send(cfg.senddata || "");

        if (cfg.timeout) {
            if (typeof(cfg.timeout) == "number") {
                var timeout = setTimeout(function() {
                    xhr.abort();
                    return reject([-1, null]);
                }, cfg.timeout);
            } else console.warn("ajax.js Could not parse abort time", cfg.timeout);
        };

        xhr.onload = function() {
            clearTimeout(timeout);

            if (xhr.status >= 200 && xhr.status < 400) {
                return resolve([xhr.status, xhr.response]);
            } else return reject([xhr.status, xhr.response]);


        };

    });
};