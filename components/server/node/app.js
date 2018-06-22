let fs = require('fs');
let path = require('path');
let request = require('request');
let bodyParser = require('body-parser');

let express = require('express');
let app= express();
let server=require('http').Server(app);
let io=require('socket.io')(server);


let certFile = path.resolve(__dirname, 'keys/client.crt');
let keyFile = path.resolve(__dirname, 'keys/client.key');
const HUAWEI_AUTH_URL = 'https://180.101.147.89:8743/iocm/app/sec/v1.1.0/login';
const HUWEI_DEVICES_URL = 'https://180.101.147.89:8743/iocm/app/dm/v1.3.0/devices?pageNo=0&pageSize=50';
const HUWEI_DEVICES_SETTING_URL = 'https://180.101.147.89:8743/iocm/app/cmd/v1.4.0/deviceCommands';
const HUWEI_HISTORY_TEMP_DAY_URL = 'https://180.101.147.89:8743/iocm/app/data/v1.1.0/deviceDataHistory?deviceId='
const HUAWEI_APPID = 'qvfjBMwPi9PglT678ykEIkCfouQa';
const HUAWEI_SECRET = 'sEqf8nkvKStrNnRRDabiyyWXhNQa';
let huaweiAccessToken = null;
let huaweiDevices = {};
let connectionCount = 0;
let delayOpenSetting = {}; //用于存储打开的延时定时器
let delayStopSetting = {}; //用于存储关闭的延时定时器
let tempDayValue = {};
let timingSetting = {};
huaweiAuth(getDevice);

function huaweiAuth(func){
    let huaweiAuthOptions = {
        url: HUAWEI_AUTH_URL,
        method: 'POST',
        cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            'appId': HUAWEI_APPID,
            'secret': HUAWEI_SECRET
        },
        strictSSL: false
    };
    request(huaweiAuthOptions, function (err, response, body) {
        if(!err && response.statusCode == 200){
            huaweiAccessToken = JSON.parse(body).accessToken;
            console.log('huaweiAccessToken' + huaweiAccessToken);
            setTimeout(huaweiAuth, 3600 * 1000);
            if(func) func(getTempDayValue);
        }else{
            if(err){
                console.log('huawei auth failed');
                console.log('err:' + err);
            }else{
                console.log('huawei auth failed');
                console.log('statusCode:' + response.statusCode);
                console.log('body:' + body);
            }
        }
    });
}

function getDevice(func){
    let huaweiDevicesOptions = {
        url: HUWEI_DEVICES_URL,
        method: 'GET',
        cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
        headers: {
            'content-type': 'application/json',
            'app_key': HUAWEI_APPID,
            'Authorization': huaweiAccessToken,
        },
        strictSSL: false
    };
    request(huaweiDevicesOptions, function (err, response, body) {
        if(!err && response.statusCode == 200){
            let devices = JSON.parse(body).devices;
            for (let i in devices){
                huaweiDevices[devices[i].deviceId] = devices[i];
                if (func) {
                    func(devices[i].deviceId);
                }
            }
            console.log('**************************************************');
            setTimeout(function () {
                getDevice(getTempDayValue);
            }, 60000);
        }else{
            if(err){
                console.log('huawei devices failed');
                console.log('err:' + err);
            }else{
                console.log('huawei devices failed');
                console.log('statusCode:' + response.statusCode);
                console.log('body:' + body);
            }
        }
    });
}

