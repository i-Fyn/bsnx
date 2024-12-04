
const url = $request.url;
if (!$response) $done({});
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/mtop.idle.user.page.my.adapter/")) {
  // 我的页面
  if (obj?.data?.container?.sections?.length > 0) {
    let newSections = [];
    for (let items of obj.data.container.sections) {
      if (items?.template?.name === "my_fy25_user_info") {
        // 专属等级横幅
        delete items.item.level;
      } else if (items?.template?.name === "my_fy25_slider") {
        // 滚动小提示
        continue;
      } else if (items?.template?.name === "my_fy25_tools") {
        // 工具箱 14借钱
        if (items?.item?.tool?.exContent?.tools?.length > 0) {
          items.item.tool.exContent.tools = items.item.tool.exContent.tools.map((i) =>
            i.filter((ii) => ![14]?.includes(ii?.exContent?.toolId))
          );
        }
      } else if (items?.template?.name === "xianyu_home_fish_my_banner_card_2023") {
        continue;
      }
      if (items?.template?.name === "my_fy25_community") {
        // 底部乱七八糟无用内容
        continue;
      }
      newSections.push(items);
    }
    obj.data.container.sections = newSections;
  }
} else if (url.includes("/mtop.taobao.idlehome.home.nextfresh/")) {
   if($argument["mtop.taobao.idlehome.home.nextfresh"]){
  obj = {};
   }
} else if (url.includes("/mtop.taobao.idlehome.home.circle.list/")) {
  if (obj?.data?.circleList?.length > 0) {
    let newLists = [];
    for (let list of obj.data.circleList) {
      if (list?.showType) {
        list.showType = "text"; // 将首页顶部标签模式修改为文本
      }
      delete list.showInfo.titleImage; // 删除将首页顶部图片标签的资源
      
      if ($argument["mtop.taobao.idlehome.home.circle.list"]?.includes(list.showInfo.title)) {
                    newLists.push(list);
       } else {
                    delete list;
        }
    }
    obj.data.circleList = newLists;
  }
} else if (url.includes("/mtop.taobao.idlemtopsearch.search/")) {
  // 搜索结果广告
  if (obj?.data?.resultList?.length > 0) {
    obj.data.resultList = obj.data.resultList.filter(
      (i) =>
        !(
          i?.data?.template?.name === "idlefish_seafood_vote" || // 搜索结果 投票
          i?.data?.template?.name === "idlefish_search_card_category_select" || // 大家都在搜
          i?.data?.item?.main?.exContent?.isAliMaMaAD === "true" || // 广告1
          i?.data?.item?.main?.exContent?.isAliMaMaAD === true
        )
    );
  }
}

$done({ body: JSON.stringify(obj) });
