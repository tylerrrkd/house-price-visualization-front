/**
 * Created by kaida on 2018/4/4.
 */
$(document).ready(function () {
    var url = new URL(window.location.href);
    var metro = url.searchParams.get("metro");
    // 初始化地铁导航栏
    initMetroNavTabs();
    // 通过url发起的请求直接进行搜索
    if (metro) {
        $('#metro_station').val(metro);
        getCommunityByMetro();
    }

    // 公共页面提取导入
    $(function () {
        $('#main-header').load("common/main-header.html");
        $('#main-sidebar').load("common/main-sidebar.html", function () {
            $('#sidebar_metro').addClass('active');
        });
        // footer 引入会导致错版
        $('#main-footer').load("common/main-footer.html")
    });
});

// 初始化地铁导航栏
function initMetroNavTabs() {
    // 地铁导航栏
    $.ajax({
        type: "get",
        url: "http://webapi.amap.com/subway/data/4401_drw_guangzhou.json?uid=1524112884850",
        dataType: "json",
        success: function (result) {
            $("#navtabs").empty();
            $.each(result.l, function (i, item) {
                $("#navtabs").append('<li role="presentation"><a>' + item.ln + '</a></li>');
            });
            //  通过地铁线 获取对应地铁站
            afterStationObtain();
        },
        error: function () {
            console.log("获取地铁路线失败");
        }
    });
}

