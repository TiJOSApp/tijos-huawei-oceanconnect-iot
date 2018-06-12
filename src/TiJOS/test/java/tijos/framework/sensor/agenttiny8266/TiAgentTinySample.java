package tijos.framework.sensor.agenttiny8266;

import tijos.framework.devicecenter.TiUART;
import tijos.framework.util.Delay;

/**
 * Sample for Huawei Ocean Connect 
 *
 */
class AgentEventListener implements IDevEventListener {

	@Override
	public void onCloudDataArrive(byte[] payload) {
		
		System.out.println("onCloudDataArrive " + payload[0]);
	}

	@Override
	public void onWifiEvent(int evt) {

		System.out.println("onWifiEvent " + evt);

	}

	@Override
	public void onSmartConfigEvent(int evt) {

		System.out.println("onSmartConfigEvent " + evt);

	}

	@Override
	public void onReportCloudAck(int type, int cookie, int status) {
		System.out.println("onReportCloudAck type " + type + " cookie " + cookie + " status " + status);
		
	}

	@Override
	public void onAgentStarted() {
		System.out.println("onAgentStarted");
		
	}
	
}

public class TiAgentTinySample {

	public static void main(String[] args) {
		System.out.println("Hello World!");

		byte[] psk = new byte[] { 0x65, 0x1d, 0x73, (byte) 0xee, 0x27, (byte) 0xb0, 0x33, 0x30, (byte) 0xde, 0x19, 0x34,
				0x08, 0x2b, 0x47, (byte) 0xb1, 0x30 };

		String epName = "201806061342";

		String serverIP = "";
		
		
		byte [] data = new byte[] {0, 1,2, 3 };
		
		try {
			TiUART uart = TiUART.open(10);
			uart.setWorkParameters(8, 1, TiUART.PARITY_NONE, 9600);

			TiAgentTiny8266 at = new TiAgentTiny8266(uart, epName, psk);

			at.setParameters(serverIP, psk);
			
			at.setEventListener(new AgentEventListener());
			
			at.initialize();
			
			System.out.println("Start Smart Config");
			
			//at.beginSmartConfiguration();
			
			//Delay.msDelay(15000);
			
			
			int counter = 0;
			while(true) {
				
				
				System.out.println("report data");
				int ret = at.reportData(counter, data, 0, data.length);
				if(ret != 0) {
					System.out.println("report data error " + ret);
				}
				
				//10 seconds
				Delay.msDelay(10000);  
				
				counter ++;
				data[1] = (byte)(counter % 255);
				data[2] = (byte)((counter + 1) % 255);
				data[3] = (byte)((counter + 2) % 255);
			}
		
			
		} catch (Exception e) {
			e.printStackTrace();
		}

	}
}
