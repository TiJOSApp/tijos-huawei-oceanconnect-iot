

import java.io.IOException;

import tijos.framework.devicecenter.TiGPIO;
import tijos.framework.devicecenter.TiI2CMaster;
import tijos.framework.platform.peripheral.ITiKeyboardListener;
import tijos.framework.platform.peripheral.TiKeyboard;
import tijos.framework.sensor.button.ITiButtonEventListener;
import tijos.framework.sensor.button.TiButton;
import tijos.framework.sensor.dht.TiDHT;
import tijos.framework.transducer.led.TiLED;
import tijos.framework.transducer.oled.TiOLED_UG2864;
import tijos.framework.transducer.relay.TiRelay1CH;

public class TikitT800 {

	
	//GPIO Port ID 
	int gpioPort2 = 2;
	int gpioPort3 = 3;
	
	
	//Open GPIO port2 and it's pin 1,3
	TiGPIO gpio2 = TiGPIO.open(gpioPort2, 1, 3);
	
	//Open GPIO port3 and it's pin 6,7
	TiGPIO gpio3 = TiGPIO.open(gpioPort3, 6, 7);
	
	//Open I2C port 0 
	int i2cPort = 0;
	TiI2CMaster i2cm0 = TiI2CMaster.open(i2cPort);
	
	//Relay - GPIO port 2 - pin 1
	TiRelay1CH relay = new TiRelay1CH(gpio2, 1);
	
	//DHT temperature and humidity  - GPIO port 2 - pin 3
	TiDHT dht11 = new TiDHT(gpio2, 3);
	
	//LED - GPIO port 3 - pin 6
	TiLED led = new TiLED(gpio3, 6);
	
	//Button - GPIO 3 - pin 7 
	TiButton touch = new TiButton(gpio3, 7, true);
	
	//OLDE  - I2C port 0 with address 0x3C 
	TiOLED_UG2864 oled = new TiOLED_UG2864(i2cm0, 0x3c);
	
	long lastMeasureTime = 0; 
	
	double temperature = 0;
	double humidity = 0;
	
	/**
	 * Construction
	 * @throws IOException
	 */
	public TikitT800() throws IOException {
		
		
	}
	
	/**
	 * Output string to OLED 
	 * @param x  column 
	 * @param y  line
	 * @param msg 
	 * @throws IOException
	 */
	public void oledPrint(int x,int y, String msg) throws IOException{
		oled.print(y, x, msg);
	}
	
	/**
	 * Event listener for the touch button 
	 * @param listner
	 * @throws IOException
	 */
	public void setButtonEventListener(ITiButtonEventListener listner) throws IOException {
		touch.setEventListener(listner);
	}
	
	/**
	 * Event listener for the keyboard 
	 * @param listener
	 * @throws IOException
	 */
	public void setKeyboardEventListener(ITiKeyboardListener listener) throws IOException {
		TiKeyboard.getInstance().setEventListener(listener);
	}
	
	/**
	 * Initialization   
	 * @throws IOException
	 */
	public void initialize() throws IOException{
		oled.turnOn();
		oled.clear();
		
		oled.print(0, 0, "TiKit NBIOT Demo");
	}
	
	/**
	 * Relay switch operation 
	 * @param state 
	 * @throws IOException
	 */
	public void turnRelay(boolean state) throws IOException {
		if(state)
			this.relay.turnOn();
		else
			this.relay.turnOff();
	}
	
	/**
	 * LED switch operation 
	 * @param state
	 * @throws IOException
	 */
	public void turnLED(boolean state) throws IOException {
		if(state)
			this.led.turnOn();
		else
			this.led.turnOff();
	}
	
	/**
	 * DHT11 measurement 
	 * @throws IOException
	 */
	public void measure() throws IOException {
		//at least 3 seconds
		if(( System.currentTimeMillis() - lastMeasureTime) > 3000){
			lastMeasureTime =  System.currentTimeMillis();
			dht11.measure();
			
			temperature = dht11.getTemperature();
			humidity = dht11.getHumidity();
			
			oled.print(1, 0, "Temp:" + temperature + " C");
			oled.print(2, 0, "Humi:" + humidity + " RH");
		}
	}
	
	/**
	 * Get dht11 temperature - the measure output 
	 * @return
	 */
	public double getTemperature() {
		return this.temperature;
	}
	
	/**
	 * Get dht11 dumidity - the measure output
	 * @return
	 */
	public double getHumidity() {
		return this.humidity;
	}
	
}
