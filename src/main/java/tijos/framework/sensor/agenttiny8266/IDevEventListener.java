package tijos.framework.sensor.agenttiny8266;

public interface IDevEventListener {

	void onCloudDataArrive(byte [] payload);

	void onReportCloudAck(int type, int cookie,  int status);
	
	void onWifiEvent(int evt);
	
	void onSmartConfigEvent(int evt);
	
	void onAgentStarted();
}
