// TimeSheet.java
// Time sheet information
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License

class TimeSheet {
	
	// timesheet columns
	final static int COLUMN_FRAME = 0;
	final static int COLUMN_TIMECODE = 1;
	final static int COLUMN_KEY = 2;
	final static int COLUMN_MOUTH = 3;
	final static int COLUMN_COMMENTS = 4;
	
	
	// settings for timesheet
	int frameCount = 0;
	int framesPerSecond;
	int hourOffset;
	int minuteOffset;
	int secondOffset;
    int framesOffset;
	
	// timesheet data
	String mouth[] = null;
	String comment[] = null;
	boolean key[] = null;

    String pdfSize      = "Letter";
    String pdfLogo      = null;
    String pdfComp      = "Company name";
    String pdfLayout    = "";
    Boolean pdfTCode    = false;
    Integer pdfOffset   = 0;
	
	public TimeSheet( int frameCount, int framesPerSecond ) {
		this.init(frameCount, framesPerSecond);
	}
	
	// erase the timesheet
	public void init( int frameCount, int framesPerSecond ) {
		// save frame count
		this.frameCount = frameCount;
		
		// allocate space
		this.mouth = new String[frameCount];
		this.comment = new String[frameCount];
		this.key = new boolean[frameCount];

		// fill with blanks, and "-" for mouth
		for (int i = 0; i < this.frameCount; i++) {
			this.mouth[i] = new String("-");
			this.comment[i] = new String("");
			this.key[i] = false;
		}

		// reset values to defaults
		this.framesPerSecond = framesPerSecond;
		this.hourOffset = 0;
		this.minuteOffset = 0;
		this.secondOffset = 0;
        this.framesOffset =0;
	}

	
	public String calcTimeCode(int frame) {
		StringBuffer s = new StringBuffer("");

        // format hrs:min:sec:frames starting with 00:00:00:01
		// set number of frames
		int frames = frame;
        // secure offset is set (if it exists) by subtracting one frame-count
        if(hourOffset > 0 || minuteOffset > 0
                || secondOffset > 0 || framesOffset > 0)
            frames -= 1;
		// add offsets
		frames += (hourOffset * 3600 * framesPerSecond)
                + (minuteOffset * 60 * framesPerSecond)
                + (secondOffset * framesPerSecond) + framesOffset;
        // calculate number of seconds
        int seconds = frames / framesPerSecond;
        // calculate number of hours based on seconds
		int hours = seconds / 3600;
        // adjusting seconds
		seconds -= hours * 3600;
        // calculate number of minutes based on seconds
		int minutes = seconds / 60;
        // adjusting seconds
		seconds -= minutes * 60;
        // recalculate frames
		frames -= (hours * 3600 * framesPerSecond)
                + (minutes * 60 * framesPerSecond)
                + (seconds * framesPerSecond);

        // build the time
		if (hours < 10)
			s.append("0");
		s.append(hours);
		s.append(":");
		if (minutes < 10)
			s.append("0");
		s.append(minutes);
		s.append(":");
		if (seconds < 10)
			s.append("0");
		s.append(seconds);
		s.append(":");
		if (frames < 10)
			s.append("0");
		s.append(frames);

		// convert to string
		return JLipSync.padString(s.toString(), 12);
	}

	
}
