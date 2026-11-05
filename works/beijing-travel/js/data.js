window.TRIP_DATA = {
  "tripId": "beijing-4d-universal-photo-test-20260712",
  "tripTitle": "北京四日｜环球影城与古都出片测试版",
  "startDate": "2026-07-12",
  "endDate": "2026-07-15",
  "travelers": "未指定同行人，按 1-2 名成年人、中等体力、手机拍照优先假设",
  "transportMode": "地铁 + 打车补充",
  "assumptions": [
    "用户未提供具体日期，本测试版按 2026-07-12 至 2026-07-15 规划。",
    "北京 7 月 14-15 日高温风险明显，所有户外景点采用早进早撤。",
    "酒店默认选东单/王府井/前门一带，减少换酒店和跨城折返。"
  ],
  "ui": {
    "format": "travel-story-map-h5",
    "heroTitle": "出发总是美丽的",
    "subtitle": "北京｜4 日含环球影城拍照计划",
    "emotionalLine": "尤其是在把古都红墙、盛夏树影和一整天快乐都安排妥当的时候。",
    "chips": ["北京四日", "含环球影城", "手机出片路线", "本地保存工作台"],
    "exportTarget": "poster"
  },
  "app": {
    "mode": "static-local-first",
    "storageKey": "travelPlanApp:beijing-4d-universal-photo-test-20260712:v1",
    "version": 1,
    "modules": { "budget": true, "reservations": true, "packing": true, "todos": true },
    "share": {
      "defaultMode": "public-readonly-base-itinerary",
      "localEdits": "per-browser-localStorage",
      "exportLocalProgress": true,
      "importLocalProgress": true
    }
  },
  "weatherOverview": [
    { "date": "2026-07-12", "summary": "上午有强雷雨风险，闷热，30/23℃。", "decision": "上午留给室内或低压力活动，天坛改下午，随时用国博/前门室内休息替代。" },
    { "date": "2026-07-13", "summary": "上午阵雨，下午转晴，32/22℃。", "decision": "环球影城可用室内项目过渡，下午集中拍户外城堡和大片区。" },
    { "date": "2026-07-14", "summary": "多云炎热，午后小雨，34/21℃，长时间户外有脱水和中暑风险。", "decision": "故宫必须早进，午后转景山/北海短线或回酒店休息。" },
    { "date": "2026-07-15", "summary": "晴热，36/22℃，中暑风险高。", "decision": "颐和园只做清晨到中午路线，下午安排休息或室内。" }
  ],
  "routeOptions": [
    { "name": "推荐 A｜天气友好低折返", "route": "天坛/前门 -> 环球影城 -> 故宫/景山/什刹海 -> 颐和园", "why": "避开故宫周一闭馆，把环球放周一降低周末人流压力，把最热的两天户外压缩到早晨。" },
    { "name": "备选 B｜传统首日故宫", "route": "故宫 -> 环球影城 -> 天坛/前门 -> 颐和园", "why": "更经典，但 7 月 12 日上午雷雨风险高，故宫红墙出片和广场安检都会受影响。" },
    { "name": "备选 C｜轻松拍照版", "route": "前门/胡同 -> 环球影城 -> 故宫半日 -> 798/蓝色港湾", "why": "步数更低，但会牺牲颐和园，第一次来北京的完整度下降。" }
  ],
  "recommendedRoute": "采用 A：先用室内和中轴线低压力适应天气，周一去环球，周二故宫早进，最后一天颐和园早拍早撤。",
  "socialExperience": {
    "status": "partial",
    "retrievedAt": "2026-07-11",
    "primaryPlatforms": ["xiaohongshu-opencli-search"],
    "queries": ["北京 环球影城 拍照 打卡 排队", "北京 四日游 拍照 打卡 故宫 天坛 颐和园"],
    "signals": [
      { "topic": "universal-crowd", "finding": "近期结果集中讨论环球影城人流、排队和拍照路线，说明盛夏仍要把项目优先级和拍照窗口拆开。", "decisionImpact": "D2 采用早到入园、下午户外拍照、雨天先室内项目的节奏，并把优速通列为待决策预订项。", "confidence": "medium", "verificationNote": "出发前一天用官方 App 和小红书近 7 天结果复核人流。" },
      { "topic": "beijing-4d-route", "finding": "北京四日路线常见痛点是步数过高、跨城折返和故宫/颐和园暴晒。", "decisionImpact": "住宿固定中轴线附近，故宫和颐和园都早进早撤，D1 用雨天弹性活动承接。" },
      { "topic": "photo", "finding": "环球、故宫红墙、天坛祈年殿、颐和园昆明湖是高频出片点，但同质化明显。", "decisionImpact": "每处给出低角度、边缘机位、早晚光线和人群避让策略。" }
    ]
  },
  "routeMap": {
    "mode": "leaflet",
    "provider": "openstreetmap",
    "fallbackMode": "coordinate_fallback",
    "center": { "lat": 39.918, "lng": 116.42 },
    "zoom": 10,
    "summary": "中轴线住宿区串联天坛、前门、故宫、什刹海，单独一天东去环球影城，最后一天西北去颐和园。",
    "nodes": [
      { "id": "hotel-wangfujing", "name": "东单/王府井住宿区", "type": "hotel", "day": 1, "time": "每日", "lat": 39.9138, "lng": 116.4116, "coordinateStatus": "approximate", "role": "三晚住宿 Base", "decisionNote": "去故宫、前门、地铁换乘都方便", "riskNote": "具体酒店价格和房态需核验", "anchor": "hotel-base" },
      { "id": "national-museum", "name": "中国国家博物馆", "type": "attraction", "day": 1, "time": "10:00-12:30", "lat": 39.9037, "lng": 116.3976, "coordinateStatus": "verified", "role": "雷雨上午室内缓冲", "decisionNote": "适合避雨和补足文化线", "riskNote": "预约和开放日需核验", "anchor": "national-museum" },
      { "id": "qianmen", "name": "前门大街/大栅栏", "type": "photo", "day": 1, "time": "13:30-15:30", "lat": 39.8991, "lng": 116.3972, "coordinateStatus": "verified", "role": "中轴线街景与晚饭区", "decisionNote": "雨后路面反光适合拍街景", "riskNote": "商业街人流密集", "anchor": "qianmen" },
      { "id": "temple-of-heaven", "name": "天坛祈年殿", "type": "attraction", "day": 1, "time": "16:00-18:00", "lat": 39.8822, "lng": 116.4066, "coordinateStatus": "verified", "role": "经典建筑出片", "decisionNote": "雨后云层和傍晚光更柔", "riskNote": "联票、停止入园时间需核验", "anchor": "temple-of-heaven" },
      { "id": "universal-beijing", "name": "北京环球影城", "type": "attraction", "day": 2, "time": "08:30-20:30", "lat": 39.849, "lng": 116.672, "coordinateStatus": "approximate", "role": "整日核心", "decisionNote": "周一相对避开周末高峰", "riskNote": "开放时间、票价、优速通需官方 App 复核", "anchor": "universal" },
      { "id": "universal-citywalk", "name": "北京环球城市大道", "type": "meal", "day": 2, "time": "20:30-21:30", "lat": 39.852, "lng": 116.672, "coordinateStatus": "approximate", "role": "晚餐和返程缓冲", "decisionNote": "出园后不急着挤地铁", "riskNote": "餐厅排队需现场判断", "anchor": "citywalk" },
      { "id": "forbidden-city", "name": "故宫午门", "type": "attraction", "day": 3, "time": "08:30-12:30", "lat": 39.9163, "lng": 116.3972, "coordinateStatus": "verified", "role": "红墙核心出片", "decisionNote": "周二早进避开周一闭馆和午后高温", "riskNote": "实名预约、安检、闭馆规则需核验", "anchor": "forbidden-city" },
      { "id": "jingshan", "name": "景山公园", "type": "photo", "day": 3, "time": "13:00-14:00", "lat": 39.9253, "lng": 116.3965, "coordinateStatus": "verified", "role": "俯拍中轴线", "decisionNote": "体力允许再上万春亭", "riskNote": "高温时可直接取消", "anchor": "jingshan" },
      { "id": "shichahai", "name": "什刹海/胡同", "type": "photo", "day": 3, "time": "16:30-19:00", "lat": 39.9398, "lng": 116.386, "coordinateStatus": "approximate", "role": "傍晚胡同和湖边", "decisionNote": "避开午后高温，补轻松人文照", "riskNote": "商业化和人流较多", "anchor": "shichahai" },
      { "id": "summer-palace", "name": "颐和园昆明湖", "type": "attraction", "day": 4, "time": "07:30-11:30", "lat": 39.9997, "lng": 116.2755, "coordinateStatus": "verified", "role": "清晨湖面与长廊", "decisionNote": "36℃天气只做早晨路线", "riskNote": "游船、联票和开放时间需核验", "anchor": "summer-palace" },
      { "id": "olympic-park", "name": "奥林匹克公园", "type": "photo", "day": 4, "time": "18:30-20:00", "lat": 39.9913, "lng": 116.3906, "coordinateStatus": "verified", "role": "夜景备选", "decisionNote": "如果体力和返程时间允许，拍鸟巢夜景", "riskNote": "高温后体力不足时取消", "anchor": "olympic-park" }
    ],
    "lines": [
      { "id": "d1-line", "day": 1, "type": "planning_polyline", "label": "D1 计划动线", "nodeIds": ["hotel-wangfujing", "national-museum", "qianmen", "temple-of-heaven", "hotel-wangfujing"], "note": "点位连线仅表示计划顺序，不等于真实导航路线" },
      { "id": "d2-line", "day": 2, "type": "planning_polyline", "label": "D2 计划动线", "nodeIds": ["hotel-wangfujing", "universal-beijing", "universal-citywalk", "hotel-wangfujing"], "note": "点位连线仅表示计划顺序，不等于真实导航路线" },
      { "id": "d3-line", "day": 3, "type": "planning_polyline", "label": "D3 计划动线", "nodeIds": ["hotel-wangfujing", "forbidden-city", "jingshan", "shichahai", "hotel-wangfujing"], "note": "点位连线仅表示计划顺序，不等于真实导航路线" },
      { "id": "d4-line", "day": 4, "type": "planning_polyline", "label": "D4 计划动线", "nodeIds": ["hotel-wangfujing", "summer-palace", "olympic-park", "hotel-wangfujing"], "note": "点位连线仅表示计划顺序，不等于真实导航路线" }
    ]
  },
  "images": [
    { "id": "img-national-museum", "day": 1, "title": "国家博物馆外立面", "url": "https://commons.wikimedia.org/wiki/Special:FilePath/National_Museum_of_China,_Beijing.jpg?width=1200", "source": "Wikimedia Commons", "sourceUrl": "https://commons.wikimedia.org/wiki/File:National_Museum_of_China,_Beijing.jpg", "alt": "北京中国国家博物馆外立面", "biasWarning": "建筑外观图，无法代表当天排队和安检情况。" },
    { "id": "img-temple", "day": 1, "title": "天坛祈年殿", "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Temple_of_Heaven_-_Hall_of_Prayer_for_Good_Harvests.jpg?width=1200", "source": "Wikimedia Commons", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Temple_of_Heaven_-_Hall_of_Prayer_for_Good_Harvests.jpg", "alt": "天坛祈年殿建筑", "biasWarning": "晴天建筑图，雨天和暑期人流需现场判断。" },
    { "id": "img-universal", "day": 2, "title": "北京环球影城入口", "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Entrance_of_Universal_Studios_Beijing_(20210907121707).jpg?width=1200", "source": "Wikimedia Commons", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Entrance_of_Universal_Studios_Beijing_(20210907121707).jpg", "alt": "北京环球影城入口", "biasWarning": "入口图不能代表当天入园排队和项目等待时间。" },
    { "id": "img-forbidden", "day": 3, "title": "故宫午门", "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Meridian_Gate_(Forbidden_City)_2018-08-18_170110.jpg?width=1200", "source": "Wikimedia Commons", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Meridian_Gate_(Forbidden_City)_2018-08-18_170110.jpg", "alt": "故宫午门红墙入口", "biasWarning": "游客密度会随预约和天气变化，红墙机位需避开人流。" },
    { "id": "img-hutong", "day": 3, "title": "北京胡同街景", "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Fangzhuanchang_Hutong_(20210115130214).jpg?width=1200", "source": "Wikimedia Commons", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fangzhuanchang_Hutong_(20210115130214).jpg", "alt": "北京胡同街景", "biasWarning": "示意胡同氛围，具体胡同商业化和人流需现场判断。" },
    { "id": "img-summer-palace", "day": 4, "title": "颐和园昆明湖", "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Kunming_Lake_of_Summer_Palace_(20240706140421).jpg?width=1200", "source": "Wikimedia Commons", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kunming_Lake_of_Summer_Palace_(20240706140421).jpg", "alt": "颐和园昆明湖湖面", "biasWarning": "湖面光线和游船开放受天气、风力和园区安排影响。" }
  ],
  "days": [],
  "planB": [
    { "title": "雷雨增强", "detail": "D1 保留国博/北京坊/商场室内，天坛改 D4 下午或取消。D2 环球以室内项目、餐厅和商店过渡。" },
    { "title": "高温超预期", "detail": "D3 取消景山，D4 取消鸟巢夜景；每天 12:30-16:30 必须进入空调环境。" },
    { "title": "环球人流过高", "detail": "保留环球球、霍格沃茨远景、1-2 个项目和一场演出；优速通作为预算待决策项。" },
    { "title": "故宫未约上", "detail": "改景山 + 北海 + 什刹海 + 红墙外围短线，保留古都照片氛围但标注遗憾点。" }
  ],
  "budgetItems": [
    { "id": "budget-hotel-3n", "category": "accommodation", "title": "东单/王府井/前门中档酒店 3 晚", "plannedAmount": 2400, "actualAmount": null, "currency": "CNY", "day": null, "placeId": "hotel-wangfujing", "paid": false, "payer": "", "splitBetween": [], "status": "needs_verification", "note": "按 800 元/晚测试估算", "verificationNote": "房态、价格、早餐、电梯、取消政策需实时核验" },
    { "id": "budget-universal-ticket", "category": "tickets", "title": "北京环球影城日期票", "plannedAmount": 638, "actualAmount": null, "currency": "CNY", "day": 2, "placeId": "universal-beijing", "paid": false, "payer": "", "splitBetween": [], "status": "needs_verification", "note": "票价随日期变化，本金额为规划占位", "verificationNote": "以官方购票页为准" },
    { "id": "budget-universal-express", "category": "tickets", "title": "环球优速通待决策", "plannedAmount": 500, "actualAmount": null, "currency": "CNY", "day": 2, "placeId": "universal-beijing", "paid": false, "payer": "", "splitBetween": [], "status": "optional", "note": "人流高或只玩一天时再决定", "verificationNote": "以官方 App 当日价格为准" },
    { "id": "budget-city-tickets", "category": "tickets", "title": "故宫/天坛/颐和园/景山等门票", "plannedAmount": 160, "actualAmount": null, "currency": "CNY", "day": null, "placeId": "", "paid": false, "payer": "", "splitBetween": [], "status": "needs_verification", "note": "不含特展、讲解和联票差价", "verificationNote": "各官方渠道核验" },
    { "id": "budget-food", "category": "food", "title": "4 日餐饮", "plannedAmount": 900, "actualAmount": null, "currency": "CNY", "day": null, "placeId": "", "paid": false, "payer": "", "splitBetween": [], "status": "planned", "note": "按 225 元/日测试估算", "verificationNote": "" },
    { "id": "budget-transport", "category": "transport", "title": "市内交通", "plannedAmount": 260, "actualAmount": null, "currency": "CNY", "day": null, "placeId": "", "paid": false, "payer": "", "splitBetween": [], "status": "planned", "note": "地铁为主，热天和夜间补打车", "verificationNote": "打车价格按实时路况" },
    { "id": "budget-photo", "category": "photo", "title": "拍照道具/补电/储存", "plannedAmount": 160, "actualAmount": null, "currency": "CNY", "day": null, "placeId": "", "paid": false, "payer": "", "splitBetween": [], "status": "planned", "note": "发箍、魔杖租买、充电宝、云备份", "verificationNote": "" },
    { "id": "budget-reserve", "category": "reserve", "title": "高温和排队应急预备金", "plannedAmount": 500, "actualAmount": null, "currency": "CNY", "day": null, "placeId": "", "paid": false, "payer": "", "splitBetween": [], "status": "planned", "note": "临时打车、补水、改餐厅", "verificationNote": "" }
  ],
  "reservations": [
    { "id": "reservation-hotel", "type": "hotel", "title": "东单/王府井/前门住宿 3 晚", "status": "to_confirm", "day": null, "date": "2026-07-12", "time": "入住时间待定", "placeId": "hotel-wangfujing", "bookingUrl": "", "confirmationNumber": "", "documentNote": "确认后可把订单截图保存在个人设备，不建议放进公开站点", "cost": 2400, "currency": "CNY", "verificationNote": "核验可取消、电梯、空调、地铁距离" },
    { "id": "reservation-national-museum", "type": "activity", "title": "中国国家博物馆预约", "status": "to_book", "day": 1, "date": "2026-07-12", "time": "10:00", "placeId": "national-museum", "bookingUrl": "https://www.chnmuseum.cn/", "confirmationNumber": "", "documentNote": "实名预约二维码", "cost": 0, "currency": "CNY", "verificationNote": "开放日、预约放票和安检规则需核验" },
    { "id": "reservation-temple", "type": "ticket", "title": "天坛公园门票/联票", "status": "to_book", "day": 1, "date": "2026-07-12", "time": "16:00", "placeId": "temple-of-heaven", "bookingUrl": "https://www.tiantanpark.com/", "confirmationNumber": "", "documentNote": "电子票或身份证件", "cost": null, "currency": "CNY", "verificationNote": "旺季门票、联票、停止入园时间需核验" },
    { "id": "reservation-universal-ticket", "type": "ticket", "title": "北京环球影城日期票", "status": "to_book", "day": 2, "date": "2026-07-13", "time": "全天", "placeId": "universal-beijing", "bookingUrl": "https://www.universalbeijingresort.com/", "confirmationNumber": "", "documentNote": "官方 App 绑定票与入园证件", "cost": null, "currency": "CNY", "verificationNote": "营业时间、票价、项目维护和优速通需核验" },
    { "id": "reservation-palace", "type": "ticket", "title": "故宫博物院门票", "status": "to_book", "day": 3, "date": "2026-07-14", "time": "08:30", "placeId": "forbidden-city", "bookingUrl": "https://ticket.dpm.org.cn/", "confirmationNumber": "", "documentNote": "实名预约与身份证件", "cost": null, "currency": "CNY", "verificationNote": "周一闭馆、放票时间、暑期规则需核验" },
    { "id": "reservation-summer-palace", "type": "ticket", "title": "颐和园门票/联票", "status": "to_book", "day": 4, "date": "2026-07-15", "time": "07:30", "placeId": "summer-palace", "bookingUrl": "https://www.summerpalace-china.com/", "confirmationNumber": "", "documentNote": "电子票或身份证件", "cost": null, "currency": "CNY", "verificationNote": "开门时间、游船、联票和入园口需核验" }
  ],
  "packingItems": [
    { "id": "packing-id", "category": "documents", "name": "身份证件/学生证等优惠证件", "quantity": 1, "owner": "", "required": true, "packed": false, "note": "故宫、国博、环球等实名核验可能需要" },
    { "id": "packing-phone", "category": "devices", "name": "手机、充电器、充电宝", "quantity": 1, "owner": "", "required": true, "packed": false, "note": "环球和故宫日耗电高" },
    { "id": "packing-storage", "category": "photo gear", "name": "云备份/手机存储空间清理", "quantity": 1, "owner": "", "required": true, "packed": false, "note": "至少预留 20GB 照片视频空间" },
    { "id": "packing-rain", "category": "weather gear", "name": "轻便雨衣/折叠伞", "quantity": 1, "owner": "", "required": true, "packed": false, "note": "D1-D2 有雷雨/阵雨" },
    { "id": "packing-sun", "category": "weather gear", "name": "防晒霜、墨镜、帽子、冰袖", "quantity": 1, "owner": "", "required": true, "packed": false, "note": "D3-D4 高温暴晒" },
    { "id": "packing-shoes", "category": "clothes", "name": "舒适防滑鞋", "quantity": 1, "owner": "", "required": true, "packed": false, "note": "环球和故宫步数高" },
    { "id": "packing-electrolyte", "category": "medicine", "name": "电解质、常用药、创可贴", "quantity": 1, "owner": "", "required": true, "packed": false, "note": "高温和长步行备用" },
    { "id": "packing-outfit", "category": "photo gear", "name": "白/浅蓝/学院风上衣或轻薄外搭", "quantity": 1, "owner": "", "required": false, "packed": false, "note": "适配天坛、故宫和环球" }
  ],
  "todos": [
    { "id": "todo-check-weather", "phase": "threeDaysBefore", "title": "复核北京 4 天天气和雷雨预警", "priority": "high", "status": "open", "owner": "", "day": null, "placeId": "", "verificationNote": "影响 D1 天坛和 D2 环球室外项目" },
    { "id": "todo-book-universal", "phase": "threeDaysBefore", "title": "购买环球影城日期票并评估优速通", "priority": "high", "status": "open", "owner": "", "day": 2, "placeId": "universal-beijing", "verificationNote": "以官方 App/官网为准" },
    { "id": "todo-book-palace", "phase": "sevenDaysBefore", "title": "预约故宫 7 月 14 日门票", "priority": "high", "status": "open", "owner": "", "day": 3, "placeId": "forbidden-city", "verificationNote": "故宫周一闭馆，实名预约" },
    { "id": "todo-book-museum", "phase": "threeDaysBefore", "title": "预约国博 7 月 12 日入馆", "priority": "medium", "status": "open", "owner": "", "day": 1, "placeId": "national-museum", "verificationNote": "若约不上，D1 改北京坊/首博" },
    { "id": "todo-pack-heat", "phase": "oneDayBefore", "title": "准备防晒、雨具、电解质和充电宝", "priority": "high", "status": "open", "owner": "", "day": null, "placeId": "", "verificationNote": "" },
    { "id": "todo-universal-app", "phase": "eachMorning", "title": "环球日早晨查看官方 App 开园、项目等待和演出时间", "priority": "high", "status": "open", "owner": "", "day": 2, "placeId": "universal-beijing", "verificationNote": "现场动态变化大" },
    { "id": "todo-water", "phase": "eachMorning", "title": "每人带水并设定午后空调休息点", "priority": "high", "status": "open", "owner": "", "day": null, "placeId": "", "verificationNote": "7 月 14-15 日中暑风险高" },
    { "id": "todo-backup-photos", "phase": "eachNight", "title": "每晚备份照片并删除废片", "priority": "medium", "status": "open", "owner": "", "day": null, "placeId": "", "verificationNote": "为环球和故宫照片留空间" },
    { "id": "todo-return-check", "phase": "beforeReturn", "title": "返程前检查证件、充电器、雨具和门票截图", "priority": "medium", "status": "open", "owner": "", "day": 4, "placeId": "hotel-wangfujing", "verificationNote": "" }
  ],
  "sources": [
    { "name": "天气预报", "url": "weather tool: Beijing, China, 2026-07-12 to 2026-07-15", "usedFor": "天气、体感和 Plan B" },
    { "name": "北京环球度假区官网", "url": "https://www.universalbeijingresort.com/", "usedFor": "门票、营业时间、项目状态核验入口" },
    { "name": "故宫博物院票务", "url": "https://ticket.dpm.org.cn/", "usedFor": "故宫预约核验入口" },
    { "name": "中国国家博物馆", "url": "https://www.chnmuseum.cn/", "usedFor": "D1 室内活动预约核验入口" },
    { "name": "天坛公园", "url": "https://www.tiantanpark.com/", "usedFor": "天坛门票和开放信息核验入口" },
    { "name": "小红书 OpenCLI 公共搜索", "url": "opencli xiaohongshu search", "usedFor": "环球人流、北京四日路线、拍照机位趋势抽样" },
    { "name": "Wikimedia Commons", "url": "https://commons.wikimedia.org/", "usedFor": "测试版公开图片来源" }
  ],
  "missingImageChecklist": [
    { "date": "2026-07-13", "attraction": "环球影城霍格沃茨湖边机位", "requiredImageType": "普通游客视角 + 下午光线", "searchKeywords": "北京环球影城 霍格沃茨 湖边 机位", "suggestedPlatform": "小红书/地图用户照片", "whyNeeded": "当前测试版只放入口图，不能充分说明城堡机位和排队现实。" },
    { "date": "2026-07-14", "attraction": "故宫红墙侧线", "requiredImageType": "暑期人流普通视角", "searchKeywords": "故宫 红墙 机位 暑假 人多吗", "suggestedPlatform": "小红书/地图用户照片", "whyNeeded": "Wikimedia 图偏建筑展示，缺少暑期人流判断。" }
  ]
};

window.TRIP_DATA.days = [
  {"day":1,"date":"2026-07-12","city":"北京中轴线","hotel":"东单/王府井/前门一带","theme":"雷雨缓冲 + 中轴线初见","weather":{"condition":"上午强雷雨风险，午后闷热","high":"30℃","low":"23℃","rainProbability":"上午高","wind":"雷雨时阵风需防范","clothingAdvice":"轻薄速干、防滑鞋、折叠伞或雨衣、薄外套用于室内空调"},"route":["住宿区","中国国家博物馆","前门/大栅栏","天坛祈年殿","住宿区"],"timeSlots":[{"time":"09:30-10:00","title":"慢启动与天气判断","place":"酒店/住宿区","transport":"步行或地铁","cost":"0-10 元","walking":"1000 步","staminaCost":"低","handbook":"先看雷达和国博预约状态。若雷雨明显，延后出门。","cutIfDelayed":"取消前门，只保留国博和天坛。"},{"time":"10:00-12:30","title":"国博室内缓冲","place":"中国国家博物馆","transport":"地铁 1/2 号线 + 步行","cost":"预约免费，讲解另计","walking":"3500 步","staminaCost":"中","handbook":"适合雷雨上午。安检和预约二维码提前准备，拍建筑外立面要避开广场人流。","cutIfDelayed":"只看一层重点展厅，避免逛到体力透支。"},{"time":"13:30-15:30","title":"前门与大栅栏补街景","place":"前门大街","transport":"步行/地铁","cost":"餐饮 60-120 元/人","walking":"3500 步","staminaCost":"中","handbook":"雨后路面反光适合拍街景，商业街消费先看菜单和排队。","cutIfDelayed":"只在正阳门附近拍照，直接转天坛。"},{"time":"16:00-18:00","title":"天坛祈年殿傍晚拍照","place":"天坛公园","transport":"地铁 8 号线或打车","cost":"门票/联票需核验","walking":"4500 步","staminaCost":"中","handbook":"机位以祈年殿轴线、侧边红墙、树影框景为主。雨后注意台阶湿滑。","cutIfDelayed":"只拍祈年殿外圈，不进深处。"}],"photoPlan":[{"shotName":"祈年殿轴线","spot":"祈年殿南侧轴线","bestTime":"16:30 后","pose":"人站画面下三分之一，向侧前方走","composition":"0.5x 收完整建筑，2x 拍人像压缩","outfit":"白、浅蓝、米色更干净","props":"小伞可做雨后道具","devicePlan":"手机打开网格线，曝光略降","weatherAndCrowdFallback":"雨大则改国博室内和前门檐下","aiOutputRole":"九宫格封面与城市初见页"}],"meals":{"lunch":"前门/大栅栏，避开排队过长网红店","dinner":"天坛东门或返回王府井，选空调充足的店"},"walking":{"minutes":"90-120 分钟","steps":"10000-12500","intensity":"中"},"safety":{"heat":"闷热和雷雨切换，补水和防滑优先","medical":"附近医院信息出发前需核验"},"backupPlan":{"rain":["国博 + 前门室内餐饮"],"heatOrCold":["取消天坛深度游，只拍祈年殿"],"lowStamina":["前门和天坛二选一"],"crowd":["前门改杨梅竹斜街短线"],"closure":["国博预约失败则改首都博物馆或北京坊"],"delay":["压缩前门停留"]},"aiOutputs":["城市初见九宫格","雨后中轴线短视频开头"]},
  {"day":2,"date":"2026-07-13","city":"北京环球度假区","hotel":"东单/王府井/前门一带","theme":"环球影城整日项目 + 拍照","weather":{"condition":"上午阵雨，下午转晴","high":"32℃","low":"22℃","rainProbability":"上午中高","wind":"阵雨时注意户外项目暂停","clothingAdvice":"速干上衣、防晒帽、轻便雨衣、舒适鞋"},"route":["住宿区","环球影城入口","热门项目","霍格沃茨/好莱坞/功夫熊猫机位","城市大道晚餐","住宿区"],"timeSlots":[{"time":"07:20-08:30","title":"出发到环球","place":"住宿区 -> 环球度假区","transport":"地铁 1/7 号线或打车","cost":"地铁约 8 元，打车需实时核验","walking":"1500 步","staminaCost":"低","handbook":"提前在官方 App 绑定票、查开园和项目等待。雨天带轻便雨衣，安检前少带大件。","cutIfDelayed":"若晚到，先拍环球球，再按等待时间选室内项目。"},{"time":"08:30-11:30","title":"入园与第一轮项目","place":"北京环球影城","transport":"步行","cost":"门票和优速通需核验","walking":"5000 步","staminaCost":"中高","handbook":"上午若下雨，优先室内或排队遮蔽较好的项目。热门项目和拍照分开，不要边排队边纠结机位。","cutIfDelayed":"放弃低优先级演出，保留哈利波特区和变形金刚区。"},{"time":"12:00-15:00","title":"午餐与室内缓冲","place":"园区餐厅/功夫熊猫区域","transport":"步行","cost":"餐饮 100-180 元/人","walking":"2500 步","staminaCost":"中","handbook":"中午避开暴晒，坐下补水。拍照服装可准备轻薄外搭，避免汗湿影响照片。","cutIfDelayed":"午餐后直接转霍格沃茨外景。"},{"time":"15:30-19:30","title":"户外拍照与第二轮项目","place":"哈利波特/好莱坞/变形金刚","transport":"步行","cost":"园区消费按需","walking":"6500 步","staminaCost":"高","handbook":"下午转晴后拍城堡、环球球和街区。人像用 2x/3x 压缩背景，避开正午顶光。","cutIfDelayed":"只保留城堡、环球球、一个项目返场。"},{"time":"20:00-21:30","title":"城市大道晚餐后错峰返程","place":"北京环球城市大道","transport":"地铁/打车","cost":"餐饮 100-200 元/人","walking":"1500 步","staminaCost":"中","handbook":"不要和闭园人潮同时冲地铁。若很累，打车到市区但需看价格和排队。","cutIfDelayed":"园区内简餐后直接返程。"}],"photoPlan":[{"shotName":"环球球经典照","spot":"入口环球球斜侧","bestTime":"入园前或出园后","pose":"人离镜头近，球在后方完整露出","composition":"0.5x 收环境，1x 拍标准游客照","outfit":"亮色上衣或学院风配饰","props":"魔杖、发箍、雨衣透明款","devicePlan":"连拍抓转身和走路","weatherAndCrowdFallback":"雨天在檐下等人少再拍","aiOutputRole":"环球日封面"},{"shotName":"霍格沃茨远景","spot":"桥边或湖边远景","bestTime":"下午转晴后","pose":"侧身回头，避免正面游客照","composition":"2x 压缩城堡，人站侧边","outfit":"深色学院风或白衬衫","props":"魔杖","devicePlan":"降低曝光保留天空","weatherAndCrowdFallback":"人多时拍半身和城堡局部","aiOutputRole":"短视频高潮镜头"}],"meals":{"lunch":"园区内室内餐厅，按排队选择","dinner":"城市大道，错峰返程"},"walking":{"minutes":"180-240 分钟","steps":"17000-22000","intensity":"高"},"safety":{"heat":"补水、电解质、遮阳，午后安排室内休息","medical":"园区急救点位置以官方 App 为准"},"backupPlan":{"rain":["功夫熊猫等室内区域","推迟户外城堡照到下午"],"heatOrCold":["中午固定坐下休息 60 分钟"],"lowStamina":["少刷项目，多拍照和演出"],"crowd":["购买优速通或减少项目目标"],"closure":["以官方 App 项目开放状态调整"],"delay":["取消城市大道长晚餐"]},"aiOutputs":["环球影城九宫格","项目排队小贴士卡片"]},
  {"day":3,"date":"2026-07-14","city":"故宫与什刹海","hotel":"东单/王府井/前门一带","theme":"红墙核心日，午后降强度","weather":{"condition":"多云炎热，午后小雨","high":"34℃","low":"21℃","rainProbability":"午后中","wind":"弱风，体感闷热","clothingAdvice":"浅色透气衣物、防晒帽、墨镜、轻薄防晒外套"},"route":["住宿区","故宫午门","故宫中轴线","景山公园","酒店午休","什刹海/胡同"],"timeSlots":[{"time":"07:30-08:30","title":"早到午门","place":"故宫午门","transport":"地铁 + 步行/打车到外围","cost":"门票需核验","walking":"1500 步","staminaCost":"低","handbook":"带身份证件，少带大包。暑期安检和入场排队要留足时间。","cutIfDelayed":"少拍广场，直接入宫。"},{"time":"08:30-12:30","title":"故宫红墙与中轴线","place":"故宫博物院","transport":"步行","cost":"门票和展馆票需核验","walking":"7000 步","staminaCost":"高","handbook":"走中轴线 + 东西侧红墙边缘机位，避免在午后暴晒中硬逛。","cutIfDelayed":"取消珍宝馆或钟表馆，保留太和门和红墙。"},{"time":"13:00-14:00","title":"景山俯拍，可选","place":"景山公园","transport":"步行","cost":"门票需核验","walking":"2000 步含台阶","staminaCost":"中高","handbook":"只有体力和天气允许才上万春亭。高温时直接回酒店。","cutIfDelayed":"直接取消景山。"},{"time":"14:30-16:30","title":"酒店午休","place":"住宿区","transport":"打车/地铁","cost":"20-60 元需核验","walking":"低","staminaCost":"低","handbook":"这是高温日的关键，不要用咖啡店代替真正休息。","cutIfDelayed":"保留至少 45 分钟坐下休息。"},{"time":"17:00-19:00","title":"什刹海与胡同傍晚","place":"什刹海/鼓楼周边","transport":"地铁/打车","cost":"餐饮 80-150 元/人","walking":"4000 步","staminaCost":"中","handbook":"傍晚拍胡同和湖面，避开正午光。商业化区域只做短停。","cutIfDelayed":"只吃晚饭，不再加拍照点。"}],"photoPlan":[{"shotName":"红墙侧影","spot":"故宫红墙边缘、人流少的侧线","bestTime":"09:00-10:30","pose":"侧身走路或回头，不堵路","composition":"红墙占 2/3，人占下方三分之一","outfit":"白、黑、深蓝或中式盘扣元素","props":"小扇子或素色包","devicePlan":"2x 人像模式，注意不要过度虚化建筑线条","weatherAndCrowdFallback":"人多时拍墙面局部和手部细节","aiOutputRole":"红墙封面图"},{"shotName":"景山中轴线","spot":"万春亭观景处","bestTime":"天气通透时","pose":"以景为主，人做剪影或背影","composition":"0.5x 收全景，横构图","outfit":"简洁深色更稳","props":"无","devicePlan":"锁定曝光，避免天空过曝","weatherAndCrowdFallback":"热或雾霾明显则取消","aiOutputRole":"路线总结页"}],"meals":{"lunch":"故宫外或返回酒店附近，先找有空调和座位的店","dinner":"什刹海/鼓楼周边，避开只靠景观溢价的店"},"walking":{"minutes":"150-210 分钟","steps":"15000-19000","intensity":"高"},"safety":{"heat":"最容易中暑的一天，必须午休","medical":"故宫周边医疗点和医院出发前需核验"},"backupPlan":{"rain":["故宫继续可行，但减少景山"],"heatOrCold":["取消景山，延长午休"],"lowStamina":["故宫只走中轴线"],"crowd":["多走侧边红墙，不挤热门门洞"],"closure":["故宫预约失败则改景山 + 北海 + 什刹海 + 红墙外围短线"],"delay":["取消什刹海拍照，只吃晚饭"]},"aiOutputs":["红墙九宫格","北京古都感短视频中段"]},
  {"day":4,"date":"2026-07-15","city":"颐和园与奥林匹克公园","hotel":"东单/王府井/前门一带","theme":"清晨湖面，下午降温休整","weather":{"condition":"晴热，高温风险高","high":"36℃","low":"22℃","rainProbability":"低","wind":"弱风","clothingAdvice":"速干衣、防晒帽、墨镜、防晒霜、冰袖或遮阳伞"},"route":["住宿区","颐和园东宫门/昆明湖","午休","奥林匹克公园夜景可选"],"timeSlots":[{"time":"06:50-07:40","title":"早出发去颐和园","place":"住宿区 -> 颐和园","transport":"地铁 4 号线/打车","cost":"地铁约 6 元，打车需核验","walking":"1200 步","staminaCost":"低","handbook":"36℃日必须早出。早餐带走，水提前买好。","cutIfDelayed":"若 09:00 后才出发，缩短为昆明湖和长廊。"},{"time":"07:40-11:30","title":"昆明湖与长廊","place":"颐和园","transport":"步行","cost":"门票/联票/游船需核验","walking":"7000 步","staminaCost":"中高","handbook":"清晨拍湖面、长廊、佛香阁远景，不建议烈日下爬太多台阶。","cutIfDelayed":"取消佛香阁，保留湖边和长廊。"},{"time":"12:30-16:30","title":"午休与整理照片","place":"酒店/商场","transport":"地铁/打车","cost":"餐饮 80-150 元/人","walking":"低","staminaCost":"低","handbook":"高温日把下午当恢复段，整理照片、备份素材、补电。","cutIfDelayed":"直接休息到晚饭。"},{"time":"18:30-20:00","title":"鸟巢夜景可选","place":"奥林匹克公园","transport":"地铁 8 号线","cost":"交通约 10 元","walking":"3000 步","staminaCost":"中","handbook":"体力好再去，夜景比白天舒服。返程时间紧则取消。","cutIfDelayed":"只在酒店附近吃饭，准备返程。"}],"photoPlan":[{"shotName":"昆明湖清晨","spot":"昆明湖边开阔处","bestTime":"08:00 前后","pose":"背影或侧身看湖","composition":"湖面占下半，远山建筑占上半","outfit":"白、浅绿、浅蓝适合夏日湖景","props":"遮阳伞可做道具","devicePlan":"0.5x 拍湖面，2x 拍人物和建筑压缩","weatherAndCrowdFallback":"太阳太烈时转长廊阴影","aiOutputRole":"收尾海报图"},{"shotName":"鸟巢夜景","spot":"奥林匹克公园步道","bestTime":"亮灯后","pose":"背影或侧脸，避免挡路","composition":"1x 稳定构图，夜景模式保持手机稳定","outfit":"深色或简洁白色","props":"无","devicePlan":"夜景模式，找栏杆或台阶稳定手机","weatherAndCrowdFallback":"体力不足则取消","aiOutputRole":"四日总结结尾"}],"meals":{"lunch":"颐和园出园后或地铁沿线商场","dinner":"奥林匹克公园/王府井附近，按体力选择"},"walking":{"minutes":"110-160 分钟","steps":"11000-15000","intensity":"中高"},"safety":{"heat":"最高温日，任何头晕都应停止户外","medical":"颐和园周边医院和药店出发前需核验"},"backupPlan":{"rain":["雨小可拍长廊，雨大改商场/博物馆"],"heatOrCold":["取消奥林匹克公园，只保留颐和园早晨"],"lowStamina":["颐和园只走东宫门到长廊短线"],"crowd":["避开佛香阁台阶和游船排队"],"closure":["颐和园不可行则改圆明园短线"],"delay":["取消夜景"]},"aiOutputs":["旅程收尾海报","四日九宫格排版"]}
];
