package tijos.framework.huawei.agenttiny8266;

import java.io.IOException;
import tijos.framework.devicecenter.TiUART;
import tijos.framework.platform.peripheral.ITiKeyboardListener;
import tijos.framework.sensor.button.ITiButtonEventListener;
import tijos.framework.sensor.button.TiButton;

//AgentTiny event listener
class AgentEventListener implements IDevEventListener {

	HuaweiOceanConnect oc;

	public AgentEventListener(HuaweiOceanConnect oc) {
		this.oc = oc;
	}

	@Override
	public void onCloudDataArrive(byte[] payload) {

		System.out.println("onCloudDataArrive " + payload[0] + " " + payload[1]);
		int messageId = payload[0];
		int action = payload[1];

		try {
			switch (messageId) {
			case 3: // LED
				oc.ledControl(action);
				break;
			case 4: // RELAY
				oc.relayControl(action);
				break;
			default:
				break;
			}

		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	@Override
	public void onWifiEvent(int evt) {

		System.out.println("onWifiEvent " + evt);
		if (evt == 4) {
			try {
				oc.t800.oledPrint(0, 3, "WIFI Connected");
			} catch (IOException ex) {
				ex.printStackTrace();
			}
		}
	}

	@Override
	public void onSmartConfigEvent(int evt) {

		System.out.println("onSmartConfigEvent " + evt);
	}

	@Override
	public void onReportCloudAck(int type, int cookie, int status) {
		System.out.println("onReportCloudAck type " + type + " cookie " + cookie + " status " + status);
		try {
			
			oc.t800.oledPrint(0, 3, "ACK[" + status + "] " + cookie + "         ");
			
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	@Override
	public void onAgentStarted(int evt) {
		System.out.println("onAgentStarted evt " + evt);

		oc.setState(evt);
		try {
			if (evt == 0) {
				oc.t800.oledPrint(0, 3, "Agent Started     ");
				oc.reset();	//触发数据上报

			} else {
				oc.t800.oledPrint(0, 3, "Agent Start Failed " + evt);
			}
		} catch (IOException ex) {
			ex.printStackTrace();
		}

	}

}

class KeyboardListener implements ITiKeyboardListener {

	HuaweiOceanConnect oc;

	public KeyboardListener(HuaweiOceanConnect oc) {
		this.oc = oc;
	}

	@Override
	public void onPressed(int arg0, long arg1) {

	}

	@Override
	public void onReleased(int arg0, long arg1) {

		try {
			//进入WIFI Smart Config状态，请能过ESP Touch APP在手机端进行WIFI AP设置
			oc.agent.beginSmartConfiguration();
			oc.t800.oledPrint(0, 3, "Wifi SmartConfig "); 
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}


// 触摸按键事件
class TouchListener implements ITiButtonEventListener {

	HuaweiOceanConnect oc;
	
	int counter = 0;

	public TouchListener(HuaweiOceanConnect oc) {
		this.oc = oc;
	}

	@Override
	public void onPressed(TiButton button) {

		try {
			
			counter ++;
			if(counter >= 3) {
				oc.reset(); //触发数据上报
				counter = 0 ;
			}

			oc.t800.oledPrint(0, 3, "onPressed " + counter + "   ");
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		System.out.println("onPressed");
	}

	@Override
	public void onReleased(TiButton button) {

		try {
			
			oc.t800.oledPrint(0, 3, "touch:onReleased");
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

/**
 * Huawei OceanConnect with ESP8266 AgentTiny Demo 
 * 
 * 通过内置AgentTiny的ESP8266模块与华为/电信 OceanConnect平台建立连接并上报数据
 * 该例程展示如下功能
 * 1. WIFI AP设置 - 按下底板红色按键启动SmartConfig， 通过ESP Touch APP在手机端进行WIFI路由器配置 
 * 2. 每5秒通过DHT11采集温湿度数据，当温度变化超过1度或湿度变化超过5%时主动上报数据到平台
 * 3. 当收到平台控制命令下发时进行相应的控制
 * 4. 按键事件 - 手动按3次触摸按键后强制进行数据上报
 * 5. 20秒内无数据上报时主动上报
 */
 
public class TiAgentTinySample {

	public static void main(String[] args) {

		System.out.println("Huawei OceanConnect WIFI Demo Start ...");

		/**
		 * 以下参数可从OceanConnect平台获取
		 * PSK: 通讯密钥
		 * epName: 设备标识码
		 * serverIP: OceanConnect 服务器 IP地址  
		 */
		byte[] psk = new byte[] {0x16,0x18,0x77,(byte)0xb1,0x57,0x03,(byte)0xae, (byte)0xdc, (byte)0xdd,0x10,0x2d,(byte)0xa2,0x7d,0x33,(byte)0xa7,(byte)0xba};
		String epName = "201806210932";
		String serverIP = "180.101.147.115";

		try {

			// 打开连接LiteOS AgentTiny模块的UART
			TiUART uart = TiUART.open(1);
			uart.setWorkParameters(8, 1, TiUART.PARITY_NONE, 9600);

			// 创建AgentTiny对象
			TiAgentTiny8266 agent = new TiAgentTiny8266(uart, epName);
			agent.setParameters(serverIP, psk);

			// 传感器相关设置
			TikitT800 t800 = new TikitT800();
			t800.initialize();

			// 连接华为OceanConnect平台
			HuaweiOceanConnect oc = new HuaweiOceanConnect(agent, t800);
			agent.setEventListener(new AgentEventListener(oc));

			// 设置按钮事件
			t800.setButtonEventListener(new TouchListener(oc));
			t800.setKeyboardEventListener(new KeyboardListener(oc));
			
			//AgentTiny 初始化
			agent.initialize();

			//每5秒进行测量
			while (true) {
				System.out.println("Measuring");
				t800.measure();
				oc.reportAll();
				Thread.sleep(5000);
				
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

}
