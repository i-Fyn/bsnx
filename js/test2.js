
const url = $request.url;
if (!$request.headers) $done({});
let head = $request.headers;
let body = $request.body;

function modifyJsonString(jsonString, newUUID) {
    // 替换 deviceUUID 和 geelyDeviceId
    jsonString = jsonString.replace(/"deviceUUID":"[0-9A-Fa-f-]{36}"/g, `"deviceUUID":"${newUUID}"`);
    jsonString = jsonString.replace(/"geelyDeviceId":"[0-9A-Fa-f-]{36}"/g, `"geelyDeviceId":"${newUUID}"`);
    // 替换所有 true 为 false
    jsonString = jsonString.replace(/"true"/g, `"false"`);
    return jsonString;
}
function isUUIDUpperCase(str) {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    return uuidRegex.test(str);
}

if(!$argument?.uuid || !isUUIDUpperCase($argument.uuid)){
  console.log("请填写deviceId")
  return
}

if(head.devicesn){
head.devicesn =  $argument.uuid;
}

if(head.gl_dev_id){
head.gl_dev_id =  $argument.uuid;
}

if(head.sweet_security_info){
head.sweet_security_info = modifyJsonString(head.sweet_security_info, $argument.uuid);
}

// if(url == "https://geely-user-api.geely.com/api/v1/device/bind"){
// console.log($argument.device,$argument.uuid);
// if($argument.device && $argument.device.length == 32){
// obj = JSON.parse(body);
// obj.device = $argument.device;
// $done({ headers: head,body: JSON.stringify(obj) });
// return
// }
// }



$done({ headers: head });
