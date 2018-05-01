$(document).ready(function () {
    var url = new URL(window.location.href);
    var bizcircle = url.searchParams.get("bizcircle");
    //console.log(bizcircle);
    if (bizcircle) {
        $('#bizcircle').val(bizcircle);
        getCommunityByBizcircle();
    }

    // 商圈导航栏
    $("#navtabs li").click(function () {
        var district = $(this).text();
        $.ajax({
            type: "get",
            url: "http://127.0.0.1:8000/api/bizcircles/district/" + district + "?format=json",
            dataType: "json", // CORS
            success: function (result) {
                $('#nav').empty();
                $.each(result, function (i, item) {
                    $('#nav').append("<li role=\"presentation\"><a href=\"bizcircle.html?bizcircle=" + item.bizcircle + "\">" + item.bizcircle + "</a></li>");
                });
            },
            error: function () {
                $("#alert").html("<div class=\"alert alert-info text-center fade in\" role=\"alert\" id=\"alert\">获取商圈列表失败<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
            }
        });
        $('#navtabs li').removeClass('active');
        $(this).addClass('active');
    });

    // 公共页面提取导入
    $(function () {
        $('#main-header').load("common/main-header.html");
        $('#main-sidebar').load("common/main-sidebar.html", function () {
            $('#sidebar_bizcircle').addClass('active');
        });
        // footer 引入会导致错版
        $('#main-footer').load("common/main-footer.html");
        // 商圈自动补全
        getBizcircleName();
    });

});

// 商圈名称自动补全
var getBizcircleName = function () {
    $.ajax({
        type: "get",
        url: "http://127.0.0.1:8000/api/bizcircles/?format=json",
        dataType: "json",
        success: function (result) {
            var aOption = [];
            $.each(result, function (i, item) {
                aOption.push(result[i].bizcircle);
            });
            $('#bizcircle').autocomplete({
                source: aOption
            });
        },
        error: function () {
            console.log("error");
        }
    });
};

// 解决dataTable
// 搜索发起
function searchCommunityViaBizcircle() {
    // 解决搜索时一个页面中两个dataTable对象
    var input = $('#bizcircle').val();
    window.location.href = "bizcircle.html?bizcircle=" + input;
}

//  通过商圈获取小区列表
function getCommunityByBizcircle() {
    var input = $('#bizcircle').val();

    $.ajax({
        type: "get", //请求方式
        url: "http://127.0.0.1:8000/api/communities/bizcircle/" + input, //地址，就是json文件的请求路径
        dataType: "json", //数据类型可以为 text xml json  script  jsonp
        success: function (result) { //返回的参数就是 action里面所有的有get和set方法的参数
            if (result.length == 0) {
                $("#alert").html("<div class=\"alert alert-info text-center fade in\" role=\"alert\" id=\"alert\">该商圈未找到房源<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
            } else {
                addGraph(result);
                addCommunityTable(result);
                // 对跳转的商圈页弹出当前商圈所在行政区
                $('#navtabs li').each(function () {
                    //console.log($(this).text());
                    if ($(this).text() == result[0].district) {
                        $(this).click();
                    }
                })
            }
        },

        error: function () {
            $("#alert").html("<div class=\"alert alert-info text-center fade in\" role=\"alert\" id=\"alert\">服务器开小差啦<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
        }
    });

    function addGraph(data) {
        $('#chart_title').text(data[0].bizcircle + "在售房源条形图");
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
        $('#records_title').text("商圈名称：" + result[0].bizcircle + "，搜索结果：共" + result.length + "个小区");
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