function do_fork() {
    var username = getusername();
    if (username == null) {
        return tellUser("请先登录", MSG_ERROR);
    };
    //获取用户的书籍列表
    //检查是否fork过
    ajax("/file/private/user/booklist/" + username).then(function(res) {
        var data = JSON.parse(res[1]);
        var uuid = parseURLHash().arg.split(",")[0];
        for (var i = 0; i < data.length; i++) {
            if (data[i].pointer.length && data[i].pointer[data[i].pointer.length - 1] == uuid) {
                //pointer的最后一项是这本书籍的uuid
                //已经fork过
                //直接跳转
                location.href = `/view@${data[i].uuid},0`;
            };
        };
        //没有跳转过
        //开始fork
        _fork(data, uuid);
    }).catch(function(err) {
        if (err.status == 404) {
            //用户没有书籍列表
            //可以fork
            var uuid = parseURLHash().arg.split(",")[0];
            _fork([], uuid);
        }
        tellUser("Error:" + (err || err.message), MSG_ERROR);
        tellUser("请求用户书籍列表中发生错误", MSG_ERROR);
    });
};

function _fork(user_booklist, book_uuid) {
    console.log(user_booklist, book_uuid);
    //从硬盘上取出需要fork(当前书籍)的uuid，进行fork
    localforage.getItem(`novel-cache-${book_uuid}`).then(function(res) {
        console.log(res);
        if (res == null) {
            //Bug???
            res = {};
        };
        res.author = getusername(); //重新设置作者
        res.pointer.push(book_uuid); //将当前书籍的uuid 放入父指针链表
        res.uuid = "_fork_" + _rand(48); //标记uuid来自fork
        if (res.bookname.substring(0, 5) != "fork-")
            res.bookname = "fork-" + res.bookname; //标记图书名来自fork

        var basic_info = {
            author: res.author,
            uuid: res.uuid,
            bookname: res.bookname
        };
        //千万不要直接提交res啊
        //中间也是有小说内容的，只提取关键信息就可以了
        var username = getusername();
        var read_fp = fopen("GitNovelSite/GitNovelSite.github.io/file/private/user/booklist/" + username, "r");
        if (read_fp != 0) {
            var data = getdata(read_fp);
            fclose(read_fp);
        } else data = "[]";
        var write_fp = fopen("GitNovelSite/GitNovelSite.github.io/file/private/user/booklist/" + username, "w", getToken());
        data = JSON.parse(data);
        data.push(basic_info);
        data = JSON.stringify(data);
        setdata(write_fp, data);
        fclose(write_fp);
        //更新用户文件
        /*
                //更新全局booklist
                var read_fp = fopen("GitNovelSite/GitNovelSite.github.io/file/public/booklist", "r");
                if (read_fp != 0) {
                    var data = getdata(read_fp);
                    fclose(read_fp);
                } else data = "[]";
                var write_fp = fopen("GitNovelSite/GitNovelSite.github.io/file/public/booklist", "w", getToken());
                data = JSON.parse(data);
                data.push(basic_info);
                data = JSON.stringify(data);
                setdata(write_fp, data);
                fclose(write_fp);
        */
        //全局booklist就不要更新了，不要污损眼睛

        //新建小说文件
        var fp = fopen("GitNovelSite/GitNovelSite.github.io/file/public/noveldata/zip/" + res.uuid + ".zip", "w", getToken());
        setdata(fp, zip(res));
        fclose(fp);

        //跳转
        location.href = '/view@' + res.uuid + ",0";

    }).catch(function(err) {
        //error???
        console.error(err);
        tellUser("未知的错误<br>" + (err || err.message), MSG_ERROR);
    });
}