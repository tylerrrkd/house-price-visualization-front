/**
 * Created by kaida on 2018/4/4.
 */
// 全局变量
var community_point = null; // 百度地图坐标点
var url = new URL(window.location.href);
var community = url.searchParams.get("community");
var district = "";
var bizcircle = "";

$(document).ready(function () {
    // 公共页面提取导入
    $(function () {
        $('#main-header').load("common/main-header.html");
        $('#main-sidebar').load("common/main-sidebar.html", function () {
            //$('#sidebar_signature').addClass('active');
        });
        // footer 引入会导致错版
        $('#main-footer').load("common/main-footer.html");
    });

    // 初始化百度地图
    baiduMapInit();

    // 获取今日时间 HTML5 HTMLInputElement valueAsDate
    //document.getElementById("form-endTime").valueAsDate = new Date();
});

// 获取小区数据
$.ajax({
    type: 'get',
    url: 'http://127.0.0.1:8000/api/community/title/' + community,
    dataType: 'json',
    success: function (result) {
        console.log(result);
        // 渲染到页面
        $("#community_name").text(result.title);
        $("#title").text(result.title);
        $("#district").text(result.district);
        $("#year").text(result.year);
        $("#housetype").text(result.housetype);
        $("#service").text(result.service);
        $("#company").text(result.company);
        $("#building_num").text(result.building_num);
        $("#house_num").text(result.house_num);
        $("#onsale").text(result.onsale);
        $("#cost").text(result.cost);
        $("#price").text(result.price);
        $("#bizcircle").text(result.bizcircle);
        // 赋值给district
        district = result.district;
        bizcircle = result.bizcircle;
    },

    error: function () {
        console.log('获取不到小区啊宝贝');
    }
});


// 初始化百度地图
function baiduMapInit() {
    // 基础设施数组
    var aFacilities = ["地铁", "公交", "学校", "医院", "写字楼", "购物"];
    var address = "广东省广州市" + district + "区" + bizcircle + community;
    console.log("这里是：" + address);
    var map = new BMap.Map("allmap");
    map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
    // 创建地址解析器
    var myGeo = new BMap.Geocoder();
    // 解析地址显示在地图上，调整地图视野
    myGeo.getPoint(address, function (point) {
        if (point) {
            // 赋值给全局变量
            community_point = point;

            map.centerAndZoom(point, 15);
            map.addOverlay(new BMap.Marker(point));
            // console.log(point.lat + ", " + point.lng);
            // getFacilities_test(map, point);
            // 获取基础设施
            $(aFacilities).each(function (index, item) {
                getFacilities(item, point);
            });
        } else {
            alert("您选择的地址没有解析到结果！");
        }
    }, "广州市");
}

// 基础设施点击 更多
// 在地图上显示 设施位置
function getFacilitiesInMap(type) {
    /*
     共用全局地图，减少地图加载次数
     * */
    // 百度地图API功能
    var map = new BMap.Map("allmap");
    var mPoint = new BMap.Point(community_point.lng, community_point.lat);
    console.log(mPoint);
    map.enableScrollWheelZoom();
    map.centerAndZoom(mPoint, 15);
    // 查看周边同时 显示原坐标点位置
    map.addOverlay(new BMap.Marker(mPoint));

    // 显示方圆1公里周边
    var circle = new BMap.Circle(mPoint, 1000, {
        fillColor: "blue",
        strokeWeight: 1,
        fillOpacity: 0.3,
        strokeOpacity: 0.3
    });
    map.addOverlay(circle);
    // pageCapacity 设置最大值
    var local = new BMap.LocalSearch(map, {renderOptions: {map: map, autoViewport: false}, pageCapacity: 10});
    local.searchNearby(type, mPoint, 1000);
}

// 获取基础设施
function getFacilities(type, point) {
    $.ajax({
        type: "get", //请求方式
        url: "http://api.map.baidu.com/place/v2/search?query=" + type + "&location=" + point.lat + "," + point.lng + "&radius=1000&output=json&ak=gh4PjU5UsCxml6vxPDmshSDaIWl63Vz8",
        dataType: "jsonp",
        success: function (data) {
            if (type == "写字楼") {
                $("#building").text(data.results.length);
            }
            if (type == "学校") {
                $("#school").text(data.results.length);
            }
            if (type == "医院") {
                $("#hospital").text(data.results.length);
            }
            if (type == "地铁") {
                $("#subway").text(data.results.length);
            }
            if (type == "购物") {
                $("#shopping").text(data.results.length);
            }
            if (type == "公交") {
                $("#bus").text(data.results.length);
            }
        },
        error: function (jqXHR, error, errorThrown) {
            if (jqXHR.status && jqXHR.status == 400) {
                console.log(jqXHR.responseText);
            } else {
                console.log("地图基础设施获取出错了宝贝");
            }
        }
    });
}