/*
# 吉利汽车签到
# 测试loon,青龙面板,其他自测
# 此版本支持多帐号 多设备签到 如果没有巨魔 使用apps manager清除app数据 那么只支持一个号
# 获取Cookie方法 Loon安装插件并启用 进入吉利APP重新登录 最后进入数据持久化 读取指定数据 geely_val亦或者查看日志
# 本项目变量为：mobile@token@refreshToken@txCookie@devicesn 如果没有巨魔还想多账号 请自行获取
====================================
[loon插件]
https://raw.githubusercontent.com/i-Fyn/bsnx/main/plugin/geely.plugin
====================================
# pushplusToken PUSH_PLUS_TOKEN=**********
# 青龙环境变量  geely_val=mobile@token@refreshToken@txCookie@devicesn
 */
const tag = "吉利汽车";
const taskName = "签到";
const $ = new Env(tag + taskName);
const _key = 'geely_val';
const CK_Val = getEnv(_key)?.trim();
$.is_debug = 'true--';
$.messages = [];



async function getCk() {
    if ($response && $request.method != 'OPTIONS') {
        const response = $response.body;
        const head = ObjectKeys2LowerCase($request.headers);
        const devicesn = head['devicesn'];
        if (response) {
            const ckVal = response;
            if (typeof (ckVal) == "object") {
                $.log("object")
                $.log($.toStr(ckVal))
            } else {
                try {
                    $.log("string: " + ckVal)
                    $.log($.toObj(ckVal))
                } catch (e) { }
            }
            res = $.toObj(ckVal);
            if (res.code && res.code == "success") {
                var token = res.data.token;
                var refreshToken = res.data.refreshToken;
                var txCookie = res.data.txCookie;
                var mobile = res.data.ucMemberDto.ucMemberProfileDto.mobile;
                var data = mobile + "@" + token + "@" + refreshToken + "@" + txCookie + "@" + devicesn;
                setOrUpdateData(data);
                $.msg($.name, '获取ck成功🎉', data);
            }

        } else {
            $.msg($.name, '', '❌获取ck失败');
        }
    }
}


function getHeaders() {
    return {
        'User-Agent': `GLMainProject/${$.appversion} (iPhone; iOS 18.2; Scale/3.00)`,
        'Content-Type': 'application/json',
        'txcookie': $.txCookie,
        'gl_dev_name': 'iPhone',
        'gl_dev_model': 'iPhone17,2',
        'gl_dev_brand': 'Apple',
        'appversion': $.appversion,
        'gl_dev_id': $.devicesn,
        'gl_os_version': '18.2',
        'platform': 'iOS',
        'token': $.token,
        'gl_dev_platform': 'iOS',
        'accept-language': 'zh-Hans-CN;q=1',
        'devicesn': $.devicesn,
        'gl_app_version': $.appversion,
    }
}



async function main() {
    if (CK_Val) {
        $.appversion = $.toObj((await $.http.get(`https://itunes.apple.com/cn/lookup?id=1518762715`))?.body)?.results[0]?.version;
        $.appversion = $.appversion ? $.appversion : "3.25.0";
        $.log(`最新版本号：${$.appversion}`);
        $.log("通知参数:"+$argument?.pushplusStatus,$argument?.pushplusToken);
        let ckArr = await getCks(CK_Val);
        for (let index = 0; index < ckArr.length; index++) {
            const mobile = ckArr[index].trim().split("@")[0];
            pushMsg(`========= [${mobile}]=========`);
            var d = await readValFromLocal(mobile);
            [$.mobile, $.token, $.refreshToken, $.txCookie, $.devicesn] = d?.trim().split("@") || ckArr[index].trim().split("@");
            if ($.mobile && $.token && $.refreshToken && $.txCookie && $.devicesn) {
                await refresh_token();
            } else {
                $.msg($.name, '', '❌ck格式错误?请开启插件并重新登录');
            }
        }
    } else {
        $.msg($.name, '', '❌请先获取ck🎉');
    }
}



