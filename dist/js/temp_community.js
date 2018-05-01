/**
 * Created by kaida on 2018/4/9.
 */
$(function () {
    $("#navbar").load("navbar.html");
    $("#sidebar").load("sidebar.html");
});

var url = new URL(window.location.href);
var community = url.searchParams.get("community");
var day = new Date();
var today = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate();

function formatDate(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    return year + '-' + month + '-' + day;
}

var pastseason = new Date()
pastseason.setMonth(pastseason.getMonth() - 4)
var stime = formatDate(pastseason);
var etime = formatDate(new Date());

$.ajax({
    type: "post",
    url: appConfig.URL + "/api/user/collect/verify",
    data: "community=" + community,
    dataType: "json",
    success: function (result) {
        $('h2 button').text('取消关注');
        $('h2 button').off('click').on('click', uncollect);
    },
    error: function (jqXHR, error, errorThrown) {
        $('h2 button').text('关注小区');
        $('h2 button').off('click').on('click', collect);
    }
});

$.ajax({
    type: "get", //请求方式
    url: appConfig.URL + "/api/community/location/" + community,
    dataType: "json",
    success: function (result) {
        var lat = result.data[0].Lat;
        var lng = result.data[0].Lng;
        theLocation(lng, lat);
        $("#building").append(result.data[0].Work);
        $("#school").append(result.data[0].School);
        $("#hospital").append(result.data[0].Hospital);
        $("#subway").append(result.data[0].Subway);
        $("#shopping").append(result.data[0].Shopping);
        $("#bus").append(result.data[0].Bus);
        //getResource(lng, lat, "学校");
        //getResource(lng, lat, "医院");
        //getResource(lng, lat, "地铁");
        //getResource(lng, lat, "购物");
        //getResource(lng, lat, "写字楼");
        //getResource(lng, lat, "公交");
    }
});

$.ajax({
    type: "get",
    url: appConfig.URL + "/api/community/title/" + community,
    dataType: "json",
    success: function (result) {
        $("#title").append(result.data[0].Title);
        $("#district").append(result.data[0].District);
        $("#year").append(result.data[0].Year);
        $("#housetype").append(result.data[0].Housetype);
        $("#service").append(result.data[0].Service);
        $("#company").append(result.data[0].Company);
        $("#building_num").append(result.data[0].BuildingNum);
        $("#house_num").append(result.data[0].HouseNum);
        $("#onrent").append(result.data[0].Onrent);
        $("#onsale").append(result.data[0].Onsale);
        $("#cost").append(result.data[0].Cost);
        $("#price").append(result.data[0].Price);
        $("#bizcircle").append(result.data[0].Bizcircle);
        get_neighbor_community(result.data[0].Bizcircle, result.data[0].Price, result.data[0].Title);
    }
});

$.ajax({
    type: "get",
    url: appConfig.URL + "/api/rent/zone/" + community +
    "?stime=" + stime +
    "&etime=" + etime,
    dataType: "json",
    success: function (result) {
        addBarGraph(result.data, community);
        $("#rent-button").append("<a href=\"rentinfo.html?community=" + community + "\" class=\"btn btn-primary btn-xs\" role=\"button\">更多</a>")
    }
});

$.ajax({
    type: "get",
    url: appConfig.URL + "/api/sell/unitprice/" + community,
    dataType: "json",
    success: function (result) {
        addLineGraph(result.data, community);
        $("#sell-button").append("<a href=\"sellinfo.html?community=" + community + "\" class=\"btn btn-primary btn-xs\" role=\"button\">更多</a>")
    }
});


$.ajax({
    type: "get",
    url: appConfig.URL + "/api/sell/housetype/" + community,
    dataType: "json",
    success: function (result) {
        addPieGraph(result.data, community);
        $("#detail-button").append("<a href=\"detail.html?community=" + community + "\" class=\"btn btn-primary btn-xs\" role=\"button\">更多</a>")
    }
});

// 百度地图API功能
function theLocation(lng, lat) {
    var map = new BMap.Map("allmap");
    var new_point = new BMap.Point(lng, lat);
    map.centerAndZoom(new BMap.Point(new_point), 15);
    map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
    map.clearOverlays();
    var marker = new BMap.Marker(new_point); // 创建标注
    map.addOverlay(marker); // 将标注添加到地图中
    map.panTo(new_point);
}

function getResource(lng, lat, type) {
    $.ajax({
        type: "get", //请求方式
        url: "//api.map.baidu.com/place/v2/search?query=" + type + "&location=" + lat + "," + lng + "&radius=1000&output=json&ak=RMsBxynsctluZhYpWMdv2wGQVFLcV5Za",
        dataType: "jsonp",
        success: function (data) {
            if (type == "写字楼") {
                $("#building").append(data.results.length);
            }
            if (type == "学校") {
                $("#school").append(data.results.length);
            }
            if (type == "医院") {
                $("#hospital").append(data.results.length);
            }
            if (type == "地铁") {
                $("#subway").append(data.results.length);
            }
            if (type == "购物") {
                $("#shopping").append(data.results.length);
            }
            if (type == "公交") {
                $("#bus").append(data.results.length);
            }

        },
        error: function (jqXHR, error, errorThrown) {
            if (jqXHR.status && jqXHR.status == 400) {
                console.log(jqXHR.responseText);

            } else {
                console.log("Something went wrong");
            }
        }

    });
}

