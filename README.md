# tijos-huawei-oceanconnect-iot
TiJOS driver for Huawei OceanConnect IOT Platform 

# 基于钛极OS(TiJOS)的华为OceanConnect云接入案例

## 简介

OceanConnect 是华为公司基于物联网、云计算和大数据等技术打造的开放生态环境。OceanConnect 围绕着华为IoT联接管理平台，提供了170多种开放API 和系列化Agent帮助伙伴加速应用上线，简化终端接入，保障网络联接，实现与上下游伙伴产品的无缝联接，同时提供面向合作伙伴的一站式服务，包括各类技术支持、营销支持和商业合作。

OceanConnect 正在与越来越多的合作伙伴一起，为了全联接的美好世界而努力，目前已能够提供许多高价值行业应用，比如智慧家庭、车联网、智能抄表、智能停车、平安城市等。

该案例基于TiKit-T800-STM32F103A型号及传感器DEMO板，基于AgentTiny ESP8266模块。 



## 目录说明

| 目录         | 说明                                                   |      |
| ------------ | ------------------------------------------------------ | ---- |
| client       | HTML客户端，基于cordova开发， 适用于手机端，PC端       |      |
| oceanconnect | 华为OceanConnect平台相关配置                           |      |
| server       | 基于NodeJS开发的应用服务器，与OceanConnect平台进行对接 |      |
| TiJOS-NBIOT  | 基于BC95的NBIOT模块的TiJOS应用                         |      |
| TiJOS-WIFI   | 基于ESP8266的WIFI模块的TiJOS应用                       |      |



## 申请OceanConnect IoT平台账号

在测试该案例时请先申请OceanConnect平台账号，可通过如下途径进行申请 

**通过华为云平台申请** 

https://www.huaweicloud.com/product/iot.html

**通过天翼物联产业联盟申请**

http://www.tianyiiot.com/lab/lab_test_evals.jsp



关于OceanConnect平台的使用，请参考如下链接

https://github.com/SuYai/OceanConnectHelp



## 导入案例Profile

在熟悉华为OceanConnect平台后， 可从目录components\oceanconnect\profile中导入profile, 从components\oceanconnect\plugin导入相应的CIG插件。

如下图所示：

![1530501398671](.\img\1530501398671.png)



## 钛极OS(TiJOS)应用

钛极OS(TiJOS)提供了通过WIFI和NB-IOT进行数据通讯接入的案例和源码. 



### WIFI 方式

该案例可通过钛云物联的TiKit-T800-WIFI开发板进行测试，WIFI通过内置华为AgentTiny的ESP8266模块接入OceanConnect， 相关模块可自行编译AgentTiny for ESP8266相关源码或联系钛云物联。

连接开发板后， 可通过安装了TiStudio的Eclipse导入TiJOS-WIFI工程， 找到src\test\java\tijos\framework\huawei\agenttiny8266\TiAgentTinySample.java文件， 在main函数中设置服务器及通讯相关参数,这些参数可通过OceanConnect平台中获取

![1530501972131](.\img\1530501972131.png)

修改相关通讯设置后，可通过Run As 运行该应用并通过OceanConnect平台查看相关数据。

### NB-IOT 方式

该案例可通过钛云物联的TiKit-T800-NBIOT开发板进行测试， NBIOT通过 移远BC95通讯模块接入OceanConnect.

连接开发板后， 可通过安装了TiStudio的Eclipse导入TiJOS-NBIOT工程， 找到TiJOS-NBIOT\src\TiBC95Sample.java文件， 在main函数中设置服务器及通讯相关参数, 如下图所示：

![1530502267494](.\img\1530502267494.png)

修改相关通讯设置后，可通过Run As 运行该应用并通过OceanConnect平台查看相关数据。

注意：在进行测试之前，请确认您的物联卡获得接入该IP的授权。



## 后端应用说明

该案例同时提供了OceanConnect北向应用服务器及手机端接入例程， 其中应用服务器通过NodeJS搭建和开发， 手机端应用通过cordova进行开发，适用于Android, IOS,及PC端。

可参考OceanConnect相关文档及例程。