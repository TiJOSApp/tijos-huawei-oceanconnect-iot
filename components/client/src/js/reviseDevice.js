$(function () {
    let url = 'https://demo.tijos.net';
    let deviceId = getRequest('deviceId');
    let deviceType = getRequest('deviceType');
    init();

    function init() {
        getDevice();

        preventBrowserBack();

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap",function () {
            onBackKeyDown();
        });

        $('.delete')[0].addEventListener("tap", function () {
            mui.confirm('是否删除此设备','',['是','否'],function (obj) {
                if(obj.index == '0'){
                    deleteDevice(deviceId);
                }
            },'div');
        });

        $('.save')[0].addEventListener("tap",function () {
            reviseDevice(deviceId);
        });
    }

    function getDevice() {
        $.ajax({
            type: 'GET',
            url: url + '/device?deviceId=' + deviceId,
            dataType: 'json',
            success: function (data) {
                if (data.err_code == '00') {
                    let deviceInfo = data.data.deviceInfo;
                    $('.name').val(deviceInfo.name || '设备');
                    $('.manufacturerId').val(deviceInfo.manufacturerId || 'TiJOS');
                    $('.manufacturerName').val(deviceInfo.manufacturerName || 'TiJOS');
                    $('.deviceType').val(deviceInfo.deviceType || 'TiKit');
                    $('.model').val(deviceInfo.model || 'TiKit800');
                    $('.protocolType').val(deviceInfo.protocolType || 'CoAP');
                }
            },
            error: function (err) {
                mui.toast('err', {duration: 'short', type: 'div'})
                console.log(err)
            }
        })
    }

    function deleteDevice(id) {
        let data = {
            id: id,
        }
        $.ajax({
            type: 'POST',
            url: url + '/deleteDevice',
            data: data,
            dataType: 'json',
            success: function(data){
                console.log('set success');
                mui.toast('删除成功', {duration: 'short', type: 'div'});
                mui.openWindow('deviceList.html?deviceType=' + deviceType);
            },
            error: function (err) {
                mui.toast('err',{duration:'short', type:'div'})
                console.log(err)
            }
        })
    }

    function reviseDevice(id) {
        let data = {
            id: id,
            data: {
                name: $('.name').val() || null,
                manufacturerId: $('.manufacturerId').val() || null,
                manufacturerName: $('.manufacturerName').val() || null,
                deviceType: $('.deviceType').val() || null,
                model: $('.model').val() || null,
                protocolType: $('.protocolType').val() || null
            }
        };
        $.ajax({
            type: 'POST',
            url: url + '/reviseDevice',
            data: data,
            dataType: 'json',
            success: function(data){
                console.log('set success');
                mui.toast('更新成功', {duration: 'short', type: 'div'});
                mui.openWindow('deviceList.html?deviceType=' + deviceType);
            },
            error: function (err) {
                mui.toast('err',{duration:'short', type:'div'})
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

    function onBackKeyDown() {
        mui.openWindow('deviceList.html?&deviceType=' + deviceType);
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