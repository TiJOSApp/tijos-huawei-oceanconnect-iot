'use strict';

$(function () {
    var url = 'https://demo.tijos.net';
    var deviceId = getRequest('deviceId');
    var deviceType = getRequest('deviceType');
    var hour = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

    var minute = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];

    init();

    function init() {
        getDeviceTimingSetting();
        preventBrowserBack();

        $.scrEvent2({
            data: hour,
            data2: minute,
            evEle: '#switch-timing-time-open-value',
            title: '选择时间',
            defValue: 0,
            defValue2: 0,
            eleName: '',
            eleName2: '',
            afterAction: function afterAction(data1, data2) {
                $('#switch-timing-time-open-value').text(data1 + ':' + data2);
            }
        });

        $.scrEvent2({
            data: hour,
            data2: minute,
            evEle: '#switch-timing-time-stop-value',
            title: '选择时间',
            defValue: 0,
            defValue2: 0,
            eleName: '',
            eleName2: '',
            afterAction: function afterAction(data1, data2) {
                $('#switch-timing-time-stop-value').text(data1 + ':' + data2);
            }
        });

        $('#save')[0].addEventListener("tap", function () {
            setSwitchTiming();
        });

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap", function () {
            onBackKeyDown();
        });

        mui(".switch-timing-day-item").on('tap', '.switch-timing-day-value', function (e) {
            var el = e.target;
            if (!$(el).hasClass('active')) {
                $(el).addClass('active');
            } else {
                $(el).removeClass('active');
            }
        });
    }

    function getDeviceTimingSetting() {
        $.ajax({
            type: 'GET',
            url: url + '/deviceTimingSetting?deviceId=' + deviceId,
            dataType: 'json',
            success: function success(data) {
                if (data.err_code == '00') {
                    if (!data.data.command) {
                        return;
                    }
                    data = data.data.command.paras;
                    $('#switch-timing-time-open-value').text(data.on_time_start_hour + ':' + data.on_time_start_min);
                    $('#switch-timing-time-stop-value').text(data.off_time_start_hour + ':' + data.off_time_start_min);
                    if (data.on_time_enable == '1') {
                        mui("#switch-timing-time-open-status").switch().toggle();
                    }
                    if (data.off_time_enable == '1') {
                        mui("#switch-timing-time-stop-status").switch().toggle();
                    }
                    if (data.Sun == '1') {
                        $("#day1").addClass('active');
                    }
                    if (data.Mon == '1') {
                        $("#day2").addClass('active');
                    }
                    if (data.Tue == '1') {
                        $("#day3").addClass('active');
                    }
                    if (data.Wen == '1') {
                        $("#day4").addClass('active');
                    }
                    if (data.Thu == '1') {
                        $("#day5").addClass('active');
                    }
                    if (data.Fri == '1') {
                        $("#day6").addClass('active');
                    }
                    if (data.Sat == '1') {
                        $("#day7").addClass('active');
                    }
                }
            },
            error: function error(err) {
                mui.toast('err', { duration: 'short', type: 'div' });
                console.log(err);
            }
        });
    }

    function setSwitchTiming() {
        var data = {
            deviceId: deviceId,
            command: {
                serviceId: 'Relay',
                method: 'RELAY_SCHEDULE',
                paras: {
                    on_time_start_hour: $('#switch-timing-time-open-value').text().split(':')[0],
                    on_time_start_min: $('#switch-timing-time-open-value').text().split(':')[1],
                    off_time_start_hour: $('#switch-timing-time-stop-value').text().split(':')[0],
                    off_time_start_min: $('#switch-timing-time-stop-value').text().split(':')[1],
                    Sun: $('#day1').hasClass('active') ? 1 : 0,
                    Mon: $('#day2').hasClass('active') ? 1 : 0,
                    Tue: $('#day3').hasClass('active') ? 1 : 0,
                    Wen: $('#day4').hasClass('active') ? 1 : 0,
                    Thu: $('#day5').hasClass('active') ? 1 : 0,
                    Fri: $('#day6').hasClass('active') ? 1 : 0,
                    Sat: $('#day7').hasClass('active') ? 1 : 0,
                    on_time_enable: $("#switch-timing-time-stop-status").hasClass('mui-active') ? 1 : 0,
                    off_time_enable: $('#switch-timing-time-stop-status').hasClass('mui-active') ? 1 : 0
                }
            },
            expireTime: 0
        };

        $.ajax({
            type: 'POST',
            url: url + '/timingSetting',
            data: data,
            dataType: 'json',
            success: function success(data) {
                mui.toast('保存成功', { duration: 'short', type: 'div' });
                onBackKeyDown();
            },
            error: function error(err) {
                mui.toast('err', { duration: 'short', type: 'div' });
                console.log(err);
            }
        });
    }

    function getRequest(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null) context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    }

    function onBackKeyDown() {
        mui.openWindow('switch.html?deviceId=' + deviceId + '&deviceType=' + deviceType);
        event.preventDefault();
    }

    function preventBrowserBack() {
        if (window.history && window.history.pushState) {
            $(window).on('popstate', function () {
                window.history.pushState('forward', null, '#');
                window.history.forward(1);
            });
        }
        window.history.pushState('forward', null, '#'); //在IE中必须得有这两行
        window.history.forward(1);
    }
});