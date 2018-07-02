'use strict';

$(function () {
    var deviceId = getRequest('deviceId');
    var url = 'https://demo.tijos.net';
    var deviceType = getRequest('deviceType');

    init();

    function init() {
        getDevice();
        getDeviceDelaySetting();
        getDeviceTimingSetting();
        preventBrowserBack();

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap", function () {
            onBackKeyDown();
        });

        $('.switch-timing')[0].addEventListener("tap", function () {
            mui.openWindow('addTiming.html?deviceId=' + deviceId + '&deviceType=' + deviceType);
        });

        $('.switch-delay')[0].addEventListener("tap", function () {
            mui.openWindow('addSwitchDelay.html?deviceId=' + deviceId + '&deviceType=' + deviceType);
        });

        $('.switch-status')[0].addEventListener("tap", function () {
            navigator.vibrate(100);
            setSwitch();
        });
    }

    function getDevice() {
        $.ajax({
            type: 'GET',
            url: url + '/device?deviceId=' + deviceId,
            dataType: 'json',
            success: function success(data) {
                if (data.err_code == '00') {
                    $('.switch-name').text(data.data.deviceInfo.name);
                    if (data.data.services[2].data.RelayStatus == '0') {
                        $('.switch-status').attr('src', '../img/mini_button_off.png');
                    } else {
                        $('.switch-status').attr('src', '../img/mini_button_on.png');
                    }
                    socket();
                }
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
                    if (data.data.delayOpenSettingTime || data.data.delayStopSettingTime) {
                        $('#switch-delay-status').text('已设置');
                        var time1 = data.data.delayOpenSettingTime || 0;
                        var time2 = data.data.delayStopSettingTime || 0;
                        var time = Math.max(time1, time2);
                        setTimeout(function () {
                            $('#switch-delay-status').text('未设置');
                        }, time);
                    }
                }
            },
            error: function error(err) {
                mui.toast('err', { duration: 'short', type: 'div' });
                console.log(err);
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

                    if (data.on_time_enable == '1' || data.off_time_enable == '1') {
                        $('#switch-timing-status').text('已设置');
                    }
                }
            },
            error: function error(err) {
                mui.toast('err', { duration: 'short', type: 'div' });
                console.log(err);
            }
        });
    }

    function setSwitch() {
        var data = {
            deviceId: deviceId,
            command: {
                serviceId: 'Relay',
                method: 'RELAY_SWITCH',
                paras: {
                    status: 1
                }
            },
            expireTime: 0
        };

        if ($('.switch-status').attr('src') == '../img/mini_button_off.png') {
            $('.switch-status').attr('src', '../img/mini_button_on.png');
        } else {
            data.command.paras.status = 0;
            $('.switch-status').attr('src', '../img/mini_button_off.png');
        }

        $.ajax({
            type: 'POST',
            url: url + '/setting',
            data: data,
            dataType: 'json',
            success: function success(data) {
                console.log('set success');
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

    function socket() {
        var socket = io.connect(url);
        socket.on('deviceInfo', function (data) {
            if (data.service.serviceId == 'Relay') {
                if (data.service.data.RelayStatus == 0) {
                    $('.switch-status').attr('src', '../img/mini_button_off.png');
                } else {
                    $('.switch-status').attr('src', '../img/mini_button_on.png');
                }
            }
        });
    }

    function onBackKeyDown() {
        mui.openWindow('deviceList.html?deviceId=' + deviceId + '&deviceType=' + deviceType);
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