// 地铁导航栏
// 通过地铁线 获取对应地铁站
function afterStationObtain() {
    $('#navtabs li').click(function () {
        var metroLine = $(this).find('a').text();
        //console.log(metroLine);
        $.ajax({
            type: "get",
            url: "http://webapi.amap.com/subway/data/4401_drw_guangzhou.json?uid=1524112884850",
            dataType: "json",
            success: function (result) {
                $('#nav').empty();
                $.each(result.l, function (i, item) {
                    if (item.ln == metroLine) {
                        $.each(item.st, function (j, jItem) {
                            $('#nav').append("<li role=\"presentation\"><a href=\"metro.html?metro=" + jItem.n + "\">" + jItem.n + "</a></li>");
                        });
                    }
                });
            },
            error: function () {
                $("#alert").html("<div class=\"alert alert-info text-center fade in\" role=\"alert\" id=\"alert\">服务器开小差啦<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
            }
        });
        $('#navtabs li').removeClass('active');
        $(this).addClass('active')
    });
}

// 解决dataTable
// 搜索发起
function searchCommunityViaMetro() {
    // 解决搜索时一个页面中两个dataTable对象
    var input = $('#metro_station').val();
    window.location.href = "metro.html?metro=" + input;
}


// 通过地铁站获取小区
function getCommunityByMetro() {
    var input = $('#metro_station').val();

    $.ajax({
        type: "get",
        url: "http://127.0.0.1:8000/api/communities/metro/" + input, // api 地址
        dataType: "json",
        success: function (result) {
            if (result.length == 0) {
                $("#alert").html("<div class=\"alert alert-info text-center fade in\" role=\"alert\" id=\"alert\">该地铁站未找到房源<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
            } else {
                addGraph(result);
                addCommunityTable(result);
                // 对跳转的地铁站页弹出当前地铁站所在地铁线
                // li中可能存在换乘站重复
                // 以地铁线靠后的为主
                // ============
                // ！！无效！！
                // ============
                // console.log(result[0].taglist);
                //$('#navtabs li').each(function () {
                //    //console.log($(this).text());
                //    if (result[0].taglist.indexOf($(this).text()) != -1) {
                //        console.log(result[0].taglist);
                //        $(this).click();
                //    }
                //})
            }
        },

        error: function () {
            $("#alert").html("<div class=\"alert alert-info text-center fade in\" role=\"alert\" id=\"alert\">服务器开小差啦<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
        }
    });

    function addGraph(data) {
        $('#chart_title').text(data[0].taglist + "在售房源条形图");
        $('.collapsed-box').removeClass('collapsed-box');
        var x = [];
        var y = [];

        for (var i in data) {
            x.push(data[i].title);
            y.push(data[i].onsale);
        }

        var chartdata = {
            labels: x,
            datasets: [{
                label: '在售房源',
                backgroundColor: 'rgba(151,187,205,0.5)',
                borderColor: 'rgba(151,187,205,1)',
                hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
                hoverBorderColor: 'rgba(200, 200, 200, 1)',
                data: y
            }]
        };

        $('#mycanvas').remove();
        $('#chart-container').append('<canvas id="mycanvas"></canvas>');

        var ctx = $("#mycanvas");

        var barGraph = new Chart(ctx, {
            type: 'bar',
            data: chartdata,
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
    }
}


// 初始化表格对象
function initTable() {
    return $('#records_table').DataTable({
        'paging': true,
        'lengthChange': true,
        'searching': true,
        'ordering': true,
        'info': true,
        'autoWidth': true,
        'language': {
            "lengthMenu": "每页 _MENU_ 条记录",
            "zeroRecords": "没有找到记录",
            "info": "第 _PAGE_ 页 ( 总共 _PAGES_ 页 )",
            "infoEmpty": "无记录",
            "infoFiltered": "(从 _MAX_ 条记录过滤)",
            "search": "搜索：",
            "paginate": {
                "next": "下一页",
                "previous": "上一页"
            }
        }
    });
}

// 将小区渲染到表格
function addCommunityTable(result) {
    if (result.length == 0) {
        $('#records_title').text("搜索结果为空");
    } else {
        $('#records_title').text("地铁站名称：" + $('#metro_station').val() + "，搜索结果：共" + result.length + "个小区");
        addData(result);
    }

    // 添加数据到表格中
    function addData(result) {
        $.each(result, function (i, item) {
            //if ($.fn.dataTable.isDataTable('#records_table')) {
            //    table.destroy(true);
            //}
            $('<tr>').html(
                "<td><a href='community.html?community=" + result[i].title + "'>" + result[i].title + "</a></td><td>" +
                result[i].district + "</td><td>" +
                result[i].price + "</td><td>" +
                result[i].onsale + "</td><td>" +
                result[i].year + "</td><td>" +
                result[i].housetype + "</td><td>" +
                result[i].service + "</td><td>" +
                result[i].cost + "</td><td>" +
                result[i].company + "</td><td>" +
                result[i].building_num + "</td><td>" +
                result[i].house_num + "</td>").appendTo('#records_table tbody');
        });

        // 表格分页系统
        // =============================
        // ===  未解决 发起搜索！！！===
        // =============================
        // 1. 通过dataTable API销毁
        // 2. 通过url重新渲染页面
        // dataTable 对象
        var table = initTable();
    }
}

//// 将搜索结果返回到表格中
//function addCommunityTable(result) {
//
//    //var pages = (result.length / 20) + 1;
//    if (result.length == 0) {
//        // 将结果返回到表头
//        $('<tr>').html("<td>搜索结果为空</td>").appendTo('#records_result');
//    }
//    else {
//        addHeader(result);
//        addData(result);
//    }
//
//    // 分页
//    //if ($('#pagination-demo').data("twbs-pagination")) {
//    //    $('#pagination-demo').twbsPagination('destroy');
//    //}
//
//    //$('#pagination-demo').twbsPagination({
//    //    totalPages: pages,
//    //    onPageClick: function(event, page) {
//    //        var data = result.slice((page - 1) * 20, page * 20);
//    //        addHeader(result);
//    //        addData(data);
//    //    }
//    //});
//
//    function addHeader(result) {
//        $("#records_table tbody tr").remove();
//        $('<tr>').html("<td>搜索结果：" + result.length + "个小区</td>").appendTo('#records_table');
//        //$('<tr class="info">').html("<td>名称</td><td>区县</td><td>参考均价</td><td>在售房源</td><td>建筑年代</td><td>建筑类型</td><td>物业费</td><td>物业公司</td><td>开发商</td><td>楼栋总数</td><td>房屋总数</td>").appendTo('#records_table');
//    }
//
//    function addData(result) {
//        $.each(result, function (i, item) {
//            $('<tr>').html(
//                "<td><a href='map.html?community=" + result[i].Title + "'>" + result[i].Title + "</a></td><td>" +
//                result[i].District + "</td><td>" +
//                result[i].Price + "</td><td>" +
//                result[i].Onsale + "</td><td>" +
//                result[i].Year + "</td><td>" +
//                result[i].Housetype + "</td><td>" +
//                result[i].Cost + "</td><td>" +
//                result[i].Service + "</td><td>" +
//                result[i].Company + "</td><td>" +
//                result[i].BuildingNum + "</td><td>" +
//                result[i].HouseNum + "</td>").appendTo('#records_table');
//        });
//    }
//}