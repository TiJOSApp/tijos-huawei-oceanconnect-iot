$(function () {
    let  quitFlag = false;
    let  url = 'https://demo.tijos.net';
    init();

    function init(){
        document.addEventListener("backbutton", onBackKeyDown, false);
        mui('.mui-scroll-wrapper').scroll({
            scrollY: true, //是否竖向滚动
            scrollX: false, //是否横向滚动
            startX: 0, //初始化时滚动至x
            startY: 0, //初始化时滚动至y
            indicators: true, //是否显示滚动条
            deceleration:0.0006, //阻尼系数,系数越小滑动越灵敏
            bounce: true //是否启用回弹
        });
        $.ajax({
            type: "GET",
            url: url + '/devices',
            dataType: "json",
            success: function(data){
                if(data.err_code == '00'){
                    console.log(data);
                    let devices = {
                        data: []
                    }
                    for( var i in data.data){
                        devices.data.push(data.data[i]);
                    }
                    var html = template('deviceList', devices);
                    $('.content').html(html);
                    mui('.mui-switch')['switch'](); //动态添加switch的需要手动初始化

                    $(".device-relay-value").on("toggle",function(event){
                        var data = {
                            deviceId: $(this).parent().parent().parent().attr('id'),
                            command: {
                                serviceId: 'Relay',
                                method: 'RELAY_SWITCH',
                                paras: {
                                    status: 1
                                }
                            },
                            expireTime: 0
                        }
                        if(event.detail.isActive){
                            data.command.paras.status = 1;
                            console.log("你启动了开关");
                        }else{
                            data.command.paras.status = 0;
                            console.log("你关闭了开关");
                        }
                        setDevice(data);
                    });
                    $(".device-led-value").on("toggle",function(event){
                        var data = {
                            deviceId: $(this).parent().parent().parent().attr('id'),
                            command: {
                                serviceId: 'LED',
                                method: 'LED_SWITCH',
                                paras: {
                                    status: 1
                                }
                            },
                            expireTime: 0
                        }
                        if(event.detail.isActive){
                            data.command.paras.status = 1;
                            console.log("你启动了开关");
                        }else{
                            data.command.paras.status = 0;
                            console.log("你关闭了开关");
                        }
                        setDevice(data);
                    });

                    var socket = io.connect(url);
                    socket.on('deviceInfo', function (data) {
                        if(data.service.serviceId == 'SensorStatus'){
                            // $('#' + data.deviceId).find('.device-status-value').text(data.deviceInfo.status);
                            $('#' + data.deviceId).find('.device-temp-value').text(data.service.data.Temperature);
                            $('#' + data.deviceId).find('.V').text(data.service.data.Humidity);
                        } else if(data.service.serviceId == 'Relay'){
                            if(data.service.data.RelayStatus == 0){
                                if($('#' + data.deviceId).find('.device-relay-value').hasClass('mui-active')){
                                    mui($('#' + data.deviceId).find('.device-relay-value')[0]).switch().toggle();
                                }
                            }else {
                                if(!$('#' + data.deviceId).find('.device-relay-value').hasClass('mui-active')){
                                    mui($('#' + data.deviceId).find('.device-relay-value')[0]).switch().toggle();
                                }
                            }
                        } else if(data.service.serviceId == 'LED'){
                            if(data.service.data.RelayStatus == 0){
                                if($('#' + data.deviceId).find('.device-led-value').hasClass('mui-active')){
                                    mui($('#' + data.deviceId).find('.device-led-value')[0]).switch().toggle();
                                }
                            }else {
                                if(!$('#' + data.deviceId).find('.device-led-value').hasClass('mui-active')){
                                    mui($('#' + data.deviceId).find('.device-led-value')[0]).switch().toggle();
                                }
                            }
                        }
                    })
                }
            },
            error: function (err) {
                mui.toast('err',{duration:'short', type:'div'});
                console.log(err);
            }
        });
    }

    function onBackKeyDown() {
        // 返回按钮事件的事件处理函数
        setTimeout(function () {
            quitFlag = false;
        },2000)
        if (!quitFlag) {
            quitFlag = !quitFlag;
            mui.toast('再按一次退出',{ duration:'short', type:'div' });
            event.preventDefault();
        }else{
            navigator.app.exitApp();
        }
    }

    function setDevice(data) {
        $.ajax({
            type: "POST",
            url: url + '/setting',
            data: data,
            dataType: "json",
            success: function(data){
                console.log('set success')
            },
            error: function (err) {
                mui.toast('err',{duration:'short', type:'div'});
                console.log(err);
            }
        });
    }
})