function getTempDayValue(deviceId){
    let now = new Date();
    let before = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let nowText = formatDate(now.getTime());
    let beforeText = formatDate(before.getTime());
    console.log(beforeText);
    console.log(nowText);
    let url = HUWEI_HISTORY_TEMP_DAY_URL + deviceId + '&gatewayId=' + deviceId + '&serviceId=' + 'SensorStatus' + '&startTime=' + beforeText +  '&endTime=' + nowText;
    console.log(url);
    let huaweiDevicesOptions = {
        url: url,
        method: 'GET',
        cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
        headers: {
            'content-type': 'application/json',
            'app_key': HUAWEI_APPID,
            'Authorization': huaweiAccessToken,
        },
        strictSSL: false
    };
    request(huaweiDevicesOptions, function (err, response, body) {
        if(!err && response.statusCode == 200){
            let data = JSON.parse(response.body);
            console.log(response.body);
            tempDayValue[deviceId] = [];
            data.deviceDataHistoryDTOs.forEach(function (item) {
                let obj = {
                    data: item.data,
                    time: getDate(item.timestamp)
                }
                tempDayValue[deviceId].unshift(obj);
            })
            console.log('tempDayValue' + JSON.stringify(tempDayValue));
            console.log('**************************************************');
        }else{
            if(err){
                console.log('huawei devices history failed');
                console.log('err:' + err);
            }else{
                console.log('huawei devices history failed');
                console.log('statusCode:' + response.statusCode);
                console.log('body:' + body);
            }
        }
    });
    function formatDate(num) {
        num = new Date(parseInt(num));
        let year = num.getFullYear();
        let month = num.getMonth() >= 9 ? num.getMonth() + 1 : '0' + (num.getMonth() + 1);
        let date = num.getDate() >= 10 ? num.getDate() : '0' + num.getDate();
        let hour=num.getHours() >= 10 ? num.getHours() : '0' + num.getHours();
        let minute=num.getMinutes() >= 10 ? num.getMinutes() : '0' + num.getMinutes();
        let second=num.getSeconds() >= 10 ? num.getSeconds() : '0' + num.getSeconds();
        return '' + year + month + date + 'T' + hour + minute + second + 'Z';
    }
    function getDate(str) {
        str = str.substring(0, 4) + '/' + str.substring(4, 6) + '/' +
            str.substring(6, 8) + ' ' + str.substring(9, 11) + ':' +
            str.substring(11, 13) + ':' + str.substring(13, 15) + '.0';
        let time = new Date(str).getTime() + 8 * 60 * 60 * 1000;
        time = new Date(time);
        return (time.getHours() >= 10 ? time.getHours() : '0' + time.getHours())
            + ':' + (time.getMinutes() >= 10 ? time.getMinutes() : '0' + time.getMinutes());
    }
}

function setDecice(data, func){
    let url = HUWEI_DEVICES_SETTING_URL;
    let huaweiSettingOptions = {
        url: url,
        method: 'POST',
        cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
        json: true,
        headers: {
            'content-type': 'application/json',
            'app_key': HUAWEI_APPID,
            'Authorization': huaweiAccessToken,
        },
        body: data,
        strictSSL: false
    };
    request(huaweiSettingOptions, function (err, response, body) {
        console.log('setting.......');
        if(!err && (response.statusCode == 200 || response.statusCode == 201)){
            if (func) func(body, true);
        }else{
            if (func) func(body, false);
            if(err){
                console.log('huawei devices setting failed');
                console.log('err:' + err);
            }else{
                console.log('huawei devices setting failed');
                console.log('statusCode:' + response.statusCode);
                console.log('body:' + body);
            }
        }
    });
}

app.use(bodyParser.json()); // for parsing application/json

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, 'www')));

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if(req.method == 'OPTIONS') {
        //让options请求快速返回
        console.log(options);
        res.sendStatus(200);
    } else {
        next();
    }
});

app.get('/', function (req, res) {
    res.end('hello word');
});

//查询指定设备信息
app.get('/deviceDelaySetting', function (req, res) {
    if(req.query.deviceId){
        let data = {};
        if(delayOpenSetting[req.query.deviceId] && delayOpenSetting[req.query.deviceId].hasOwnProperty('id')){
            data['delayOpenSettingTime'] = delayOpenSetting[req.query.deviceId]['time'];
        }
        if (delayStopSetting[req.query.deviceId] && delayStopSetting[req.query.deviceId].hasOwnProperty('id')) {
            data['delayStopSettingTime'] = delayStopSetting[req.query.deviceId]['time'];
        }
        console.log(data);
        res.json({
            data: data,
            err_code: '00',
            err_msg: 'success'
        });
    }
});

app.get('/deviceTimingSetting', function (req, res) {
    let data = {};
    if(timingSetting[req.query.deviceId]){
        data = timingSetting[req.query.deviceId];
    }
    if(req.query.deviceId){
        res.json({
            data: data,
            err_code: '00',
            err_msg: 'success'
        });
    }
});