// 刷新token
async function refresh_token() {
    url = `https://app.geely.com/api/v1/user/refresh?refreshToken=${$.refreshToken}`;
    headers = getHeaders();
    const rest = { url, headers }
    let { code, data, message } = await httpRequest(rest);
    if (code == 'success') {
        $.token = data.token;
        $.refreshToken = data.refreshToken;
        pushMsg(`token刷新成功🎉`);
        await writeValToLocal($.mobile + "@" + $.token + "@" + $.refreshToken + "@" + $.txCookie + "@" + $.devicesn, $.mobile);
        await getMyCenterCounts();
    } else {
        pushMsg(`token刷新失败：${message}`);
    }
}




// 签到
async function signIn() {
    url = `https://app.geely.com/api/v1/userSign/sign/risk`;
    ts = Math.floor((new Date).getTime() / 1000);
    time = $.time('yyyy-MM-dd HH:mm:ss', ts * 1000);
    body = `{"signDate":"${time}","ts":"${ts}","cId":"BLqo2nmmoPgGuJtFDWlUjRI2b1b"}`;
    sign = `cId=BLqo2nmmoPgGuJtFDWlUjRI2b1b&signDate=${ts * 1000}&ts=${ts}0]3K@'9MK+6Jf`
    sign = CryptoJS.MD5(sign).toString();
    // sweet_security_info = {
    //     appVersion: $.appversion,
    //     deviceUUID: $.devicesn,
    //     geelyDeviceId: $.devicesn
    // }
    headers = Object.assign(getHeaders(), {
        "X-Data-Sign": sign,
        "sweet_security_info": `{"osVersion":"18.2","geelyDeviceId":"${$.devicesn}","deviceUUID":"${$.devicesn}","brand":"Apple","appVersion":"${$.appversion}","channel":"ios%E5%AE%98%E6%96%B9","ua":"Mozilla\/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit\/605.1.15 (KHTML, like Gecko) Mobile\/15E148","isSetProxy":"false","isUsingVpn":"false","os":"iOS","isLBSEnabled":"false","platform":"ios","isJailbreak":"false","networkType":"none","battery":"80","os_version":"18.2","isCharging":"2","model":"iPhone17,2","screenResolution":"1290 * 2796"}`
    });
    const rest = { url, body, headers }
    let { code, data, message } = await httpRequest(rest);
    if (code == "success") {
        pushMsg(`签到：${message}`);
    } else {
        pushMsg(`签到失败：${message}`);
    }
}

// 累计签到
async function getSignMsg() {
    url = `https://app.geely.com/api/v1/userSign/getSignMsg`;
    const _Date = new Date();
    body = `{"year":"${_Date.getFullYear()}","month":"${_Date.getMonth() + 1}"}`;
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/ios/geelyApp',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'sec-fetch-site': 'same-origin',
        'accept-language': 'zh-CN,zh-Hans;q=0.9',
        'sec-fetch-mode': 'cors',
        'token': $.token,
        'origin': 'https://app.geely.com',
        'referer': 'https://app.geely.com/app-h5/sign-in/?showTitleBar=0',
        'sec-fetch-dest': 'empty',
    };
    const rest = { url, body, headers }
    let { code, data, message } = await httpRequest(rest);
    if (code == "success") {
        pushMsg(`签到：${data?.continuousSignDay}天`);
    } else {
        pushMsg(`获取签到信息失败：${message}`);
    }
}

//积分
async function available() {
    url = `https://app.geely.com/api/v1/point/available`;
    headers = getHeaders();
    const rest = { url, headers };
    let { code, data, message } = await httpRequest(rest);
    if (code == "success") {
        pushMsg(`积分：${parseFloat(data?.availablePoint)}`);
    } else {
        pushMsg(`获取积分失败：${message}`);
    }
}

