package tijos.framework.sensor.agenttiny8266;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;

import com.sun.media.jfxmedia.logging.Logger;

import tijos.framework.devicecenter.TiUART;
import tijos.framework.util.Delay;
import tijos.framework.util.Formatter;
import tijos.framework.util.LittleBitConverter;

/**
 * TiJOS driver for Huawei OceanConnect Platform base on ti-esp8266-oc 
 *
 */
public class TiAgentTiny8266 extends Thread {
	String endPointName;
	byte[] dtlsPSK = null;
	TiUART uartObj = null;

	// IO stream for UART
	InputStream input;

	IDevEventListener eventListener;

	// Ack command for wait
	WaitAckCmd ackCmd = new WaitAckCmd(0, 0);
	
	int wifiState = -1;
	
	boolean isSmartConfig = false;
	
	String serverIP;

	// Keep the UART read thread running
	private boolean keeprunning = true;

	/**
	 * Construction
	 * @param uart  UART - 9600,8,1,None
	 * @param name  Device symbol code from OC platform
	 * @param psk   PSK for communication
	 */
	public TiAgentTiny8266(TiUART uart, String name, byte[] psk) {
		this.endPointName = name;
		this.dtlsPSK = psk;
		this.uartObj = uart;

		this.input = new BufferedInputStream(new TiUartInputStream(uart), 256);

	}

	/**
	 * Initialize 
	 * @throws IOException
	 */
	public void initialize() throws IOException {
		this.uartObj.clear(3);

		this.setDaemon(true);
		this.start();

		this.isSmartConfig = false;
		this.reset();
	}
	
	/**
	 * 
	 * @param svrIP
	 * @param psk
	 */
	public void setParameters(String svrIP, byte [] psk) {
		this.dtlsPSK = psk;
		this.serverIP = svrIP;
	}

	/**
	 * 
	 * @param listener
	 */
	public void setEventListener(IDevEventListener listener) {
		this.eventListener = listener;
	}

