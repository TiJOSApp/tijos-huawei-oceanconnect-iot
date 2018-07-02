$(function () {
    let url = 'https://demo.tijos.net';
    let deviceType = getRequest('deviceType');

    init();

    function init() {
        preventBrowserBack();

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap",function () {
            onBackKeyDown();
        });

        $('.add')[0].addEventListener("tap",function () {
            if($('input').val() == ''){
                mui.toast('请输入设备SN码', {duration: 'short', type: 'div'});
            }else{
                addDevice($('input').val());
            }
        });
    }

    function addDevice(sn) {
        let data = {
            nodeId: sn,
        }

        $.ajax({
            type: 'POST',
            url: url + '/addDevice',
            data: data,
            dataType: 'json',
            success: function(data){
                console.log('set success');
                mui.toast('创建成功', {duration: 'short', type: 'div'});
                mui.openWindow('deviceList.html?deviceType=' + deviceType);
            },
            error: function (err) {
                mui.toast('err',{duration:'short', type:'div'})
                console.log(err)
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
})