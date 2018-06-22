$(function () {
    $(".device-common")[0].addEventListener("tap",function(){
        mui.openWindow('device.html');
    });
    $(".device-temperature")[0].addEventListener("tap",function(){
        mui.openWindow('temperature.html');
    });
    $(".device-switch")[0].addEventListener("tap",function(){
        mui.openWindow('switch.html');
    });

    document.addEventListener("backbutton", onBackKeyDown, false);
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
})