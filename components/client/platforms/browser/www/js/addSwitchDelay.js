'use strict';

$(function () {
    var openStatus = false;
    var stopStatus = false;
    var openTime = 10 * 60 * 1000;
    var stopTime = 30 * 60 * 1000;
    var url = 'https://demo.tijos.net';
    var deviceId = getRequest('deviceId');
    var deviceType = getRequest('deviceType');
    var hour = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
    var minute = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];

    init();

    function init() {
        getDeviceDelaySetting();
        preventBrowserBack();

        $.scrEvent2({
            data: hour,
            data2: minute,
            evEle: '#switch-delay-open-val',
            title: '选择时间',
            defValue: 0,
            defValue2: 0,
            eleName: '小时',
            eleName2: '分钟',
            afterAction: function afterAction(data1, data2) {
                if (data1 == '00') {
                    $('#switch-delay-open-val').text(data2 + '分钟');
                } else {
                    $('#switch-delay-open-val').text(data1 + '小时' + data2 + '分钟');
                }
                openTime = data1 * 60 * 60 * 1000 + data2 * 60 * 1000;
            }
        });
        $.scrEvent2({
            data: hour,
            data2: minute,
            evEle: '#switch-delay-stop-val',
            title: '选择时间',
            defValue: 0,
            defValue2: 0,
            eleName: '小时',
            eleName2: '分钟',
            afterAction: function afterAction(data1, data2) {
                if (data1 == '00') {
                    $('#switch-delay-stop-val').text(data2 + '分钟');
                } else {
                    $('#switch-delay-stop-val').text(data1 + '小时' + data2 + '分钟');
                }
                stopTime = data1 * 60 * 60 * 1000 + data2 * 60 * 1000;
            }
        });

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap", function () {
            onBackKeyDown();
        });

        $('#save')[0].addEventListener("tap", function () {
            var openStatusNew = $('#switch-delay-open-status').hasClass('mui-active');
            var stopStatusNew = $('#switch-delay-stop-status').hasClass('mui-active');
            var data = [];
            if (openStatusNew != openStatus || openStatus) {
                openStatus = openStatusNew;
                data.push({
                    deviceId: deviceId,
                    command: {
                        serviceId: 'Relay',
                        method: 'RELAY_SWITCH',
                        paras: {
                            status: 1
                        }
                    },
                    expireTime: 0,
                    delayTime: openTime,
                    openStatus: openStatusNew ? 1 : 0
                });
            }
            if (stopStatusNew != stopStatus || stopStatus) {
                stopStatus = stopStatusNew;
                data.push({
                    deviceId: deviceId,
                    command: {
                        serviceId: 'Relay',
                        method: 'RELAY_SWITCH',
                        paras: {
                            status: 0
                        }
                    },
                    expireTime: 0,
                    delayTime: stopTime,
                    stopStatus: openStatusNew ? 1 : 0
                });
            }
            if (!data.length) return;
            setDevice({
                data: data
            });
        });
    }

    function setDevice(data) {
        $.ajax({
            type: 'POST',
            url: url + '/delaySetting',
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

    function getDeviceDelaySetting() {
        $.ajax({
            type: 'GET',
            url: url + '/deviceDelaySetting?deviceId=' + deviceId,
            dataType: 'json',
            success: function success(data) {
                if (data.err_code == '00') {
                    if (data.data.delayOpenSettingTime) {
                        var time1 = data.data.delayOpenSettingTime - new Date().getTime();
                        mui("#switch-delay-open-status").switch().toggle();
                        $('#switch-delay-open-val').text(changeTime(time1));
                        time1 = time1 - 60 * 1000;
                        var timer1 = setInterval(function () {
                            if (time1 > 0) {
                                $('#switch-delay-open-val').text(changeTime(time1));
                                time1 = time1 - 60 * 1000;
                            } else {
                                mui("#switch-delay-open-status").switch().toggle();
                                clearInterval(timer1);
                            }
                        }, 60 * 1000);
                    }
                    if (data.data.delayStopSettingTime) {
                        var time2 = data.data.delayStopSettingTime - new Date().getTime();
                        mui("#switch-delay-stop-status").switch().toggle();
                        $('#switch-delay-stop-val').text(changeTime(time2));
                        time2 = time2 - 60 * 1000;
                        var timer2 = setInterval(function () {
                            if (time2 > 0) {
                                $('#switch-delay-stop-val').text(changeTime(time2));
                                time2 = time2 - 60 * 1000;
                            } else {
                                mui("#switch-delay-stop-status").switch().toggle();
                                clearInterval(timer2);
                            }
                        }, 60 * 1000);
                    }
                }
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

    function changeTime(num) {
        var hour = 0;
        var min = 0;
        var hours = 60 * 60 * 1000;
        var mins = 60 * 1000;
        if (num > hours) {
            hour = parseInt(num / hours);
            num = num - hour * hours;
        }
        if (num > mins) {
            min = parseInt(num / mins) + 1;
        }
        if (hour > 0) {
            return hour + '小时' + min + '分钟';
        } else {
            return min + '分钟';
        }
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