	/**
	 * UART reading thread
	 */
	@Override
	public void run() {

		int lastData = 0;
		try {

			while (keeprunning) {
				Delay.msDelay(10);

				int val = input.read();
				if (val <= 0) {
					continue;
				}

				// head
				if (lastData == 0x41 && val == 0x47) {

					int flag1 = input.read();
					if (flag1 != 0x54) {
						lastData = flag1;
						continue;
					}

					int flag2 = input.read();
					if (flag2 != 0x59) {
						lastData = flag2;
						continue;
					}

					int respCode = input.read();
					int payloadLen = input.read();

					while (input.available() < payloadLen + 1) {
						Delay.msDelay(10);
						continue;
					}

					byte[] payload = new byte[payloadLen];
					input.read(payload);

					int checksum1 = lastData + val + flag1 + flag2 + respCode + payloadLen;
					int checksum2 = calCheckSum(checksum1, payload, 0, payload.length);

					int checksum = input.read();

					// checksum error
					if (checksum != checksum2) 
					{
						lastData = 0; 
						continue; 
					}

					System.out.println("RespCode " + respCode + " Payload " + Formatter.toHexString(payload));
					
					// Got a message
					lastData = 0;
					this.responseHandler(respCode, payload);

				} else {
					lastData = val;
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void responseHandler(int respCode, byte[] payload) throws IOException {

		if (this.eventListener == null)
			return;

		switch (respCode) {
		case 0x10: //the WIFI smart config can only be done after reset
			if(isSmartConfig)
				this.startSmartConfig();
			else
				startAgent();
			
			break;
		case 0x40:
			this.eventListener.onCloudDataArrive(payload);
			break;
		case 0x41: {
			int type = LittleBitConverter.ToInt32(payload, 0);
			int cookie = LittleBitConverter.ToInt32(payload, 4);
			int status = LittleBitConverter.ToInt32(payload, 8);

			this.eventListener.onReportCloudAck(type, cookie, status);
			break;
		}
		case 0x42:
			synchronized (this.ackCmd) {
				if (this.ackCmd.ackArrived(respCode, payload[0])) {
					this.ackCmd.setPayload(payload);
					this.ackCmd.notifyAll();
				}
			}
			break;
		case 0x20:
			wifiState = payload[0];
			this.eventListener.onWifiEvent(payload[0]);
			break;
		case 0x21:
			this.eventListener.onSmartConfigEvent(payload[0]);
			break;
		case 0x22:
			this.eventListener.onAgentStarted();
			break;
		default:
			break;

		}
	}

	/**
	 * Reset WIFI module
	 * @throws IOException
	 */
	public void reset() throws IOException {
		
		byte[] cmd = this.createCommand(0x80);

		this.uartObj.write(cmd, 0, cmd.length);
		
	}

	/**
	 * begin WIFI smart configuration 
	 * @throws IOException
	 */
	public void beginSmartConfiguration() throws IOException {
		this.isSmartConfig = true;
		reset();
	}
	
	/**
	 * Start WIFI smart configuration
	 * @throws IOException
	 */
	private void startSmartConfig() throws IOException {
		
		System.out.println("startSmartConfig");
		this.isSmartConfig = false;
		byte[] cmd = this.createCommand(0x81);

		this.uartObj.write(cmd, 0, cmd.length);
	}

	/**
	 * Stop WIFI smart configuration
	 * @throws IOException
	 */
	public void stopSmartConfig() throws IOException {
		byte[] cmd = this.createCommand(0x82);

		this.uartObj.write(cmd, 0, cmd.length);
		
		}

	/**
	 * Report sensor data for the OC platform
	 * @param cookie cookie for this report, will be used in onReportCloudAck  
	 * @param data sensor data
	 * @param off offset of data 
	 * @param len length
	 * @return result 
	 * @throws IOException
	 */
	public int reportData(int cookie, byte[] data, int off, int len) throws IOException {

		byte[] cmd = createReportCommand(0x83, cookie, data, off, len);

		byte [] resp = sendCommand(cmd, 0x42, 0);
		
		if(resp != null)
			return resp[0];
		
		return -128;		
	}

	/**
	 * start agent tiny which is used in the  
	 * @return 0: successfully -1:communication failure from wifi module  -6: report buff is full 
	 * @throws IOException
	 */
	private int startAgent() throws IOException {
		
		System.out.println("startAgent");

		
		byte[] buff = new byte[128];
		int pos = 0;

		System.arraycopy(dtlsPSK, 0, buff, 0, dtlsPSK.length);
		pos += dtlsPSK.length;

		byte[] name = this.endPointName.getBytes();

		System.arraycopy(name, 0, buff, pos, name.length);
		pos += name.length + 1; // pad 0

		byte[] ip = this.serverIP.getBytes();
		System.arraycopy(ip, 0, buff, pos, ip.length);
		pos += ip.length + 1; // pad 0

		byte[] cmd = createCommand(0x82, buff, 0, pos);

		this.uartObj.clear(3); //clear old data because restart
		byte [] resp = sendCommand(cmd, 0x42, 0);
		if(resp != null)
			return resp[0];
		
		return -1;
	}
	
	/**
	 * Send command to the device and wait for response
	 * @param cmd  command buff
	 * @param expResp expected response code
	 * @param expEvt expected response event, 0 to ignore the event
	 * @return response from module
	 * @throws IOException
	 */
	private byte[] sendCommand(byte[] cmd, int expResp, int expEvt) throws IOException {

		System.out.println(Formatter.toHexString(cmd));
		
		this.ackCmd.setCmd(expResp, expEvt);
		this.uartObj.write(cmd, 0, cmd.length);
		
		

		try {
			synchronized (this.ackCmd) {
				this.ackCmd.wait(3000);
				if (ackCmd.payload == null) {
					System.out.println("Time out");
				}

				this.ackCmd.reset();

				return ackCmd.payload;
			}
		} catch (InterruptedException ie) {

		}

		return null;

	}

	/**
	 * create command buff by the ins code without data 
	 * @param ins
	 * @return
	 */
	private byte[] createCommand(int ins) {
		return this.createCommand(ins, null, 0, 0);
	}

	/**
	 * create command buff by the ins code and data  
	 * @param ins instruction  
	 * @param data  data 
	 * @param off offset 
	 * @param len length 
	 * @return
	 */
	private byte[] createCommand(int ins, byte[] data, int off, int len) {

		int pos = 0;
		byte[] cmd = new byte[len + 7];
		cmd[pos++] = 0x41;
		cmd[pos++] = 0x47;
		cmd[pos++] = 0x54;
		cmd[pos++] = 0x59;

		cmd[pos++] = (byte) ins;
		cmd[pos++] = (byte) len;
		if (len > 0) {
			System.arraycopy(data, off, cmd, pos, len);
			pos += len;
		}

		cmd[pos] = (byte) calCheckSum(0, cmd, 0, pos);

		return cmd;

	}

	/**
	 * create
	 * @param ins 
	 * @param cookie
	 * @param data
	 * @param off
	 * @param len
	 * @return command buff
	 * @throws IOException
	 */
	private byte[] createReportCommand(int ins, int cookie, byte[] data, int off, int len) throws IOException {
		int pos = 0;
		byte[] cmd = new byte[len + 11];
		cmd[pos++] = 0x41;
		cmd[pos++] = 0x47;
		cmd[pos++] = 0x54;
		cmd[pos++] = 0x59;

		cmd[pos++] = (byte) ins;
		cmd[pos++] = (byte) (len + 4);

		System.arraycopy(LittleBitConverter.GetBytes(cookie), 0, cmd, pos, 4);
		pos += 4;

		if (len > 0) {
			System.arraycopy(data, off, cmd, pos, len);
			pos += len;
		}

		cmd[pos] = (byte) calCheckSum(0, cmd, 0, pos);

		return cmd;

	}

	/**
	 * Checksum calculation
	 * 
	 * @param initalValue
	 *            initialize value
	 * @param buf
	 * @param start
	 * @param len
	 * @return Checksum
	 */
	public static int calCheckSum(int initalValue, byte[] buf, int start, int len) {
		int sum = initalValue;
		int i = 0;

		for (i = start; i < start + len; i++) {
			sum += buf[i];
		}

		return (sum & 0x00FF);
	}

}
