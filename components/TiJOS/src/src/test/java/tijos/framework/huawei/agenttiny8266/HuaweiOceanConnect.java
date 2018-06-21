package tijos.framework.huawei.agenttiny8266;

import java.io.IOException;
import java.util.Calendar;

import tijos.framework.util.Delay;
import tijos.framework.util.logging.Logger;

public class HuaweiOceanConnect {

	TiAgentTiny8266 agent;

	TikitT800 t800;

	int cookie = 0;

	int state = -1;

	byte[] dataBuffer = new byte[8];

	int preTmperature = 0;
	int preHumidity = 0;

	Schedule schedule = new Schedule();

	public HuaweiOceanConnect(TiAgentTiny8266 agent, TikitT800 t800) {

		this.agent = agent;
		this.t800 = t800;
	}

	public void setState(int state) {
		this.state = state;
	}

	public void reportAll() throws IOException {

		// Agent is not started
		if (state != 0) {
			System.out.println("Agent is not started.");
			return;
		}

		int counter = 5;
		while (-6 == reportSensor() && counter-- > 0) // in processing
		{
			Delay.msDelay(5000);
			t800.measure();
		}
	}

	public int reportSensor() throws IOException {

		int temp = (int) t800.getTemperature();
		int humidity = (int) t800.getHumidity();

		// 温度变化 >1 或湿度变化 >5
		if ((Math.abs(temp - preTmperature) >= 1) || (Math.abs(humidity - this.preHumidity) > 5)) {

			Logger.info("HuaweiOceanConnect", " Data changed, report to OC, cookie " + cookie);

			dataBuffer[0] = 0; // message id
			dataBuffer[1] = (byte) t800.getTemperature();
			dataBuffer[2] = (byte) t800.getHumidity();
			dataBuffer[3] = t800.led.isTurnedOn() ? (byte) 1 : (byte) 0;
			dataBuffer[4] = t800.relay.isTurnedOn() ? (byte) 1 : (byte) 0;

			Logger.info("TiAgentTinySample", "Report temperature and humidity");

			int ret = agent.reportData(cookie++, dataBuffer, 0, 3);
			if (ret != 0) {
				Logger.severe("TiAgentTinySample", "Failed to report temperature and humidity , ret = " + ret);
				return ret;
			}

			this.preTmperature = temp;
			this.preHumidity = humidity;

			return ret;
		}

		return 0;
	}

	public int reportLedStatus() throws IOException {

		byte state = t800.led.isTurnedOn() ? (byte) 1 : (byte) 0;
		dataBuffer[0] = 1; // message id
		dataBuffer[1] = state;

		int ret = agent.reportData(cookie++, dataBuffer, 0, 2);
		if (ret != 0) {
			Logger.severe("TiAgentTinySample", "Failed to report LED status, ret = " + ret);
		}

		return ret;
	}

	public int reportRelayStatus() throws IOException {

		byte state = t800.relay.isTurnedOn() ? (byte) 1 : (byte) 0;
		dataBuffer[0] = 2; // message id
		dataBuffer[1] = (byte) state;

		int ret = agent.reportData(cookie++, dataBuffer, 0, 2);
		if (ret != 0) {
			Logger.severe("TiAgentTinySample", "Failed to report RELAY status, ret = " + ret);
		}

		return ret;

	}

	public void ledControl(int state) throws IOException {
		t800.turnLED(state > 0 ? true : false);

		System.out.println("led " + t800.led.isTurnedOn());
		reset();
	}

	public void relayControl(int state) throws IOException {
		t800.turnRelay(state > 0 ? true : false);

		System.out.println("relay " + t800.relay.isTurnedOn());
		reset();
	}

	public void relaySchedule(byte[] payload) {

		schedule = new Schedule(payload[1], payload[2], payload[3], payload[4]);

		for (int i = 0; i < 7; i++) {
			if (payload[5 + i] > 0)
				schedule.setOccurenceDayOfWeek(i);
		}

		boolean on_time_enable = payload[12] > 0 ? true : false;
		boolean off_time_enable = payload[13] > 0 ? true : false;

		schedule.enableOnTime(on_time_enable);
		schedule.enableOffTime(off_time_enable);

	}

	public void runSchedule() {
		try {
			int state = schedule.run();
			
			System.out.println("state " + state);
			
			if (state < 0)
				return;

			if (state > 0)
				this.t800.turnRelay(true);
			else
				this.t800.turnRelay(false);

		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	public void reset() {
		this.preHumidity = 0;
		this.preTmperature = 0;
	}
	
	/*
	 * public static void main(String[] args) { int on_start_hour = 18; int
	 * on_start_min = 10; int off_start_hour = 22; int off_start_min = 30; int Sun =
	 * 1; int Mon = 1; int Tue = 1; int Wen = 0; int Thu = 1; int Fri = 1; int Sat =
	 * 0; int on_time_enable = 0; int off_time_enable = 1;
	 * 
	 * int pos = 1; byte [] payload = new byte[14];
	 * 
	 * payload[pos ++] = (byte)on_start_hour; payload[pos ++] = (byte)on_start_min;
	 * payload[pos ++] = (byte)off_start_hour; payload[pos ++] =
	 * (byte)off_start_min;
	 * 
	 * payload[pos ++] = (byte)Sun; payload[pos ++] = (byte)Mon; payload[pos ++] =
	 * (byte)Tue; payload[pos ++] = (byte)Wen; payload[pos ++] = (byte)Thu;
	 * payload[pos ++] = (byte)Fri; payload[pos ++] = (byte)Sat;
	 * 
	 * payload[pos ++] = (byte)on_time_enable; payload[pos ++] =
	 * (byte)off_time_enable;
	 * 
	 * relaySchedule(payload); }
	 */
}
