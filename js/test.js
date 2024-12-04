const url = $request.url;
if (!$response) $done({});
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if ($request && $request.method != 'OPTIONS') {
	//首页圈子标签
	if (url.includes("mtop.taobao.idlehome.home.circle.list")){
		if (obj ? .data ? .circleList ? .length > 0) {
		var newLists = new Array();
		for (let list of obj.data.circleList) {
			if (list.showType) {
				list.showType = "text";
			}
			if (list.showInfo.titleImage) {
				delete list.showInfo.titleImage;
			}
			if ($argument["mtop.taobao.idlehome.home.circle.list"] ? .includes(list.showInfo.title)) {
				newLists.push(list);
			} else {
				delete list;
			}
		}
		obj.data.circleList = newLists;
	}

      }else if (url.includes("mtop.taobao.idlehome.home.nextfresh")) {
       if($argument['mtop.taobao.idlehome.home.nextfresh']){
       obj = {}
       }

      }else if (url.includes("mtop.taobao.idle.user.strategy.list")) {
	var newLists = new Array();
       for (let list of obj.data.strategies) {
       if($argument['mtop.taobao.idle.user.strategy.list1'] && list.data.name == "首页闲鱼币入口氛围"){
       delete list;
       }else{
       newLists.push(list);
       }
       if($argument['mtop.taobao.idle.user.strategy.list2'] && list.data.name == "首页底部发布球"){
       delete list;
       }else{
       newLists.push(list);
       }
	      
       }
       obj.data.strategies = newLists;
      }
      
}

$done({ body: JSON.stringify(obj) });
