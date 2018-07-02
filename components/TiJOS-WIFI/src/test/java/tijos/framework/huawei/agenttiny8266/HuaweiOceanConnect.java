package tijos.framework.huawei.agenttiny8266;

import java.io.IOException;
import java.util.Calendar;

import tijos.framework.util.Delay;
import tijos.framework.util.logging.Logger;

public class HuaweiOceanConnect {

	TiAgentTiny8266 agent;

	TikitT800 t800;

	int cookie = 0;

	/**
	 * 是否与云端建立连接
	 */
	int state = -1;

	byte[] dataBuffer = new byte[8];

	// 上一次采集的温湿度
	int preTmperature = 0;
	int preHumidity = 0;

	// 上一次测量时间
	long preMeasureTime = 0;

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

		// -6 上一次传输还没有完成, 等待5秒后重新传输,重试5次
		int counter = 5;
		while (-6 == reportSensor() && counter-- > 0) // in processing
		{
			Delay.msDelay(5000);
			t800.measure();
		}

	}

	private int reportSensor() throws IOException {

		int temp = (int) t800.getTemperature();
		int humidity = (int) t800.getHumidity();

		// 满足以下条件则上报数据
		// 温度变化 >1
		// 湿度变化 >5
		// 或距上次数据上报大于20秒
		if ((Math.abs(temp - preTmperature) >= 1) || (Math.abs(humidity - this.preHumidity) > 5)
				|| System.currentTimeMillis() - this.preMeasureTime > 20 * 1000) {

			Logger.info("HuaweiOceanConnect", " Data changed, report to OC, cookie " + cookie);

			dataBuffer[0] = 0; // message id
			dataBuffer[1] = (byte) t800.getTemperature();
			dataBuffer[2] = (byte) t800.getHumidity();
			dataBuffer[3] = t800.led.isTurnedOn() ? (byte) 1 : (byte) 0;
			dataBuffer[4] = t800.relay.isTurnedOn() ? (byte) 1 : (byte) 0;

			Logger.info("TiAgentTinySample", "Report temperature and humidity");

			int ret = agent.reportData(cookie++, dataBuffer, 0, 5);
			if (ret != 0) {
				Logger.severe("TiAgentTinySample", "Failed to report temperature and humidity , ret = " + ret);
				return ret;
			}

			this.preTmperature = temp;
			this.preHumidity = humidity;
			this.preMeasureTime = System.currentTimeMillis();

			return ret;
		}

		return 0;
	}

	/**
	 * LED control 
	 * @param state
	 * @throws IOException
	 */
	public void ledControl(int state) throws IOException {
		t800.turnLED(state > 0 ? true : false);

		System.out.println("led " + t800.led.isTurnedOn());
		reset();
	}

	/**
	 * Relay Control
	 * @param state
	 * @throws IOException
	 */
	public void relayControl(int state) throws IOException {
		t800.turnRelay(state > 0 ? true : false);

		System.out.println("relay " + t800.relay.isTurnedOn());
		reset();
	}

	/**
	 * Reset last time measure value to trigger data report on next time
	 */
	public void reset() {
		this.preHumidity = 0;
		this.preTmperature = 0;
	}


}
