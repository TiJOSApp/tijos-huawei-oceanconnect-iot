'use strict';

// var APPID = 'qvfjBMwPi9PglT678ykEIkCfouQa';
// var APPKEY = 'utS_3EqjG7aPCrO_wPLzdQ3L1YUa';
// var IPPORT = '180.101.147.89:8743';
// var accessToken = null;

init();

function init() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
    // StatusBar.backgroundColorByHexString("#45CEAC");
    // StatusBar.hide();
    setTimeout(function () {
        // window.location.href = 'html/device.html';
        mui.openWindow('html/deviceList.html');
    }, 1500);
    // login();
}

/*
function login() {
    mui.toast('button',{ duration:'short', type:'div' });
    $('button').click(function () {
        var url = 'https://' + IPPORT + '/iocm/app/sec/v1.1.0/login';
        var data = {
            appId: APPID,
            secret: APPKEY
        };
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: "json",
            success: function(data){
                mui.toast('登陆成功',{ duration:'short', type:'div' });
            },
            error: function (err) {
                mui.toast('err',{ duration:'short', type:'div' });
                console.log(err);
            }
        });
        mui.toast('登陆成功',{ duration:'short', type:'div' });
        window.location.href = 'html/device.html';
    });
}*/