app.get('/device', function (req, res) {
    if(req.query.deviceId){
        res.json({
            data: huaweiDevices[req.query.deviceId],
            err_code: '00',
            err_msg: 'success'
        });
    }
});

//查询全部设备信息
app.get('/devices', function (req, res) {
    res.json({
        data: huaweiDevices,
        err_code: '00',
        err_msg: 'success'
    });
});

//查询全部设备信息
app.get('/tempDayValue', function (req, res) {
    console.log(JSON.stringify(tempDayValue));
    console.log(tempDayValue[req.query.deviceId]);
    if(req.query.deviceId){
        res.json({
            data: tempDayValue[req.query.deviceId],
            err_code: '00',
            err_msg: 'success'
        });
    }
});

//用于华为数据订阅
app.post('/data', function (req, res) {
    console.log('hi,data');
    console.log('**************************************************');
    let device = req.body;

    for (let i in huaweiDevices[device.deviceId].services){
        if (huaweiDevices[device.deviceId].services[i].serviceId == device.service.serviceId){
            huaweiDevices[device.deviceId].services[i] = device.service;
            break;
        }
    }
    io.sockets.emit('deviceInfo', device);
    res.send(" post successfully!");
});

//用于华为数据订阅，暂时不用
app.post('/datas', function(req, res){
    res.send("post successfully!");
});

//即时设置
app.post('/setting', function (req, res) {
    console.log('hi,setting');
    console.log('**************************************************');
    setDecice(req.body, function (data, flag) {
        if(flag){
            res.writeHead(200, {'Content-Type': 'application/json'});
        } else{
            res.writeHead(404, {'Content-Type': 'application/json'});
        }
        res.write(JSON.stringify(data));
        res.end();
    })
});

//延时设置
app.post('/delaySetting', function (req, res) {
    console.log('hi,delay setting');
    console.log('**************************************************');
    let data = req.body.data;
    data.forEach(function (item) {
        if(item.hasOwnProperty('openStatus')){
            if(delayOpenSetting[item.deviceId] && delayOpenSetting[item.deviceId]['id']){
                clearTimeout(delayOpenSetting[item.deviceId]['id']);
            }
            delayOpenSetting[item.deviceId] = {};
            if(item.openStatus){
                delayOpenSetting[item.deviceId]['time'] = new Date().getTime() + parseInt(item.delayTime);
                delayOpenSetting[item.deviceId]['id'] = setTimeout(function () {
                    console.log('open');
                    delete item.delayTime;
                    delete item.openStatus;
                    delayOpenSetting[item.deviceId] = {};
                    setDecice(item);
                }, item.delayTime);
            }
        } else{
            if(delayStopSetting[item.deviceId]  && delayStopSetting[item.deviceId]['id']){
                clearTimeout(delayStopSetting[item.deviceId]['id']);
            }
            delayStopSetting[item.deviceId] = {};
            if(item.stopStatus){
                delayStopSetting[item.deviceId]['time'] = new Date().getTime() + parseInt(item.delayTime);
                delayStopSetting[item.deviceId]['id'] = setTimeout(function () {
                    console.log('stop');
                    delete item.delayTime;
                    delete item.stopStatus;
                    delayStopSetting[item.deviceId] = {};
                    setDecice(item);
                }, item.delayTime);
            }
        }
    });
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({
        err_code: '00'
    }));
    res.end();
});

//定时设置
app.post('/timingSetting', function (req, res) {
    console.log('hi,timing setting');
    console.log('**************************************************');
    let data = req.body;
    timingSetting[data.deviceId] = data;
    setDecice(data);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({
        err_code: '00'
    }));
    res.end();
});


//消息推送
io.sockets.on('connection',function(socket){
    connectionCount ++;
    console.log('new connection,count:' + connectionCount);
    console.log('**************************************************');
    socket.on('disconnect',function(){
        connectionCount --;
        console.log('disconnected,count:' + connectionCount);
        console.log('**************************************************');
    });
});

server.listen(18081,function(){
    console.log('server begin...');
    console.log('**************************************************');
});