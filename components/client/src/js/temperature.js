$(function () {
    let deviceId = getRequest('deviceId');
    let deviceType = getRequest('deviceType');
    let deviceName;
    let url = 'https://demo.tijos.net';
    init();

    function init(){
        getDevice();
        preventBrowserBack();

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap",function () {
            onBackKeyDown();
        });

        $('.temperature-item')[0].addEventListener("tap",function () {
            mui.openWindow('temperatureLine.html?deviceId=' + deviceId + '&deviceName=' + deviceName + '&deviceType=' + deviceType);
        });

        $('.temperature-item')[1].addEventListener("tap",function () {
            mui.openWindow('temperatureLine.html?deviceId=' + deviceId + '&deviceName=' + deviceName + '&deviceType=' + deviceType);
        });
    }

    function getDevice() {
        $.ajax({
            type: 'GET',
            url: url + '/device?deviceId=' + deviceId,
            dataType: 'json',
            success: function (data) {
                if (data.err_code == '00') {
                    deviceName = data.data.deviceInfo.name;
                    $('#device-name').text(data.data.deviceInfo.name);
                    $('#temperature-value').text(data.data.services[0].data.Temperature);
                    $('#humidity-value').text(data.data.services[0].data.Humidity);
                    socket();
                }
            },
            error: function (err) {
                mui.toast('err', {duration: 'short', type: 'div'})
                console.log(err)
            }
        })
    }

    function getRequest(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let r = window.location.search.substr(1).match(reg);
        let context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    }

    function socket() {
        let socket = io.connect(url)
        socket.on('deviceInfo', function (data) {
            if(data.service.serviceId == 'SensorStatus'){
                $('#temperature-value').text(data.service.data.Temperature);
                $('#humidity-value').text(data.service.data.Humidity);
            }
        })
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

})