
const url = $request.url;
if (!$request.headers) $done({});
let head = $request.headers;


if(head.devicesn){
head.devicesn =  $argument.uuid;
}

if(head.gl_dev_id){
head.gl_dev_id =  $argument.uuid;
}

if(head.sweet_security_info){
head.sweet_security_info = `{"osVersion":"18.2","ip":"192.168.2.1","geelyDeviceId":"${$argument.uuid}","deviceUUID":"${$argument.uuid}","brand":"Apple","appVersion":"${head.appversion}","channel":"ios%E5%AE%98%E6%96%B9","ua":"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Mobile\\/15E148","isSetProxy":"false","isUsingVpn":"false","os":"iOS","isLBSEnabled":"false","platform":"ios","isJailbreak":"false","networkType":"NETWORK_WIFI","battery":"80","os_version":"18.2","isCharging":"2","model":"iPhone17,2","screenResolution":"1290 * 2796"}`;
}

$done({ headers: head });