// 是否签到
async function getMyCenterCounts() {
    try {
        url = `https://app.geely.com/my/getMyCenterCounts`;
        headers = getHeaders();
        const rest = { url, headers }
        let { code, data, message } = await httpRequest(rest);
        if (code == 'success') {
            if (data?.isSign == false) {
                await signIn();
            } else {
                pushMsg(`已签到`);
            }
            await getSignMsg();
            await available();
        } else {
            pushMsg(`获取签到信息失败：${message}`);
        }
    } catch (e) {
    }
}

// 脚本执行入口
!(async () => {
    if (typeof $request !== `undefined`) {
        getCk();
    } else {
        if (!CK_Val) throw new Error('❌请先获取Token🎉')
        CryptoJS = await intCryptoJS();
        await main();
    }
})().catch((e) => $.messages.push(e.message || e) && $.logErr(e))
    .finally(async () => {
        await sendMsg($.messages.join('\n').trimStart().trimEnd());// 推送通知
        $.done();
    })

//---------------------------------------------------------------------------------------------------
function pushMsg(msg) {
    $.messages.push(msg.trimEnd()), $.log(msg.trimEnd());
}
//请求函数
async function httpRequest(options) { try { options = options.url ? options : { url: options }; const _method = options?._method || ('body' in options ? 'post' : 'get'); const _respType = options?._respType || 'body'; const _timeout = options?._timeout || 15e3; const _http = [new Promise((_, reject) => setTimeout(() => reject(`⛔️请求超时:${options['url']}`), _timeout)), new Promise((resolve, reject) => { debug(options, '[Request]'); $[_method.toLowerCase()](options, (error, response, data) => { debug(data, '[data]'); error && $.log($.toStr(error)); if (_respType !== 'all') { resolve($.toObj(response?.[_respType], response?.[_respType])) } else { resolve(response) } }) })]; return await Promise.race(_http) } catch (err) { $.logErr(err) } }

//pushplus 推送通知
async function pushplus(msg) { var pushplusToken = getPushPlusToken(); if (!pushplusToken) { $.log("推送服务未启用/未填写环境变量：PUSH_PLUS_TOKEN"); return } const headers = { "Content-Type": "application/json" }; url = "http://www.pushplus.plus/send"; body = { "token": pushplusToken, "title": tag, "content": msg, "temple": "html", }; const rest = { url, body, headers }; let { code, data, message } = await httpRequest(rest); if (code == 200) { $.log(`推送成功`) } else { $.log(`推送失败:${message}`) } }

//多账号array提取
function getCks(t) { return new Promise((resolve, reject) => { let ckArr = []; if (t) { if (t.indexOf("\n") != -1) { t.split("\n").forEach((item) => { ckArr.push(item) }) } else { ckArr.push(t) } resolve(ckArr) } else { $.log(`请填写变量:${_key}`) } }) }

//变量储存本地
async function writeValToLocal(str, param) { if ($.isNode()) { const fs = require('fs'); if (!fs.existsSync(tag)) { fs.mkdirSync(tag); console.log(`文件夹"${tag}"不存在，已创建成功。`) } fs.writeFileSync(tag + "/" + param + ".txt", str); $.log("✅ " + tag + "/" + param + ".txt: 个人数据保存成功") } else { setOrUpdateData(str); $.log("✅ " + _key + ": 个人数据保存成功") } }

//读取本地变量
async function readValFromLocal(param) { if ($.isNode()) { const fs = require('fs'); if (!fs.existsSync(tag)) { fs.mkdirSync(tag); console.log(`文件夹"${tag}"不存在，已创建成功。`) } if (!fs.existsSync(tag + "/" + param + ".txt")) { return false } else { $.log("✅ got data by node local file～～"); return fs.readFileSync(tag + "/" + param + ".txt", "utf-8") } } else { var data = getLineByFirstParam(param); return data } }

