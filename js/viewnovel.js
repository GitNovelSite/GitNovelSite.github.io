function getNovelBasicInfo(uuid, cache) {
    if (typeof(cache) == 'undefined') {
        cache = true;
    };
    return new Promise(function(resolve, reject) {
        localforage.getItem("novel-cache-" + uuid).then(function(res) {
            if (res == null || !cache) {
                //没有小说缓存或是指定不许缓存
                //由于是用ghStream.js保存的
                //为了奇奇怪怪的兼容性
                //读取也只能用ghStream.js
                //反正ghStream.js的API也很友好 就是sync费时容易卡页面

                var fp = fopen("GitNovelSite/GitNovelSite.github.io/file/public/noveldata/zip/" + uuid + ".zip", "r");
                if (fp == NULL) {
                    //未抓取到数据
                    return resolve({ status: "error", msg: "Novel is not available" });
                }
                var zipdata = getdata(fp);
                fclose(fp);

                var data = unzip(zipdata);
                localforage.setItem("novel-cache-" + uuid, data).then(function(res) {
                    return resolve(data);
                }).catch(function(err) {
                    console.error(err);
                    return resolve(data);
                });
            } else {
                //返回缓存
                return resolve(res);
            }
        }).catch(function(err) {
            return reject(err);
        });
    });
};