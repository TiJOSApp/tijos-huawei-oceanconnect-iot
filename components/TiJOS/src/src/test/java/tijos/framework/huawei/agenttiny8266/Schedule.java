package tijos.framework.huawei.agenttiny8266;


import java.util.Arrays;
import java.util.Calendar;

public class Schedule {


	int onStartHour = -1;
	int onStartMin = -1;
	
	int offStartHour = -1;
	int offStartMin = -1;

	boolean enON = false;
	boolean enOFF = false;
	
	int [] dayOfWeeks = new int[7];
	
	int passDay = -1;
	
	public Schedule()	{
		
	}
	
	public Schedule(int onStartHour, int onStartMin, int offStartHour, int offStartMin) {
		this.onStartHour = onStartHour;
		this.onStartMin = onStartMin;
		
		this.offStartHour = offStartHour;
		this.offStartMin = offStartMin;
	}
	
	public void enableOnTime(boolean en) {
		this.enON = en;
	}
	
	public void enableOffTime(boolean en) {
		this.enOFF = en;
	}

	public void setOccurenceDayOfWeek(int day) {
		if(day >= dayOfWeeks.length)
			return ;
		
		this.dayOfWeeks[day] = 1;
	}

	public void reset() {
		for(int i = 0 ; i < this.dayOfWeeks.length; i ++) {
			this.dayOfWeeks[i] = 0;
		}
	}
	
	public int run() {
		
		if(!this.enOFF && !this.enON)
			return -1;
		
		if(onStartHour == -1 || offStartHour == -1)
			return -1;
		
		Calendar cal = Calendar.getInstance();
		int day = cal.get(Calendar.DAY_OF_WEEK);
		
		//passed
		if(passDay == day) {
			System.out.println("passed");
			return -1;
		}
		
		if(this.dayOfWeeks[day] == 0)
		{
			passDay = -1;
			return 0;
		}

		int curTotalMin = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE);
		int state = -1;

//		System.out.println(cal.toString() + " curTotalmin " + curTotalMin);

		if(this.enON) {
			int totalMin = this.onStartHour * 60 + this.onStartMin;

//			System.out.println("on Totalmin " + totalMin);
			
			if(curTotalMin >= totalMin)
				state = 1;
		}
		
		if(this.enOFF) {
			int totalMin = this.offStartHour * 60 + this.offStartMin;

//			System.out.println("off Totalmin " + totalMin);

			if(curTotalMin >= totalMin)
				state = 0;
		}
		
		if(state != -1)
			passDay = day;
		
		return state;
	}
	
	public String toString() {
		
		if(onStartHour == -1 || offStartHour == -1)
			return "not configured";
		
		return "on " + this.onStartHour + ":" + this.offStartMin  + " off " + this.offStartHour + ":" + this.offStartMin + " week " + 
			Arrays.toString(this.dayOfWeeks) + " enable on " + this.enON + " enable off " + this.enOFF;
	
	}
	
	
}
