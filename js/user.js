function getusername() {
    var token = localStorage.getItem("token");
    if (token == null)
        return null;
    token = token.split("#");
    var username = utf8to16(atob(token[0]));
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
        tellUser("Token expired", MES_ERROR);
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
    localStorage.setItem("token", btoa(utf16to8(username)) + "#" + btoa(ip) + "#" + calc_md5);
};

function logout() {
    for (var key in sessionStorage) {
        sessionStorage.removeItem(key);
    };

    for (var key in localStorage) {
        localStorage.removeItem(key);
    };

    loadPage();
};

function register() {
    var username = document.querySelector("#username-input-area").value || "";
    var password = document.querySelector("#password").value || "";
    var verify_password = document.querySelector("#verify_password").value;
    if (username.length < 2) {
        return tellUser("用户名也太短了吧", MES_ERROR);
    }
    if (password.length < 8) {
        return tellUser("密码长度不足8位", MES_ERROR);
    }
    if (password != verify_password) {
        return tellUser("密码和验证密码不匹配", MES_ERROR);
    };

    var username_substrings = _query_all_substrings(username, 3); //得到username中所有length>=3的子字符串 匹配密码中是否包含
    var isContain = false;

    for (var i = 0; i < username_substrings.length; i++) {
        if (password.indexOf(username_substrings[i]) != -1) {
            isContain = true;
        };
    };

    var password_substrings = _query_all_substrings(password, 3); //得到password中所有length>=3的子字符串 匹配用户名中是否包含
    for (var i = 0; i < password_substrings.length; i++) {
        if (username.indexOf(password_substrings[i]) != -1) {
            isContain = true;
        };
    };

    if (isContain) {
        return tellUser("用户名和密码不能互相包含！", MES_ERROR);
    };

    for (var i = 0; i < danger_passwords.length; i++) {
        if (password == danger_passwords[i]) {
            tellUser("您的密码出现在了我们统计的全球top100常用密码上，请更换密码", MES_INFO);
            return tellUser("密码安全性过低！", MES_ERROR);
        };
    };
    ajax("/file/private/user/pwdmd5/" + username).then(function(res) {
        console.log(res);
        tellUser("用户名重复！", MES_ERROR);
    }).catch(function(err) {

        console.log(err);
        if (err[0] == 404) {
            //文件不存在

            var pwd_md5_obj = new SparkMD5();
            pwd_md5_obj.append(password + "@GitNovelSite.github.io@117.eb160de1de89d9058fcb0b968dbbbd68");
            var pwd_md5 = pwd_md5_obj.end();

            var fp = fopen("GitNovelSite/GitNovelSite.github.io/file/private/user/pwdmd5/" + username, "w", getToken()); //ghStream.js fopen
            setdata(fp, pwd_md5);
            fclose(fp);
            tellUser("注册成功！", MES_SUCCESS);
            storeUsername(username);
            tellUser("将在5秒后跳转", MES_INFO);
            var sec = 4;
            setInterval(function() {
                tellUser("将在" + sec + "秒后跳转", MES_INFO);
                sec--;
                if (sec < 0) {
                    location.href = "/";
                };
            }, 1000);
        } else tellUser("注册过程中发生错误，请联系lihugang@outlook.com并附上Console截图", MES_ERROR);
    })
};

function login() {
    var username = document.querySelector("#username-input-area").value || "";
    var password = document.querySelector("#password").value || "";
    if (username.length < 1 && password.length < 1) {
        return tellUser("用户名或密码不能为空", MES_ERROR);
    };

    var pwd_md5_obj = new SparkMD5();
    pwd_md5_obj.append(password + "@GitNovelSite.github.io@117.eb160de1de89d9058fcb0b968dbbbd68");
    var pwd_md5 = pwd_md5_obj.end();

    ajax("/file/private/user/pwdmd5/" + username).then(function(res) {
        if (res[1] == pwd_md5) {
            tellUser("登录成功！", MES_SUCCESS);
            storeUsername(username);
            tellUser("将在5秒后跳转", MES_INFO);
            var sec = 4;
            setInterval(function() {
                tellUser("将在" + sec + "秒后跳转", MES_INFO);
                sec--;
                if (sec < 0) {
                    location.href = "/";
                };
            }, 1000);
        } else tellUser("密码错误", MES_ERROR);
    }).catch(function(err) {
        console.error(err);
        if (err[0] == 404) {
            tellUser("用户不存在", MES_ERROR);
        } else tellUser("未知错误！请联系lihugang@outlook.com并附上Console截图", MES_ERROR);
    });
}

