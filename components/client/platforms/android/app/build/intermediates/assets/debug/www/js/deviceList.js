'use strict';

$(function () {
    var quitFlag = false;
    var url = 'https://demo.tijos.net';
    var deviceType = getRequest('deviceType');
    init();

    function init() {
        getDevices();
        preventBrowserBack();

        mui.init({
            gestureConfig: {
                tap: true, //默认为true
                doubletap: false, //默认为false
                longtap: true, //默认为false
                swipe: false, //默认为true
                drag: false, //默认为true
                hold: false, //默认为false，不监听
                release: false //默认为false，不监听
            }
        });

        mui(".device-list-left").on('tap', '.device-list-left-item', function (e) {
            var el = e.target.tagName == 'DIV' ? e.target : e.target.parentElement;
            if ($(el).hasClass('active')) {
                return;
            } else {
                $('.device-list-left-item').each(function (i) {
                    if (this === el) {
                        $(el).addClass('active');
                        $(el).find('img').attr('src', '../img/type' + (i + 1) + '_active.png');
                        $('.device-list-right-item').find('img').attr('src', '../img/type' + (i + 1) + '.png');
                    } else {
                        $(this).find('img').attr('src', '../img/type' + (i + 1) + '.png');
                        $(this).removeClass('active');
                    }
                });
            }
        });

        mui(".device-list-right").on('tap', '.device-list-right-item', function (e) {
            var el = void 0;
            if (e.target.tagName == 'DIV' && $(e.target).attr('id')) {
                el = e.target;
            } else if (e.target.tagName == 'DIV' && !$(e.target).attr('id')) {
                el = e.target.parentElement;
            } else if (e.target.tagName == 'IMG') {
                el = e.target.parentElement;
            } else {
                el = e.target.parentElement.parentElement;
            }
            if ($(el).find('.device-status').text() == 'OFFLINE') {
                mui.toast('设备已离线', { duration: 'short', type: 'div' });
                return;
            }
            var deviceId = $(el).attr('id');
            if ($('#type1').hasClass('active')) {
                mui.openWindow('device.html?deviceId=' + deviceId + '&deviceType=1');
            } else if ($('#type2').hasClass('active')) {
                mui.openWindow('temperature.html?deviceId=' + deviceId + '&deviceType=2');
            } else {
                mui.openWindow('switch.html?deviceId=' + deviceId + '&deviceType=3');
            }
        });
        //doubletap  longtap
        mui(".device-list-right").on('longtap', '.device-list-right-item', function (e) {
            var el = void 0;
            if (e.target.tagName == 'DIV' && $(e.target).attr('id')) {
                el = e.target;
            } else if (e.target.tagName == 'DIV' && !$(e.target).attr('id')) {
                el = e.target.parentElement;
            } else if (e.target.tagName == 'IMG') {
                el = e.target.parentElement;
            } else {
                el = e.target.parentElement.parentElement;
            }
            var deviceId = $(el).attr('id');
            mui.confirm('是否删除此设备', '', ['是', '否'], function (obj) {
                if (obj.index == '0') {
                    deleteDevice(deviceId);
                }
            }, 'div');
        });

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.add')[0].addEventListener("tap", function () {
            if ($('#type1').hasClass('active')) {
                mui.openWindow('addDevice.html?&deviceType=1');
            } else if ($('#type2').hasClass('active')) {
                mui.openWindow('addDevice.html?&deviceType=2');
            } else {
                mui.openWindow('addDevice.html?&deviceType=3');
            }
        });
    }

    function deleteDevice(id) {
        var data = {
            id: id
        };

        $.ajax({
            type: 'POST',
            url: url + '/deleteDevice',
            data: data,
            dataType: 'json',
            success: function success(data) {
                console.log('set success');
                mui.toast('删除成功', { duration: 'short', type: 'div' });
                if ($('#type1').hasClass('active')) {
                    mui.openWindow('deviceList.html?deviceType=1');
                } else if ($('#type2').hasClass('active')) {
                    mui.openWindow('deviceList.html?deviceType=2');
                } else {
                    mui.openWindow('deviceList.html?deviceType=3');
                }
            },
            error: function error(err) {
                mui.toast('err', { duration: 'short', type: 'div' });
                console.log(err);
            }
        });
    }

    function getDevices() {
        $.ajax({
            type: 'GET',
            url: url + '/devices',
            dataType: 'json',
            success: function success(data) {
                if (data.err_code == '00') {
                    console.log(data);
                    var devices = {
                        data: []
                    };
                    for (var i in data.data) {
                        devices.data.push(data.data[i]);
                    }
                    var html = template('deviceList', devices);
                    $('.device-list-right').html(html);
                    if (deviceType) {
                        $('.device-list-left-item').each(function (i) {
                            if (deviceType == i + 1) {
                                $(this).addClass('active');
                                $(this).find('img').attr('src', '../img/type' + (i + 1) + '_active.png');
                                $('.device-list-right-item').find('img').attr('src', '../img/type' + (i + 1) + '.png');
                            } else {
                                $(this).removeClass('active');
                                $(this).find('img').attr('src', '../img/type' + (i + 1) + '.png');
                            }
                        });
                        $('#type' + deviceType).addClass('active');
                        $('#type' + deviceType).find('img').attr('src', '../img/type' + deviceType + '_active.png');
                    }
                }
            },
            error: function error(err) {
                mui.toast('err', { duration: 'short', type: 'div' });
                console.log(err);
            }
        });
    }

    function onBackKeyDown() {
        // 返回按钮事件的事件处理函数
        setTimeout(function () {
            quitFlag = false;
        }, 2000);
        if (!quitFlag) {
            quitFlag = !quitFlag;
            mui.toast('再按一次退出', { duration: 'short', type: 'div' });
            event.preventDefault();
        } else {
            navigator.app.exitApp();
        }
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