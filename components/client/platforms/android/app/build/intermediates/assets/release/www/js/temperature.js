'use strict';

$(function () {
    var deviceId = getRequest('deviceId');
    var deviceType = getRequest('deviceType');
    var deviceName = void 0;
    var url = 'https://demo.tijos.net';
    init();

    function init() {
        getDevice();
        preventBrowserBack();

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap", function () {
            onBackKeyDown();
        });

        $('.temperature-item')[0].addEventListener("tap", function () {
            mui.openWindow('temperatureLine.html?deviceId=' + deviceId + '&deviceName=' + deviceName + '&deviceType=' + deviceType);
        });

        $('.temperature-item')[1].addEventListener("tap", function () {
            mui.openWindow('temperatureLine.html?deviceId=' + deviceId + '&deviceName=' + deviceName + '&deviceType=' + deviceType);
        });
    }

    function getDevice() {
        $.ajax({
            type: 'GET',
            url: url + '/device?deviceId=' + deviceId,
            dataType: 'json',
            success: function success(data) {
                if (data.err_code == '00') {
                    deviceName = data.data.deviceInfo.name;
                    $('#device-name').text(data.data.deviceInfo.name);
                    $('#temperature-value').text(data.data.services[0].data.Temperature);
                    $('#humidity-value').text(data.data.services[0].data.Humidity);
                    socket();
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

    function socket() {
        var socket = io.connect(url);
        socket.on('deviceInfo', function (data) {
            if (data.service.serviceId == 'SensorStatus') {
                $('#temperature-value').text(data.service.data.Temperature);
                $('#humidity-value').text(data.service.data.Humidity);
            }
        });
    }

    function onBackKeyDown() {
        mui.openWindow('deviceList.html?deviceType=' + deviceType);
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