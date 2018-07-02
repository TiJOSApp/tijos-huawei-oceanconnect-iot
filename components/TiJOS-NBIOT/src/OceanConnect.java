import java.io.IOException;
import java.util.Calendar;

import tijos.framework.sensor.bc95.TiBC95;
import tijos.framework.util.Delay;
import tijos.framework.util.logging.Logger;

public class OceanConnect {

	TiBC95 bc95;
	TikitT800 t800;

	byte[] dataBuffer = new byte[5];

	int preTmperature = 0;
	int preHumidity = 0;

	public OceanConnect(TiBC95 bc95, TikitT800 t800) {
		this.bc95 = bc95;
		this.t800 = t800;
	}

	public void connect(String serverIp, int port) throws IOException {
		// 查询模块射频功能状态
		if (!bc95.isMTOn()) {
			System.out.println("Turn ON MT ...");
			bc95.turnOnMT();
			while (!bc95.isMTOn()) {
				Delay.msDelay(2000);
			}
		}

		// 查询网络是否激活
		if (!bc95.isNetworkActived()) {
			System.out.println("Active network ...");
			bc95.activeNetwork();
			Delay.msDelay(1000);
			while (!bc95.isNetworkActived()) {
				Delay.msDelay(1000);
			}
		}

		System.out.println(" IMSI : " + bc95.getIMSI());
		System.out.println(" IMEI : " + bc95.getIMEI());
		System.out.println(" RSSI : " + bc95.getRSSI());

		System.out.println(" Is Actived :" + bc95.isNetworkActived());
		System.out.println(" Is registered : " + bc95.isNetworkRegistred());

		System.out.println("Connection Status : " + bc95.getNetworkStatus());

		System.out.println("IP Address " + bc95.getIPAddress());
		System.out.println("Date time " + bc95.getDateTime());

		// 设置自动连接
		bc95.configAutoConnect(true);

		// 设置服务器IP
		bc95.setCDPServer(serverIp, 5683);

		// 启用发送消息成功通知
		bc95.enableMsgNotification(true);

		// 启用新消息到达通知
		bc95.enableNewArriveMessage();
	}

	/**
	 * 数据上报, 数据格式通过 OceanConnect的插件开发功能中定义
	 * 
	 * @throws IOException
	 */
	public void reportSensor() throws IOException {

		int temp = (int) t800.getTemperature();
		int humidity = (int) t800.getHumidity();

		// 温度变化 >1 或湿度变化 >5
		if ((Math.abs(temp - preTmperature) >= 1) || (Math.abs(humidity - this.preHumidity) > 5)) {

			Logger.info("HuaweiOceanConnect", " Data changed, report to OC");

			dataBuffer[0] = 0; // message id
			dataBuffer[1] = (byte) t800.getTemperature();
			dataBuffer[2] = (byte) t800.getHumidity();
			dataBuffer[3] = t800.led.isTurnedOn() ? (byte) 1 : (byte) 0;
			dataBuffer[4] = t800.relay.isTurnedOn() ? (byte) 1 : (byte) 0;

			Logger.info("TiAgentTinySample", "Report temperature and humidity");

			try {
				bc95.coapSend(dataBuffer);

			} catch (IOException e) {
				e.printStackTrace();
				Logger.severe("OceanConnect", "Failed to report temperature and humidity");
			}

			this.preTmperature = temp;
			this.preHumidity = humidity;

		}

	}

	/**
	 * LED control
	 * @param state
	 * @throws IOException
	 */
	public void ledControl(int state) throws IOException {
		t800.turnLED(state > 0 ? true : false);
		reset();
	}

	/**
	 * Relay Control
	 * @param state
	 * @throws IOException
	 */
	public void relayControl(int state) throws IOException {
		t800.turnRelay(state > 0 ? true : false);
		reset();
	}

	/**
	 * Reset previous value to trigger data report next time
	 */
	public void reset() {
		this.preHumidity = 0;
		this.preTmperature = 0;
	}

}
