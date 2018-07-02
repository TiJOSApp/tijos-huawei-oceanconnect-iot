
import java.io.IOException;

import tijos.framework.devicecenter.TiUART;
import tijos.framework.util.Delay;
import tijos.framework.sensor.bc95.IDeviceEventListener;
import tijos.framework.sensor.bc95.TiBC95;
import tijos.framework.sensor.button.ITiButtonEventListener;
import tijos.framework.sensor.button.TiButton;


/***
 * 云端控制命令到达时的处理
 * 注意： 由于NB-IOT的特性, 在默认模式下控制命令在设备上报数据时建立连接后发下来
 * @author lemon
 *
 */
class BC95EventListener implements IDeviceEventListener
{
	OceanConnect oc ;
	public BC95EventListener(OceanConnect oc ) {
		this.oc = oc;
	}

	@Override
	public void onCoapDataArrived(byte []message) {
		
		System.out.println("onCoapDataArrived " + message[0]);
		int messageId = message[0];
		int action = message[1];

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
	public void onUDPDataArrived(byte [] packet) {
		System.out.println("onUDPDataArrived");
	}
}

//触摸按键事件
class TouchListener implements ITiButtonEventListener {

	OceanConnect oc;
	
	int counter = 0;

	public TouchListener(OceanConnect oc) {
		this.oc = oc;
	}

	@Override
	public void onPressed(TiButton button) {

		try {
			//按3次后强制上报数据 
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
			
			oc.t800.oledPrint(0, 3, "touch:onReleased   ");
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

/**
 * 
 * 通过NB-IOT 模块BC95与华为/电信 OceanConnect平台建立连接并上报数据
 * 该例程展示如下功能
 * 1. 模块入网
 * 2. 每5秒通过DHT11采集温湿度数据，当温度变化超过1度或湿度变化超过5%时主动上报数据到平台
 * 3. 当收到平台控制命令下发时进行相应的控制
 * 4. 按键事件 - 手动按3次触摸按键后强制进行数据上报
 */
public class TiBC95Sample
{
	public static void main(String[] args) {
		System.out.println("Huawei OceanConnect NB-IOT Demo Start ...");

		try {
			
			// 传感器相关设置
			TikitT800 t800 = new TikitT800();
			t800.initialize();

			TiUART uart = TiUART.open(1);
			uart.setWorkParameters(8, 1, TiUART.PARITY_NONE, 9600);
			TiBC95 bc95 = new TiBC95(uart);
			
			OceanConnect oc = new OceanConnect(bc95, t800);
			bc95.setEventListener(new BC95EventListener(oc));

			// 设置按钮事件
			t800.setButtonEventListener(new TouchListener(oc));
			
			
			//电信物联网平台分配的IP, 请换成实际的服务器IP
			String serverIp = "180.101.147.115";
			int port = 5683;

			//连接服务器
			oc.connect(serverIp, port);
			
			//每5秒采集一次， 数据变化时上报
			while(true) {
				System.out.println("Measuring");
				t800.measure();
				oc.reportSensor();
				Delay.msDelay(5000);
			}

		} catch (IOException ex) {
			ex.printStackTrace();
		}

	}
}