function addBarGraph(data, input) {
    var x = [];
    var y = [];

    for (var i in data) {
        x.push(data[i]["Zone"]);
        y.push(data[i]["Price"]);
    }

    var chartdata = {
        labels: x,
        datasets: [{
            label: input,
            backgroundColor: 'rgba(151,187,205,0.5)',
            borderColor: 'rgba(151,187,205,1)',
            hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
            hoverBorderColor: 'rgba(200, 200, 200, 1)',
            data: y
        }]
    };

    var chartOptions = {
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    suggestedMin: 0, // minimum will be 0, unless there is a lower value.
                }
            }]
        }
    };

    $('#rentcanvas').remove();
    $('#chart-rent').append('<canvas id="rentcanvas"></canvas>');

    var ctx = $("#rentcanvas");

    var barGraph = new Chart(ctx, {
        type: "bar",
        data: chartdata,
        options: chartOptions,
    });
}

function showResource(type) {
    $.ajax({
        type: "get", //请求方式
        url: appConfig.URL + "/api/community/location/" + community,
        dataType: "json",
        success: function (result) {
            var lat = result.data[0].Lat;
            var lng = result.data[0].Lng;
            var map = new BMap.Map("allmap");
            var mPoint = new BMap.Point(lng, lat);
            map.enableScrollWheelZoom();
            map.centerAndZoom(mPoint, 15);

            var marker = new BMap.Marker(mPoint); // 创建标注
            map.addOverlay(marker);

            var circle = new BMap.Circle(mPoint, 1000, {
                fillColor: "blue",
                strokeWeight: 1,
                fillOpacity: 0.3,
                strokeOpacity: 0.3
            });
            map.addOverlay(circle);
            var local = new BMap.LocalSearch(map, {renderOptions: {map: map, autoViewport: false}});
            local.searchNearby(type, mPoint, 1000);
        }
    });
}

function addLineGraph(data, input) {
    var x = [];
    var y = [];

    for (var i in data) {
        x.push(data[i]["Time"]);
        y.push(data[i]["Unitprice"]);
    }

    var chartdata = {
        labels: x,
        datasets: [{
            label: input,
            backgroundColor: 'rgba(151,187,205,0.5)',
            borderColor: 'rgba(151,187,205,1)',
            hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
            hoverBorderColor: 'rgba(200, 200, 200, 1)',
            data: y
        }]
    };

    $('#unitpricecanvas').remove();
    $('#chart-unitprice').append('<canvas id="unitpricecanvas"></canvas>');

    var ctx = $("#unitpricecanvas");

    var barGraph = new Chart(ctx, {
        type: "line",
        data: chartdata,
    });
}

function addPieGraph(data, input) {
    var x = [];
    var y = [];
    var coloR = [];

    var dynamicColors = function () {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    };

    for (var i in data) {
        x.push(data[i]["Type"]);
        y.push(data[i]["Total"]);
        coloR.push(dynamicColors());
    }

    var chartdata = {
        labels: x,
        datasets: [{
            label: input,
            backgroundColor: coloR,
            borderColor: 'rgba(151,187,205,1)',
            hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
            hoverBorderColor: 'rgba(200, 200, 200, 1)',
            data: y
        }]
    };

    $('#detailcanvas').remove();
    $('#chart-detail').append('<canvas id="detailcanvas"></canvas>');

    var ctx = $("#detailcanvas");

    var barGraph = new Chart(ctx, {
        type: "pie",
        data: chartdata,
    });
}

function get_neighbor_community(bizcircle, price, community) {
    $.ajax({
        type: "get",
        url: appConfig.URL + "/api/community/bizcircle/" + bizcircle,
        dataType: "json",
        success: function (result) {
            var data = filter_community(result, price, community)
            $.each(data, function (i, item) {
                $('#community-list').append("<tr><td><a href='map.html?community=" + item.Title + "'>" + item.Title +
                    "</td><td>" + item.Price +
                    "</td><td>" + item.Year +
                    "</td><td>" + item.Onsale + "</td></tr>")
            });
        },

    });
}

function filter_community(data, price, title) {
    var result = [];
    $.each(data.data, function (i, item) {
        if (Math.abs(item.Price - price) < 10000 && item.Onsale > 0 && item.Title != title) {
            result.push(item);
        }
    });
    return result.slice(0, 5)
}

function collect() {
    var community = url.searchParams.get("community");
    $.ajax({
        type: "post",
        url: appConfig.URL + "/api/user/collect",
        data: "community=" + community,
        dataType: "json",
        success: function (result) {
            $('h2 button').text('取消关注');
            $('h2 button').off('click').on('click', uncollect);
        },
        error: function (jqXHR, error, errorThrown) {
            if (jqXHR.status && jqXHR.status == 403) {
                $("#alert").html("<div class=\"alert alert-danger text-center\" role=\"alert\" id=\"alert\">登录后可关注<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
            }
        }
    });
}

function uncollect() {
    var community = url.searchParams.get("community");
    $.ajax({
        type: "post",
        url: appConfig.URL + "/api/user/collect/cancel",
        data: "community=" + community,
        dataType: "json",
        success: function (result) {
            $('h2 button').text('关注小区');
            $('h2 button').off('click').on('click', collect);
        },
        error: function (jqXHR, error, errorThrown) {
            if (jqXHR.status && jqXHR.status == 400) {
                $("#alert").html("<div class=\"alert alert-danger text-center\" role=\"alert\" id=\"alert\">登录后可关注<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
            }
        }
    });
}