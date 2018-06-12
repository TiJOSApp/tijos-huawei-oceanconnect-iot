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
const HUAWEI_APPID = 'qvfjBMwPi9PglT678ykEIkCfouQa';
const HUAWEI_SECRET = 'utS_3EqjG7aPCrO_wPLzdQ3L1YUa';
let huaweiAccessToken = null;
let huaweiDevices = {};
let connectionCount = 0;


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
            console.log(body);
            huaweiAccessToken = JSON.parse(body).accessToken;
            console.log('huaweiAccessToken:' + huaweiAccessToken);
            setTimeout(huaweiAuth, 3600 * 1000);
            if(func) func();
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
            console.log(body);
            let devices = JSON.parse(body).devices;
            for (let i in devices){
                huaweiDevices[devices[i].deviceId] = devices[i];
            }
            console.log('huaweiDevices：', huaweiDevices);
            console.log('**************************************************');
            setTimeout(getDevice,10000);
            if (func) func();
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

function setDecice(data, func){
    let url = HUWEI_DEVICES_SETTING_URL;
    console.log(typeof data);
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
    console.log(huaweiSettingOptions);
    request(huaweiSettingOptions, function (err, response, body) {
        if(!err && (response.statusCode == 200 || response.statusCode == 201)){
            console.log(body);
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

app.get('/devices', function (req, res) {
    res.json({
        data: huaweiDevices,
        err_code: '00',
        err_msg: 'success'
    });
});

app.post('/data', function (req, res) {
    console.log('hi,data');
    console.log(req.body);
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

app.post('/datas', function(req, res){
    // console.log('hi,datas');
    // console.log(req.body);
    // console.log('**************************************************');
    // console.log(typeof req.body);
    // let device = req.body;
    // huaweiDevices[device.deviceId] = device;
    // io.sockets.emit('deviceInfo', device);
    res.send(" post successfully!");
});

app.post('/setting', function (req, res) {
    console.log('hi,setting');
    console.log(req.body);
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

app.post('/setting', function (req, res) {
    setTimeout(function () {
        res.send('aaaaaa');  异步处理再返回
    },200)
});
