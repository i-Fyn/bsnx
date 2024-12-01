
/*
闲鱼领取经验
测试loon,nodejs，其他自测
签到风控升级处理，请重新获取cookie,青龙也增加了一个参数

获取Cookie方法 ，Loon安装插件，进入吉利APP，最后进入数据持久化，读取指定数据 idlefish_val

====================================
[loon插件]


====================================
# pushplusToken PUSH_PLUS_TOKEN=**********
# 青龙环境变量  idlefish_val=cookie
 */
const tag="闲鱼";
const taskName="领取经验";
const $ = new Env(tag+taskName);
const _key = 'idlefish_val';
const CK_Val = getEnv(_key)?.trim();
//$.log($.toStr(CK_Val))
//$.log($.toObj(CK_Val))
$.is_debug ='true--';
$.messages = [];

async function getCk() {
    if ($request && $request.method != 'OPTIONS') {
        const cookie = head['cookie'];
      
        if (cookie?.includes("_tb_token_")) {
            const ckVal = cookie;
            $.setdata(ckVal, _key); // 保存更新后的数据
            $.msg($.name, '获取ck成功🎉', ckVal);
        } else {
            $.msg($.name, '', '❌获取ck失败');
        }
    }
}

async function main() {
    if (CK_Val) {
    let ckArr = await getCks(CK_Val);
    for (let index = 0; index < ckArr.length; index++) {
	  const cookie = ckArr[index].trim();
        if (cookie) {
             $.cookie = cookie;
            await autoFetchExp();
        }
}
	}else {
        $.msg($.name, '', '❌请先获取ck🎉');
    }
}