function _query_all_substrings(str, len) {
    if (typeof(len) == "undefined" || !len) {
        len = 1;
    }
    var ans = [];
    for (var i = 0; i < str.length; i++) {
        for (var j = i + len; j < str.length; j++) {
            ans.push(str.substring(i, j));
        };
    };
    return ans;
};

const danger_passwords = "123456 password 12345678 1234 pussy 12345 dragon qwerty 696969 mustang letmein baseball master michael football shadow monkey abc123 pass fuckme 6969 jordan harley ranger iwantu jennifer hunter fuck 2000 test batman trustno1 thomas tigger robert access love buster 1234567 soccer hockey killer george sexy andrew charlie superman asshole fuckyou dallas jessica panties pepper 1111 austin william daniel golfer summer heather hammer yankees joshua maggie biteme enter ashley thunder cowboy silver richard fucker orange merlin michelle corvette bigdog cheese matthew 121212 patrick martin freedom ginger blowjob nicole sparky yellow camaro secret dick falcon taylor 111111 131313 123123 bitch hello scooter please porsche guitar chelsea black diamond nascar jackson cameron 654321 computer amanda wizard xxxxxxxx money phoenix mickey bailey knight iceman tigers purple andrea horny dakota aaaaaa player sunshine morgan starwars boomer cowboys edward charles girls booboo coffee xxxxxx bulldog ncc1701 rabbit peanut john johnny gandalf spanky winter brandy compaq carlos tennis james mike brandon fender anthony blowme ferrari cookie chicken maverick chicago joseph diablo sexsex hardcore 666666 willie welcome chris panther yamaha justin banana driver marine angels fishing david maddog hooters wilson butthead dennis fucking captain bigdick chester smokey xavier steven viking snoopy blue eagles winner samantha house miller flower jack firebird butter united turtle steelers tiffany zxcvbn tomcat golf bond007 bear tiger doctor gateway gators angel junior thx1138 porno badboy debbie spider melissa booger 1212 flyers fish porn matrix teens scooby jason walter cumshot boston braves yankee lover barney victor tucker princess mercedes 5150 doggie zzzzzz gunner horney bubba 2112 fred johnson xxxxx tits member boobs donald bigdaddy bronco penis voyager rangers birdie trouble white topgun bigtits bitches green super qazwsx magic lakers rachel slayer scott 2222 asdf video london 7777 marlboro srinivas internet action carter jasper monster teresa jeremy 11111111 bill crystal peter pussies cock beer rocket theman oliver prince beach amateur 7777777 muffin redsox star testing shannon murphy frank hannah dave eagle1 11111 mother nathan raiders steve forever angela viper ou812 jake lovers suckit gregory buddy whatever young nicholas lucky helpme jackie monica midnight college baby cunt brian mark startrek sierra leather 232323 4444 beavis bigcock happy sophie ladies naughty giants booty blonde fucked golden 0 fire sandra pookie packers einstein dolphins 0 chevy winston warrior sammy slut 8675309 zxcvbnm nipples power victoria asdfgh vagina toyota travis hotdog paris rock xxxx extreme redskins erotic dirty ford freddy arsenal access14 wolf nipple iloveyou alex florida eric legend movie success rosebud jaguar great cool cooper 1313 scorpio mountain madison 987654 brazil lauren japan naked squirt stars apple alexis aaaa bonnie peaches jasmine kevin matt qwertyui danielle beaver 4321 4128 runner swimming dolphin gordon casper stupid shit saturn gemini apples august 3333 canada blazer cumming hunting kitty rainbow 112233 arthur cream calvin shaved surfer samson kelly paul mine king racing 5555 eagle hentai newyork little redwings smith sticky cocacola animal broncos private skippy marvin blondes enjoy girl apollo parker qwert time sydney women voodoo magnum juice abgrtyu 777777 dreams maxwell music rush2112 russia scorpion rebecca tester mistress phantom billy 6666 albert 114517 114513 ccf noi noip csp a123456 zz12369 123456aa wmsxie123 q123456 qq66666 123456a w2w2w2 a12369 aa123456 wolf8637 qq123456 qq123123 a321654 1qaz2wsx asd123 wpc000821 sunliu66 js77777 a111111 13e4e5sd qq666666 a520520 q1w2e3r4 zz123456 a123456789 qwe123 qqq111 112233abc g227w212 woaini1314 a123123 abc123456 123qwe a1234567 a636654 dircls128 123abc 1q2w3e4r xiao801013 aili1314 123456789a qq111111 yiyou2587 z123456 xy123456 a5201314 a000000 zeng1013 a42176488 123456abc abc123 abcd1234 wangyut2 123456qq qq83328 w123456 aa456789 asd123456 a11111 123456789k woaini123 a25430071 123aa123 woaini520 a369258 hd3080550 789789aa 11111a a258369 zxc123456 000763x sxq330983 uni0728 111111a 0099466ok a12345678 kuen4321 qw123123 123456z wsw870815 ad123456 z19841130 woaini521 oo55663 1234wswxw qaz123 wy123456 kpcjq25 123456q zhang123 li222222 q111111 zxcv123 qq369369 wdl123 a12345 qwe123456 qqaa840605 q1q1q1q1 1234qwer zxcvbnm123 zxc123 qw5555 a19771225 108208aa lnb5552436 yuliang0599 a6201379 a100200 1q2w3e asd2045461 zxcv00123 18n28n24a5 hb000000 tang520qin qweqwe1 qq138238 xs0718 123123a aini1314 541100abcd aaa123456 peng456 qwer1234 as123456 15216827g lcj830916 q123456789 wang123 141033sq aa123123 qq11111 aa45656 123456aaa tb8340646 asdf1234 5201314a dd130612 1q2w3e4r5t q66666666 171204jg sd123456 li123456 jhx1980 123456asd so123456 yuyang11 a8801618 cd831128 zliii0 21yuan a1314520 lin7758991 800528sd a321456 iverson1 123456as wg99999 qq5201314 chang881 123qweasd a147258 sybme7u a824517 s123456 159753aa liulian860420 1qazxsw2 q123123 a7758521 tuchunkun123 q1987910 qazwsx123 a00000 123456789q kb9zc8uxtx 1111111a l123456 a123654 x123456 000000a zxc111 az123456 z123456789 qaz123456 nhmk123 kkusr66 1987517abc l138071 jbdy311 qq1314520 1234abcd aaa111 rs147258 chunyu233 tt123456 12345678a qq12345 dd123456 123456qwe a123456a m198271 1234567ll d54q7xjmhx aa100200 123asd ss123456 qa123456 i97wb6sxq7 hm9958123 12qwaszx s8283330 b33m6yghef huang123 wzj1016 q11111 dingding123 c123456 yuzhiyuan1 cyj720440 sa147258 d54p7xjkha zx123456 aa8485 123321x z1234567 a123321 7715099aaa a13432 xiao0301 asd333 zh1314521 4235191a aaa123 wgz850429 1234567a tt520123 lj1234 e22222 ghost1 qqqq0000 love1314 z123123 g86ua5qsn5 qw123456 e65r82kni2 aa5201314 zsyg4482 wy1981813 pll880411 xx123456 a123000 woaini1 aa112233 c44n6vijgc asdf123 l000000 aptx4869 654123zxc wang123456 123456cc w123456789 zhangyin11 yang001 tzdyj82 rr123456 7758521a aa520410 58324914a sdwl888 111111q jianfei000 yang123 ja8yc8uxsx woaini52 123456ab y123456 2345986a 12345a 123456w 123123q 123456ww zx88418610 q1w2e3 q1021905 123456789z zz777777 aazz623 123456bb b43m6xhiee liu123456 xiaxin18 zhang520 a1b2c3d4 tl2009 woaimei1 qq1234 tiantian12 cxr1111 majiajun8888 1a2b3c4d q14789 qq654123 yanwen1984 f76t93nqk3 qwe888555 q7775396 25114a abcd123456 huifang702 aa147258 aaa111222 abcd123 123aaa 1zhang rvflaji1 caonima123 woaini131 q1234567 q5201314 g76t94prm4 881linchang qq000000 q000000 ab123456 q1w2e3r4t5 a1111111 ppp185037 woaini12 dracula456 wo123456 925808ok lm6338923 yongshi123 love520 1999zgm code8925 liu198420 laopo521 ms0083jxj 963852q ja8yc7txs8 q999888 111qqq ja8xb7txr8 111111qq 88325947z zm123456 wu123456 1984723wjq zxcvbn123 asdw12311 www123456 chen123 hao123 520123zj zygzs001 qiqiansi1 xiaohu123 www2323 abc12345 e65r82mpj2 qwqwqw123 liu123 qq123456789 f75s83nqk3 lclc173174 e65r82mnj2 4158zh h87va5rtp6 jiang123 i98xb7sxr7 as147258 nihao123 ww111111 q12345 js777777 ersa147258 qweasd123 laopo520 m123456 aaaa1111 zuihou00 yueguang01 12345qwert g76u94prm4 h123456 asdasd123 qaz010203 cc28851770 qweqwe111 b43n6whifd aa222222 a7758258 deng00da luhy2000 g86u94psn5 ww123456 ch52013147 123456l a112233 qqqq11 a123123123 taotao123 123123aa 1hxboqg2s 123654aa plok123456 c44n6vijfc a147258369 8258wang 19860330lj a5211314 7758521ax 1314520a weijinchi328 wz61216677 kp123456 123456zxc 111111111a a11111111 123qwe123 ok989036 tanqingmei520 z5201314 g7j9a3g jingling123 asd12345 327115aa f76t94prm4 k87z9a3g 12345q jz6x6k6l qwert12345 m8z3jd6a kz2x5z1x deng1234 l8ud34ay a123458 123123qq wss522 chenyi18gb aa369369 a082402 qw789456 wrh894013 a343478000 a666666 qxwzq1566 c54p7uikgb zcy106 a8893523 5886958z 111111z www123 zqq666600 zaq12wsx 123456qw qq123321 b43m6xhife abc123456789 fdsa123 mingming518 wu2235998 123456qaz 111222tianya 456789a nw12345 du123456 aa1234 wt2401252 qwe123123 a4664000 w5201314 q1q1q1q q12345678 ikmu789 123456b1910 kingcom5 1111111f minghui1 wenwen123 h97wa6ruq6 df9090 2773869aa 24538aa qq85236 z111111 qweqwe123 123456abcd liang123 if5312586 chunkai55 zx6011 rui100 lkj123456 a1s2d3f4 xiao123 windows850307 long123 5201314qq a520131 z000000 zhu123 yangjie008 123321a yangmi328 yy123456 bj2008 e65s83mpj2 z11111 256314ss a885522 asdf123456 b33k5ygheg mingming00 h87va5qtp6 zxcv1234 q2008640 zhang521 jimmy01 wcl110 aqq122 yx12345678 yu123456 3651118xun qq7758521 a321321 a1314521 6611288zx a0000000 love123 d123456 a110110 ja8yc8txsx wu198354 qq415263 liujie67 bb123456 123456789qq cjw19793333 asd123123 ri123456 abc54321 123456zx d55q72kmix c44p7uijgb 111111aa 123321aa a159753 password1 qz111111 huang520 asdzxc123 yang520 yang123456 f123456 zhang12 asd456 a33k5zggdg 12301230q e65r82knix q7758521 qwe12345 q99999999 a33k5zghdg g123456 327115bb zxc789456 rsb66195 chen123456 as1234 zhao123 mm123456 lin123456 mmdd21314 123qaz jian147369 baobao520 wq19841230 qwer123 811017y zxc123123 rock1977 5201314q nihai321 ling123456 qazwsx741852 l123456789 123zxc woshi123 zxcvbnm1 wang520 maozedong1976 5ggggg 123456ok kb9zd9vxtx kb9zc9vxtx a00000000 e65s83mpj3 650829yjm aaaa8888 w382746530 1a2b3c vodvod123456 wuxi123 lmz123456 wangxu123 qwerty123 1q1q1q dxf315 hu123456 baobei520 worinimab1 111aaa woaini110 fpl2002 12345abcde zaq123 123456zz huangyibo929 808872ggt jr841007 5211314a q1314520 zaq147 qwe123qwe 11111111a wang123789 gxl891103 123456789abc jhgbjj3221 asdasd1 zql1985 qqq222 qqq123 ab52610001 33333333a w123123 as568379 a7775460 123456789w 123456x f76s93nqk3 shanru0186 asd45679 bb7741569 zxcv3321 bb10000 a222222a 147258a lwqlwqlwq9 b123456 yuruian521 amp0728 x321321 eee333 1314520aa cxr11111 1q2w3e4 a2829837 woaini11 lyd1210 a22222 zhang1987 h97wa6rup6 k87799697 abcde12345 811017yr 1230123asd zy123456 cheng123 c43n6whifd j123456 xx12356 aaa000 112233a m888888 19780524fx wang1234 a1230123 bjay2008 1qaz1qaz a33k5zggdh z12345678 ewq123456 681008ccm a12593 haha123 123456789l cc123456 2580llwh aw8585 fengyue123456 huaihuai02 a123 wang521 i98xb6sxq7 lori123 admin123 h87va5qtp5 a2198219 zhang1986 xuquan1004 wang1987 sd51tttg 84301203a woaini88 745henguai asd258369 7758258a x123456789 a1b2c3 zhou123 asdf3321 x061209 asdqwe123 h87va5qsn5 asd123asd 1234567b aa12345 ni5250090 qweasd852741 167039ok qq12221222 xi123789 wang159753 1234asdf woaiwojia520 q1111111 lixia000 jiajia520 gx153188 mark2008 qqwwe1016 t123456 mm1381357 k123456 123456zjp xiaoyu520 whf830511 3787864a lh19821215 jian123789 123456m caonima1 weiwei520 jiang520 2227074kp passw0rd chunlei1977 zaq1xsw2 wanshuai198202 google250 zf123456 131200qq ea147258 a2605651 zhang19810 diank123 110119abc king123 321321s qwer3321 123456li qwert123 qq139621 mima123 a111222 wang228358 hao123456 5201314aa qqqq1111 a33k5zfgdh xu123456 wang1986 w111111 iloveyou1 w7758521 ia8xb7txr8 dy000000 7758521q ro5223812 hao928 a123789 qaz12345 liuyu2009 iop753 h97va6rtp6 q123456q lxk891118 8yp3tje7 a123457 1qaz2wsx3edc a131452 123123qwe zj123456 linfei0104 a5633168 1111qqqq 1234aa 123123123a feng123 c123123 s789789 wf20061014 ai123456 vm0020 baobao521 371324zhc lin123 ia8xb7sxr7 w12345678 123321abc 123456s xdxs2009 woaini00 jordan23 wei123456 g55555 123654a qq7758258 baobei521 55655a 123456asdf zxcvbnm12 liang520 qq1234567 c44n6whjfd asdf12 amwjdf1 zhu123456 jie123 chen520 123456789aa ly123456 qwer123456 qaz741 74107410f 1qa2ws 123456qqq zhang123456 woshishui1 zhang110 lovejing13 abcd12345 1qa2ws3ed wqg1983 d54q7xkmix 000000q a3619212 qwx123456 qq520520 fc963258 bvcx321 ax57563095 zh123456 qqq123456 maomao520 qqqqqq1 qq6666660 woshi912 wocaonima1 qq5211314 ll123456 fei520 abcdefg123 asd123456789 a654321 zhuzhu520 xx123123 wq123456 1314521a fong56779 11111q g86u94prm4 2587758qqq 123qweasdzxc telsen856856 ewq66321 mike1111 zhouyu520 zheng123 woaini3344 rey85dr4g c54p7xjkga 1q1q1q1q qq317112 555555q a1234567a xiao520 d54q7xkmhx 12345678q lsx123789 123456mm y123456789 1314woaini w1314520 a987654321 147258369a wang1988 happy123 0000000a x111111 bbzz789 123456c 12301227a 1111111q qq3650437 luxy2000 love521 aa000000 dqf121 z123321 ce19800124 a999999 a3166984 xyy1981415 z1314520 yy5201314 as123123 windows98 zhang1 cs123456 d55q7xkmix 12456q kk123456 zl123456 zhang1988 f65s83mpj3 a110120 ma123456 hello123 s123456789 long520 zzbb0706 s1t2o3n4 qqww456 asd5201314 aaa123123 1a2s3d4f wzq20081106 wangwei123 qwe321 l5201314 f65s83npk3 feng520 840214tian cs5566 aa123456789 aa111111 123456789asd zzz111 yoo654321 w1234567 qq112233 aini131 12121212a qazwsx12 chen0102 aa45645 52010000x sx5412 123asdf 123456y li5201314 a1s2d3 a852258 li345110 a159357 lztzc1981 870113df zxc12345 woainima1 windows123 shs8952550 q123465 q11111111 i97wb6rxq7 qq1230 a1565981 123a123 qwaszx123 xz123456 112233qq zhang12345 jkljkljkl0 heng78963 5201314z 1234567q wang198 00000000a h123456789 asdfg123 a456789 hua520 f65s83mpk3 as12345 aaaaaa1 qiulaobai aaaaaa xiaohe woaini huyiming anglang ningbo longxiang aaaaaaaa mingming nibaba wangjun woaiwojia xiazhili wangzhiai zhanghaomima caonima fengyitianyou a wocaonima xiaoxiao woshishui woainima liuchang buzhidao zhangsu yangyang zhaohao buchaqian heleilei sunshine zhangyu xuanyuan nihaoa zouyong yuanyuan worinima wojiushiwo wangjian qingbao zhangwei woailaopo weiwei jingjing tiantian wangfeng wodemima xiaoqiang zhoujie zhanglei chensun zhangjian dongdong nihaoma wangwei maomao wangyang lijiang chenchen xiaofeng xiaolong e jiajia fengshun woaiwoziji wanglei meiyoumima wobuzhidao changqingjie woshini zhangxinye longlong tianya woshishei feifei wangjing qiuwenqin zhangjie baobao shanghai tianshi xuliang xiaowei zhanghao woshishen jiangji lixiang wangchao o zhangyang wangpeng jiushiaini woainia tiancai zhangyan lichan zhendeaini shanshan chenjian wangqiang xunleili jianjian woshizhu miaomiao nishizhu zhangxin zhangjun majiajun tingting wokaonima xiaoyu woshiniba zhimakaimen orange huanhuan xingxing xiaoyao nimabi aaaaaaaaaa fengyun zhangjing zheshimima chenliang nichen wangwang liangliang wangliang qianqian woshiwo xiaoming woshinidie zhangtao xiaoxin fangqi wanghao aaaaaaaaa lingling aaaaaaa zhangqiang doudou wenwen fengfeng cheese hongxing nishiwode zhangpeng huizhang jiajiayue jiaojiao zhangbin banana nishishui shangxin zhangchao xiaojian woxiangni jiangwei baobei wangshuai zhuzhu zhanghui fengchao wanggang woshitiancai yangjian wangfei leilei zhangliang chenchuanrong zhangkai xinxin huangwei diandian xiaobai mengmeng xiaoyang hahahaha wangzhen wanghuan liuyang xiaozhu woaimama jiejie wangyan zhanglin hahaha xiaodong bingbing an dingding chenwei wangdong zhangming yingying jieshuai worinimama chenchao wangyong zhangfan wangxin wangbin liqiang shuaishuai liuqiang jiangtao qingqing wozhiaini womendeai chouchou caonimabi haohao xuanxuan xiaofei chinaren jiangnan xiaoliang niaiwoma woaiqian liyang dandan wangtao zhanghua suibian huahua kaishi fangfang menghuan liuwei wangyu wangying linjiang huanghua zhongguo weishenme huangjing wangjie chenhao xihuanni xiaobao yangfan woshinima woainiya wangming changanzhen wangkai chengcheng jinweihai kaikai zhouyang tangbo woshiren wanglong lijian yongyuan xiaojing woxihuanni songzhuren feixiang chenyong zhangfeng mimacuowu zhangyong jiandanai AAAAAAAA jiushiwo yangchao pengpeng zhangshuai chenyang wanghui chaochao zhangyi zhangying wodezuiai wangning zilianhua kaonima woaiziji xiaojie kuaile wangchen xiaotian AAAAAA zhangqian chenjie binbin benben huangjie zhangzhang woshinibaba xiaogang wobuaini woaishui mimamima aaa zhangrui liming chinese sunyanzi zhouzhou zhangyue jiangjun chenjing tangtang chenlong xiangni tiankong angela wangxiao amanda xixihaha xiangxiang taotao chenfeng haohaoxuexi wuliao woainimen kangkang woainimama wangcheng laopowoaini zhanglong zhangli baicheng yingke yanyan xiaolei wangmeng jingming ningning buhaoniman tiantang yangjing xiaoxue woainilaopo huangjian linlin yangjie zhaoyang lijing meimima chenlei wangqian lalala tongtong qingfeng jiandan guaiguai zhangnan tianxia wohenaini liujian zhangqi wangyuan beibei shuang yangming yangyong xiaohui zhangjin kangta huanglei zhenzhen zhangmin huanghao baishikele zhoujian zhang zhangheng yangguang oooooo woainiwoaini junjun yongheng zhangxiao zhangjia aaaaa zhangkun xiaojun nishishei haiyang wushuang wowangle aaaa zhanshen zhangzhen yuyang zhouwei xiaopeng zhangfei wangbing qingtian zhaojing woaiwolaopo hanhan chenming ao aidejiushini monica huihui chenxiao aiziji liuxin huangyan shenyang zhangyuan woshihaoren zhaowei zhanghan xiaoxiong ainiyiwannian zhuang liushuai qiaoqiao meimei wangxiang yaoyao woaibaobao natalie liuliang jiangjiang chenpeng woaiwo wangxing liuliu zhuandaqianba xiaoqing gaoxiang zhangxu songsong wangrui rongrong jianglei gaojiehao zhangbo bubuhu ainibubian xiaoxiang wangqing beijing shuaige daohaosima zhangcheng xiaoli woxihuan zhoufeng fanfan chengjisihan aishangni wanghong shijian xiaomao wangbo liujie gaosheng chenbin zhaojian xiaoqi xiaochao rinima mingtian jiangfeng woaideren wangyi jianghao zhengwei hanbing chenjun juanjuan chengang chencheng qiangqiang huangkai zhangwen yaoming shenhua xiaohua woshinide fengzi ainideren woaimeinv shuijing wangzheng huangxin wangqi loulou kaixin huanghuang ang zhaolei nihaoya aiwosuoai xiaoling huangjun honghong caonimade yangjun gaofeng yanglei oooooooo 123456 12345678 q123456 w2w2w2 1234567 q1w2e3r4 54545454 121212 654321 1q2w3e4r 987654321 zxcvbnm 12345 1234 w123456 qwertyuiop asdfghjkl 5454545454 q1q1q1q1 87654321 1q2w3e qwerty 12121212 1q2w3e4r5t qwqwqw qwertyui 1qazxsw2 987654 asdfgh 12qwaszx asasas 232323 qw123456 Q123456 zxcvbn q1w2e3 asdfghjk q1234567 q1w2e3r4t5 qwqwqw123 q12345 qwaszx 987654321 545454545 212121 7654321 zaq12wsx qazxsw q1q1q1q q12345678 234567 565656 787878 QWERTYUIOP 1q1q1q zaq123 123454321 mnbvcxz 1212 1232123 1q2w3e4 ewq123456 1234321 5454545 qazxswedc 45454545 ASDFGHJKL asdwasdw 23232323 ZXCVBNM w12345678 1212121 454545454 21212121 98765 asdfdfdf wq123456 1q1q1q1q 1212123 asasasas qwertyu qwe321 323232 w1234567 454545 909090 123456y poiuytrewq asdf 78787878 zxzxzx qwqwqwqw 90909090 545454 1q2w3e4r5t6y q1q1q1 123456yu qwertyuio qazxsw123 656565 345678 1212121212 98765432 56565656 W123456 wasdwasd lkjhgfdsa zaqwsx asdfghj 4545454 65656565 w12345 90909 qwert qw1234 zaq123456 321qwe qawsedrf 12345654321 zxcvbnm,./ wewewe 123ewq1 qw12345 1Q2W3E4R 1q2w3e4r5 54321 kokoko Q12345 zxzxzxzx 878787 1234565 zaq1234 qwer p0o9i8u7 kukuku azsxdcfv qawsed 123432 fghytr 5654545454 asdfg sasasa wer567 qwqw1212 1w1w1w o0o0o0o0 32323232 QWERTY 5454565454 sefew1wef o0o0o0 9090909 sq123456 0o0o0o0o 4321 9876543 12321 QWERTYUI 343434 okokok 676767 zxasqw12 qwer4321 0o0o0o !@#$%^ 123456t 1234rewq wert56yu okokokok 1Q2W3E4R5T 23456 qazxcvbnm q1w2e3r4t5y6 3456 12qw12qw 123212321 poiuyt ASDFGH ert56yu aq123456 123ewq 90909 zxcvbnm, 123234 12qwas gyjyt54 9876543 767676 lilili aqaqaq1 zaqwsxcde 1q1q1q1 qwertyuiop[] zaq12345 q2w3e4r5 q1w2e3r azsxdc 2345678 1qazse4 aqaqaq sdsdsd liuhui fred dfdfdf qwqwqw1 87878787 0p9o8i7u 2323 1qazxsw23edc 121234 Q1W2E3R4 1QAZXSW2 q1w2e3r4t jhjhjh QW123456 qwerfdsa qwe456 lililili ASDFGHJK 2121 sw123456 54ty76yu 98765 wqwqwq azazaz 654545454 1Q2W3E poiuytre 9876 sasasasa ewq234 1qaz qwedsazxc opopop `12qwe 12qw34er yuyuyu sesese qwedsa zxcv 34343434 zxasqw 1qazxsw zsq123 qw12qw12 O0O0O0O0 123454 5678 1q2w3e4r5t6y7u ewq123 12345654 sdsdsdsd qw12345678 7878 1qw23er4 o0o0o0o0o0 67676767 123456ty zazaza O0O0O0O0O0 dw123456 cscscs asdfghjkl; 2wsxzaq1 kuikui qazxsw12 Q1W2E3R4T5 q121212 polopolo 2345 0o0o0o0o0o Q12345678 987654321q qawsedrftg mnbvcx azxcvbnm lololo 5656 2wsxcde3 zaqwsxzxc qwedcxzas dfdfdfdf q123 popopo 123234345 asdw123456 76767676 12345656 12121 ZXCVBN azsxdcfvgb 434343 12qwasz 123212 12123 zxcvbnm,. qwqw123 9090909 zxcvb qazsedcft huhuhu aqswdefr huhuhuhu 4567 `1234567 0O0O0O0O qawsedr5 765432 121212q qw1234567 lolo kiki qaqaqa q1q1q1q1q1 lkjhgf fgfgfg 4545 qazxcv asasasasas 7u8i9o0p 1q2w3e4r5t6y7u8i lili jkjkjk 123ewqasd p0o9i8u7y6 asdw123 12QWASZX 12123456 909 wq12345 azazazaz 2123 0o9i8u7y yuyuyuyu wawawa qw123er 1qazxcvbnm 1q1q1q1q1q xsw21qaz fredfred 1qw23er45t 123456787 qwqw desert 1qazxcvb zaxscdvf fghjkl qaqaqaqa Q1234567 0p9o8i7u6y 0okmnji9 qwertyuiop0 QAZXSWEDC p0o9i8 jijijiji 123456yj 123456yh 121212121 redred kokokoko cxcxcx asdewq xcxcxc wewewewe 0O0O0O0O0O popopopo opopopop ghghghgh aw123456 12q12q 1232345 1212321 wqwqwqwq qwqw12 qwertyuio0 qwe234 !QAZxsw2 123w123 `12345 !@#$%^&* QWASZX jijiji asdw1234 876543 4r3e2w1q 21232123 1qazXSW@ Q1W2E3 lolololo 234343 2323232323 1q2w1q2w !@#$%^&*() ghghgh cscscscs 1234567y 12345678o 1232 12123434 xzxzxz tytyty qwqwqwqwqw QWERTYU qwasqwas q2q2q2 O0O0O0 ew123456 e3e3e3 asdcxz 5t6y7u8i 21212 zxasqw123 W12345678 w121212 sw123 qweszxc Q1w2e3r4 q12q12q12 ASASAS 9090 6y7u8i9o0p 34t45t5 2w3e4r5t 121212123 zazazaza qasw12345 plokijuh mnbvcxza asdfvcxz aqaqaqaq 1qazxdr5 1qazxc 12qw12 1234567* zaq12wsxcde3 W1234567 tyuiop popo POIUYTREWQ cxcxcxcx 5454 12345676 zxcvbnmk ZXCVBNM,./ wswsws wawawawa wasd qw12er34 qazxsw1 mnmnmn cxzasd aqswde 3232 2323232 zszszs zaxscd WQ123456 q2w3e4 hjhjhj 4545454545 1q2w3e4R qazxswed q12123 p0p0p0 kikiki asdfrewq 5tgbnhy6 21wqsaxz 1qwerty 1qasw23ed 0o9i8u wsxcde3 w123w123 qwsaqwsa qw1212 QAZXSW fdfdfd aq1234 56u67u7 1qazse4rfv 123wasd 123232 r4e3w2q1 qwer5678 qsefthuko polo poilkj jkjkjkjk 8787 654321q 5t4r3e2w1q 43434343 3434 `123456 12121234 QWERTYUIO q1w2e3r4t5y6u7i8 kikikiki asdwq123 12wqasxz".split(" ");

const gh_token = [atob("Z2hwXzlqUVpsaE9HZ0pyTFRoOVlUZ0hXY2E2bmt1WmI0cDJyZUd1dQ==")];

function getToken() {
    return gh_token[parseInt(Math.random() * 934298) % gh_token.length]
}