//通过第一个参数获取环境变量
function getLineByFirstParam(param) { const existingData = $.getdata(_key); const lines = existingData.split("\n"); for (let line of lines) { if (line.startsWith(param)) { $.log("✅ got data by ios local val～～"); return line } } return false }

//读取PUSH_PLUS_TOKEN
function getPushPlusToken() { if ($.isNode()) { if (process.env.PUSH_PLUS_TOKEN) { return process.env.PUSH_PLUS_TOKEN } else { return false } } else { if ($argument?.pushplusToken?.length == 32) { return $argument.pushplusToken } else { return false } } }

//加载 crypto-js
async function intCryptoJS() { function Eval_Crypto(script_str) { const evalFunc = $.isNode() ? global.eval : eval; evalFunc(script_str); return $.isNode() ? global.CryptoJS : CryptoJS } if ($.is_debug !== 'true') { let script_str = ($.isNode() ? require("crypto-js") : $.getdata("cryptojs_Script")) || ""; if ($.isNode()) { $.log("✅ " + $.name + ": node环境，默认使用crypto-js模块"); return script_str } if (script_str && Object.keys(script_str).length) { $.log("✅ " + $.name + ": 缓存中存在CryptoJS代码, 跳过下载"); return Eval_Crypto(script_str) } } $.log("🚀 开始下载CryptoJS代码"); return new Promise(async resolve => { $.getScript('http://ys-l.ysepan.com/551976330/420094417/k5G4J73367NKLlPfoiL4c/crypto-js.min.js').then(script_str => { $.setdata(script_str, "cryptojs_Script"); Eval_Crypto(script_str); $.log("✅ CryptoJS加载成功"); resolve(CryptoJS) }) }) }

//json转字符串query
function jsonToQueryString(t = {}) {
    return Object.keys(t).sort().map(e => `${encodeURIComponent(e)}=${encodeURIComponent(t[e])}`).join("&");
}

// 更新数据函数
function setOrUpdateData(str) { let existingData = $.getdata(_key) || ""; let lines = existingData.split("\n"); let found = false; for (let i = 0; i < lines.length; i++) { if (lines[i].startsWith(str.split("@")[0])) { lines[i] = str; found = true; break } } if (!found) { lines.push(str) } const updatedData = lines.filter(Boolean).join("\n"); $.setdata(updatedData, _key) }

//DEBUG
function debug(content, title = "debug") { let start = `\n-----${title}-----\n`; let end = `\n-----${$.time('HH:mm:ss')}-----\n`; if ($.is_debug === 'true') { if (typeof content == "string") { $.log(start + content + end); } else if (typeof content == "object") { $.log(start + $.toStr(content) + end); } } };

//GET ENV
function getEnv(...keys) { for (let key of keys) { var value = $.isNode() ? process.env[key] || process.env[key.toUpperCase()] || process.env[key.toLowerCase()] || $.getdata(key) : $.getdata(key); if (value) return value; } };

//到小写
function ObjectKeys2LowerCase(obj) { return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])) };

//通知
async function sendMsg(message) { if (!message) return; try { if ($.isNode()) { try { var notify = require('./sendNotify'); } catch (e) { var notify = require('./utils/sendNotify'); } await notify.sendNotify($.name, message); } else { $.msg($.name, '', message); if ($argument?.pushplusStatus) { await pushplus(message) } else { $.msg($.name, '', "未启用pushplus通知/pushplusToken为空"); } } } catch (e) { $.log(`\n\n-----${$.name}-----\n${message}`); } };

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ENV
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise(s => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r }; this.post(n, (t, e, a) => s(a)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), a) } catch (e) { const i = {}; this.lodash_set(i, r, t), s = this.setval(JSON.stringify(i), a) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: a, statusCode: r, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then(t => { const { statusCode: s, statusCode: r, headers: i, rawBody: o } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), e += `${s}=${a}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", a = "", r) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name}, 错误!`, t); break; case "Node.js": this.log("", `❗️${this.name}, 错误!`, t.stack) } } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; switch (this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
