/**
 * Created by kaida on 2018/4/4.
 */
$(document).ready(function () {

    // 公共页面提取导入
    $(function () {
        $('#main-header').load("common/main-header.html");
        $('#main-sidebar').load("common/main-sidebar.html", function () {
            $('#sidebar_sellinfo').addClass('active');
        });
        // footer 引入会导致错版
        $('#main-footer').load("common/main-footer.html");
        get_community_name();
        get_community_test();
    });

    // 获取今日时间 HTML5 HTMLInputElement valueAsDate
    document.getElementById("form-endTime").valueAsDate = new Date();
});

var get_community_name = function () {
    $.ajax({
        type: "get",
        url: "api/tips.json",
        dataType: "json",
        success: function (result) {
            var aOption = [];
            $.each(result, function (i, item) {
                aOption.push(result[i].Title);
            });
            $('#form-community').autocomplete({
                source: aOption
            });
        },
        error: function () {
            console.log("error");
        }
    });
};

function get_community_test() {
    $.ajax({
        type: "get",
        url: "api/tips.json",
        dataType: "json",
        success: function (result) {
            var availableTags = [];
            $.each(result, function (i, item) {
                availableTags.push(result[i].Title)
            });
            $(".autocomplete").autocomplete({
                source: availableTags
            });
        }
    });
}

function getSellInfoByCommunity() {

}