// 领取经验球
async function autoFetchExp() {
    try{
    url = `https://h5.m.goofish.com/wow/moyu/moyu-project/fish-er-home/pages/home?autoFetchExp=true&spm=a2170.7905589.userlevel.1`;
    headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 AliApp(FM/7.18.50) WindVane/8.7.2 iPhone17,2 1290x2796 WK',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Sec-Fetch-Site': 'none',
    'f-pTraceId': 'WVNet_WV_1-1-1',
    'If-None-Match': 'W/"d8c-EfjGsWYMyIlLbIA66EAtzEjB1xg"',
    'Sec-Fetch-Mode': 'navigate',
    'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
    'f-refer': 'wv_h5',
    'Sec-Fetch-Dest': 'document',
    'Cookie': $.cookie
  };
    const rest = {url, headers}
    let res = await httpRequest(rest);
    pushMsg("领取经验球成功");
    }catch(e){
    }
}
async function httpRequest(options) {
    try {
        options = options.url ? options : { url: options };
        const _method = options?._method || ('body' in options ? 'post' : 'get');
        const _respType = options?._respType || 'body';
        const _timeout = options?._timeout || 15e3;
        const _http = [
            new Promise((_, reject) => setTimeout(() => reject(`⛔️ 请求超时: ${options['url']}`), _timeout)),
            new Promise((resolve, reject) => {
                debug(options, '[Request]');
                $[_method.toLowerCase()](options, (error, response, data) => {
                    //debug(response, '[response]');
                    debug(data, '[data]');
                    error && $.log($.toStr(error));
                    if (_respType !== 'all') {
                        resolve($.toObj(response?.[_respType], response?.[_respType]));
                    } else {
                        resolve(response);
                    }
                })
            })
        ];
        return await Promise.race(_http);
    } catch (err) {
        $.logErr(err);
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

//--------
function pushMsg(msg) {
    $.messages.push(msg.trimEnd()), $.log(msg.trimEnd());
}




async function pushplus(msg) {
    var pushplusToken = getPushPlusToken();
    if(!pushplusToken){
        $.log(`推送服务未启用，请先设置环境变量：PUSH_PLUS_TOKEN`);
        return;
    }
    const headers = {
        "Content-Type": "application/json"
    };
    url = `http://www.pushplus.plus/send`;
    body =  {
        "token": pushplusToken,
        "title": tag,
        "content":msg,
        "temple": "html"
    };
    const rest = {url,body ,headers};
    let {code, data, message} = await httpRequest(rest);
    if (code == 200) {
        $.log(`推送成功`);
    } else {
        $.log(`推送失败:${message}`);
    }

}


//多账号提取

function getCks(t) {
    return new Promise((resolve, reject) => {
        let ckArr = [];
        if (t) {
            if (t.indexOf("\n") != -1) {
                t.split("\n").forEach((item) => {
                    ckArr.push(item);
                });
            } else {
                ckArr.push(t);
            }
            resolve(ckArr);
        } else {
           $.log(`请填写变量:${_key}`);
        }
    })
}

//变量储存本地
async function writeValToLocal(str){
	if($.isNode()){
		const fs = require('fs');
		if (!fs.existsSync(tag)) {
    // 如果文件夹不存在，创建它
    fs.mkdirSync(tag);
    console.log(`文件夹 "${tag}" 不存在，已创建成功。`);
}
		fs.writeFileSync(tag + "/" + $.mobile + ".txt",str);
		$.log("✅ " +  tag + "/" + $.mobile + ".txt" + ": 个人数据保存成功");
	}else{
		$.setdata(str, _key+"_"+$.mobile);
		$.log("✅ " +  _key+"_"+$.mobile + ": 个人数据保存成功");
	}
}

//读取本地变量
async function readValFromLocal(){
	if($.isNode()){
		const fs = require('fs');
		if (!fs.existsSync(tag + "/" + $.mobile + ".txt")) {
			return false
		}else{
		return fs.readFileSync(tag + "/" + $.mobile + ".txt","utf-8");
	 }
	}else{
		var data = $.getdata(_key+"_"+$.mobile);
		var d = data? data:false;
		return d
	}
}


//读取pushplus Token
function getPushPlusToken(){
	if($.isNode()){
        if(process.env.PUSH_PLUS_TOKEN){
            return process.env.PUSH_PLUS_TOKEN;
        }else{
            return false;
        }
	}else{
        if($.getdata("PUSH_PLUS_TOKEN")){
            return $.getdata("PUSH_PLUS_TOKEN");
        }else{
            return false;
        }
	}
	}



//加载 crypto-js
async function intCryptoJS() {
    function Eval_Crypto(script_str) {
        const evalFunc = $.isNode() ? global.eval : eval;
        evalFunc(script_str);
        return $.isNode() ? global.CryptoJS : CryptoJS;
    }
    if($.is_debug !== 'true'){//调试模式默认从网络读取js脚本
        let script_str = ($.isNode() ? require("crypto-js") : $.getdata("cryptojs_Script")) || "";
        if ($.isNode()) {
            $.log("✅ " + $.name + ": node环境，默认使用crypto-js模块");
            return script_str;
        }
        if (script_str && Object.keys(script_str).length) {
            $.log("✅ " + $.name + ": 缓存中存在CryptoJS代码, 跳过下载");
            return Eval_Crypto(script_str)
        }
    }
    $.log("🚀 " + "开始下载CryptoJS代码");
    // const script_str = (await $.http.get('http://192.168.2.170:8080/crypto-js.min.js')).body;
    // Eval_Crypto(script_str);
    return new Promise(async resolve => {
        $.getScript('http://ys-l.ysepan.com/551976330/420094417/k5G4J73367NKLlPfoiL4c/crypto-js.min.js').then(script_str => {
            $.setdata(script_str, "cryptojs_Script");
            Eval_Crypto(script_str)
            $.log("✅ CryptoJS加载成功");
            resolve(CryptoJS);
        });
    });
}


function jsonToQueryString(t = {}) {
    return Object.keys(t).sort().map(e => `${encodeURIComponent(e)}=${encodeURIComponent(t[e])}`).join("&");
}

//DEBUG
function debug(content,title="debug"){let start=`\n-----${title}-----\n`;let end=`\n-----${$.time('HH:mm:ss')}-----\n`;if($.is_debug==='true'){if(typeof content=="string"){$.log(start+content+end);}else if(typeof content=="object"){$.log(start+$.toStr(content)+end);}}};

//GET ENV
function getEnv(...keys){for(let key of keys){var value=$.isNode()?process.env[key]||process.env[key.toUpperCase()]||process.env[key.toLowerCase()]||$.getdata(key):$.getdata(key);if(value)return value;}};

//到小写
function ObjectKeys2LowerCase(obj){return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k.toLowerCase(),v]))};

//通知
async function sendMsg(message){if(!message)return;try{if($.isNode()){try{var notify=require('./sendNotify');}catch(e){var notify=require('./utils/sendNotify');}await notify.sendNotify($.name,message);}else{$.msg($.name,'',message);await pushplus(message)}}catch(e){$.log(`\n\n-----${$.name}-----\n${message}`);}};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ENV
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
