/**
 * Created by kaida on 2018/4/4.
 */
$(document).ready(function () {
    // 获取今日时间 HTML5 HTMLInputElement valueAsDate
    document.getElementById("form-endTime").valueAsDate = new Date();
    var url = new URL(window.location.href);
    var community = url.searchParams.get("community");
    if (community) {
        $('#form-community').val(community);
        getAnalysisByCommunity()
    }

    // 公共页面提取导入
    $(function () {
        $('#main-header').load("common/main-header.html");
        $('#main-sidebar').load("common/main-sidebar.html", function () {
            $('#sidebar_detail').addClass('active');
        });
        // footer 引入会导致错版
        $('#main-footer').load("common/main-footer.html");
        // 初始化表格对象
        initTable();
        // 小区名称自动补全
        get_community_name();
    });
});

// 通过小区名称获取分析
function getAnalysisByCommunity() {
    var input = $('#form-community').val();
    var stime = $('#form-startTime').val();
    var etime = $('#form-endTime').val();
    var type = $('#form-analysisType').val();

    $.ajax({
        type: "get", //请求方式
        url: 'http://127.0.0.1:8000/api/sellinfo/count/' + type + "/title/" + input +
        "?stime=" + stime +
        "&etime=" + etime, //地址，就是json文件的请求路径
        dataType: "json", //数据类型可以为 text xml json  script  jsonp
        success: function (result) {
            if (result.length == 0) {
                $("#alert").html("<div class=\"alert alert-danger text-center fade in\" role=\"alert\" id=\"alert\">该小区在此时间段未有成交记录<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
            } else {
                // 画图
                addGraph(result, input, type);
                // 搜索有数据时清空警告框
                $("#alert").empty();
                $.ajax({
                    type: "get", //请求方式
                    url: "http://127.0.0.1:8000/api/community/title/" + input, //地址，就是json文件的请求路径
                    dataType: "json", //数据类型可以为 text xml json  script  jsonp
                    success: function (result) { //返回的参数就是 action里面所有的有get和set方法的参数
                        // 获取数据到表格
                        addCommunityTable(result);
                    },
                    error: function () {
                        $("#alert").html("<div class=\"alert alert-danger text-center fade in\" role=\"alert\" id=\"alert\">不存在该小区<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
                    }
                });
            }
        },

        error: function () {
            $("#alert").html("<div class=\"alert alert-danger text-center fade in\" role=\"alert\" id=\"alert\">服务器开小差啦<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>")
        }
    });
}

// 画图
function addGraph(data, input, type) {
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
        x.push(data[i][type]);
        y.push(data[i]["count"]);
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

    $('#mycanvas').remove();
    $('#chart-container').append('<canvas id="mycanvas"></canvas>');

    var ctx = $("#mycanvas");

    var barGraph = new Chart(ctx, {
        type: "pie",
        data: chartdata
    });
}

// 初始化表格对象
function initTable() {
    $('#records_table').DataTable({
        'paging': false,
        'lengthChange': true,
        'searching': false,
        'ordering': false,
        'info': false,
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
        },
        //根据接口传过来的字段进行设置
        columns: [
            {data: "title"},
            {data: "district"},
            {data: "price"},
            {data: "onsale"},
            {data: "year"},
            {data: "housetype"},
            {data: "service"},
            {data: "cost"},
            {data: "company"},
            {data: "building_num"},
            {data: "house_num"}
        ]
    });
}

// 将小区渲染到表格
function addCommunityTable(result) {
    // 初始化表格数据
    var table = $('#records_table').dataTable();
    //这里获取表格的配置
    var oSettings = table.fnSettings();
    //动态刷新关键部分语句，先清空数据
    table.fnClearTable(this);
    //这里添加一行数据
    table.oApi._fnAddData(oSettings, result);
    oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
    //绘制表格
    table.fnDraw();
}

function get_community_name() {
    $.ajax({
        type: "get",
        url: "http://127.0.0.1:8000/api/communities/",
        dataType: "json",
        success: function (result) {
            var aOption = [];
            $.each(result, function (i, item) {
                aOption.push(result[i].title);
            });
            $('#form-community').autocomplete({
                source: aOption
            });
        },
        error: function () {
            console.log("获取小区列表error");
        }
    });
}