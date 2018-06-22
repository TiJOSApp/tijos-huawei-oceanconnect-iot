$(function () {
    let deviceId = getRequest('deviceId');
    let deviceType = getRequest('deviceType');
    let myChart = echarts.init(document.getElementById('main'),null,{renderer: 'canvas'});
    let option = {
        backgroundColor: '#394056',
        title: {
            text: '',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 16,
                color: '#57617B'
            },
            left: '17px'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    color: '#57617B'
                }
            }
        },
        legend: {
            icon: 'rect',
            itemWidth: 14,
            itemHeight: 5,
            itemGap: 13,
            data: ['温度', '湿度'],
            right: '4%',
            top: '30px',
            textStyle: {
                fontSize: 12,
                color: '#57617B'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: '#57617B'
                }
            },
            data: ['13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55']
        }],
        yAxis: [{
            type: 'value',
            name: '单位:℃/%',
            axisTick: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: '#57617B'
                }
            },
            axisLabel: {
                margin: 10,
                textStyle: {
                    fontSize: 14
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#57617B'
                }
            }
        }],
        series: [{
            name: '温度',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(137, 189, 27, 0.3)'
                    }, {
                        offset: 0.8,
                        color: 'rgba(137, 189, 27, 0)'
                    }], false),
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                }
            },
            itemStyle: {
                normal: {
                    color: 'rgb(137,189,27)',
                    borderColor: 'rgba(137,189,2,0.27)',
                    borderWidth: 12

                }
            },
            data: [20,23,20,25,26,29,30,31,28,30,22,23]
        }, {
            name: '湿度',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(0, 136, 212, 0.3)'
                    }, {
                        offset: 0.8,
                        color: 'rgba(0, 136, 212, 0)'
                    }], false),
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                }
            },
            itemStyle: {
                normal: {
                    color: 'rgb(0,136,212)',
                    borderColor: 'rgba(0,136,212,0.2)',
                    borderWidth: 12

                }
            },
            data: [50,51,52,53,50,60,61,62,50,55,40,44]
        }]
    };
    let url = 'https://demo.tijos.net';

    init();

    function init() {
        getTempDayValue();
        preventBrowserBack();

        document.addEventListener("backbutton", onBackKeyDown, false);

        $('.back')[0].addEventListener("tap",function () {
            onBackKeyDown();
        });
    }

    function getTempDayValue() {
        $.ajax({
            type: 'GET',
            url: url + '/tempDayValue?deviceId=' + deviceId,
            dataType: 'json',
            success: function (data) {
                if (data.err_code == '00') {
                    option.xAxis[0].data = [];
                    option.series[0].data = [];
                    option.series[1].data = [];
                    data.data.forEach(function (item) {
                        option.xAxis[0].data.push(item.time);
                        option.series[0].data.push(item.data.Temperature);
                        option.series[1].data.push(item.data.Humidity);
                    })
                    myChart.setOption(option);
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

    function onBackKeyDown() {
        mui.openWindow('temperature.html?deviceId=' + deviceId + '&deviceType=' + deviceType);
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