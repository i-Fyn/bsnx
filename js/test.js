const url = $request.url;
if (!$response) $done({});
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if ($request && $request.method != 'OPTIONS') {
    //首页圈子标签
    if (url.includes("mtop.taobao.idlehome.home.circle.list")) {
        if (obj?.data?.circleList?.length > 0) {
            var newLists = new Array();
            for (let list of obj.data.circleList) {
                if (list.showType) {
                    list.showType = "text";
                }
                if (list.showInfo.titleImage) {
                    delete list.showInfo.titleImage;
                }
                if ($argument["mtop.taobao.idlehome.home.circle.list"]?.includes(list.showInfo.title)) {
                    newLists.push(list);
                } else {
                    delete list;
                }
            }
            obj.data.circleList = newLists;
        }

    } else if (url.includes("mtop.taobao.idlehome.home.nextfresh")  ) {
        if ($argument['mtop.taobao.idlehome.home.nextfresh']) {
            obj = new Array();
        }

    } else if (url.includes("mtop.taobao.idle.user.strategy.list")) {
        var newLists = new Array();
        obj.data.strategies = newLists;
    }

}

$done({ body: JSON.stringify(obj) });
