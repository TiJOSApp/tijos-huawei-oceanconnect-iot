package tijos.framework.sensor.agenttiny8266;


/**
 * Ack command for waiting 
 * @author tijos
 *
 */
class WaitAckCmd {
	int resp;
	int code;
	
	byte[] payload;

	public WaitAckCmd(int resp, int code) {
		this.resp = resp;
		this.code = code;
	}

	public void setCmd(int resp, int code) {
		this.resp = resp;
		this.code = code;
		this.payload = null;
	}

	public boolean ackArrived(int resp, int code) {
		
		if(resp == this.resp) {
			if(this.code == 0 || this.code == code) //ignore code
				return true;
			
			return false;
		}
		
		return false;
	}

	public void setPayload(byte[] payload) {
		this.payload = payload;
	}

	public void reset() {
		this.resp = 0;
		this.code = 0;
	}
}