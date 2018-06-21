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
			case 5:
				oc.relaySchedule(payload);
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
				oc.reset();

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
			if(counter > 3) {
				oc.reset();
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

public class TiAgentTinySample {

	public static void main(String[] args) {

		System.out.println("Huawei OceanConnect IOT Demo Start ...");


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

			agent.initialize();

			while (true) {
				System.out.println("Measuring");
				t800.measure();
				oc.reportAll();
				oc.runSchedule();
				Thread.sleep(5000);
				
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

}
