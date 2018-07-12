// WavePanel.java
// Load, display, and navigate PCM wave data
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License

import java.awt.Color;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.io.File;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.SourceDataLine;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTable;

public class WavePanel extends JPanel implements MouseListener,
		MouseMotionListener {

	// the timeSheetTable
	JTable timeSheetTable = null;
	FacePanel facePanel = null;
	
	// buffer holding the wave data
	byte[] bytes = null;

	int byteCount = 0;

	int maxAmplitude = 0;

	// audio format of the wave
	AudioFormat audioFormat = null;

	// number of frames
	int frameCount = 48;
	int framesPerSecond = 24;
	int bytesPerFrame = 1;

	// start and end of marker play settings
	int anchorStart = 0;

	int anchorEnd = 0;
	int markerStart = 0;
	int markerEnd = 0;
	boolean selecting = false;

	// start and end of display zoom settings
	int zoomStart = 1;

	int zoomEnd = frameCount;

	// sync with faces
	boolean playingWave = false;

	// allow stopping of wave playback
	boolean stopPlayingWave = false;
	
	// name of file
	String fileName = new String("");

	// output data line
	SourceDataLine sourceDataLine = null;

	public WavePanel() {
		// add a mouse listener
		addMouseListener(this);
	}

    @Override
	public void paintComponent(Graphics g) {

		super.paintComponent(g);

		// get size of drawable
		int height = getHeight();
		int width = getWidth();

		// clear the background
		g.setColor(Color.black);
		g.fillRect(0, 0, width, height);

		// no waveform?
		if (byteCount == 0) {
			return;
		}

		// number of frames visible
		int framesShown = (zoomEnd - zoomStart) + 1;

		// number of pixels per frame (both must be float to avoid truncation
		// error)
		float pixelsPerFrame = (float) width / (float) framesShown;

		// is an area selected?
		if (markerStart != 0) {
			// calculate the pixel positions
			int markerStartPixel = (int) ((markerStart - zoomStart) * pixelsPerFrame);
			int markerWidth = (int) (((markerEnd - markerStart) + 1) * pixelsPerFrame);
			
			// make sure the marker is visible
			if (markerWidth < 1) {
				markerWidth = 2;
			}

			// change the background for the selected portion of the wave
			g.setColor(Color.red);
			g.fillRect(markerStartPixel, 0, markerWidth, height);
		}

		// draw the waveform
		g.setColor(Color.cyan);

		// midpoint
		int mid = (int) Math.floor(height / 2);

		// scale amount
		double scaleFactor = (double) mid / (double) maxAmplitude;

		// calculate frames to display
		int zoomStartByte =  ((zoomStart - 1) * bytesPerFrame);
		int zoomEndByte = (zoomEnd * bytesPerFrame);
		float stepSize = ((float) (zoomEndByte - zoomStartByte)) / (float) width;

		// draw the wave
		for (int i = 0; i < width; i++) {

			// calculate the index
			int iIndex = (int) (i * stepSize) + zoomStartByte;

			// range check
			if (iIndex >= 0 && iIndex < byteCount) {

				// get the value
				int value = bytes[iIndex];

				// draw up or down?
				if (value < 0) {
					value = maxAmplitude - Math.abs(value);
					g.drawLine(i, mid, i, mid + value);
				} else {
					value = maxAmplitude - value;
					g.drawLine(i, mid, i, mid - value);
				}
			}
		}

		// draw the midline
		g.setColor(Color.gray);
		g.drawLine(0, mid, width, mid);

		// draw the lines marking the frames?
		if (pixelsPerFrame > 2) {
			// loop through each displayed frame
			for (int i = 0; i < framesShown; i++) {
				// calculate offset from start
				int x = (int) (i * pixelsPerFrame);
				// draw line
				g.drawLine(x, 0, x, height);
			}
		}
	}

	public String getPath(File file){
        return file.getPath();
    }
	
	// load a waveform from a file
	public void loadWave(File file) {

		// can the file be opened?
		if (!file.canRead()) {
			// complain
			int result = JOptionPane.showConfirmDialog(null,
					"Can't find the file '" + file.getName()
							+ "'\nDo you want to find it manually?",
					"Unable to find .wav file", JOptionPane.YES_NO_OPTION);

			if (result == JOptionPane.YES_OPTION) {					
				// open file dialog
				JFileChooser fc = Utilities.fileChooser(null);

				// limit to .wav files
				fc.addChoosableFileFilter(new WavFilter());
				// open the dialog
				int returnVal = Utilities.showOpenDialog(this,fc);
				if (returnVal == JFileChooser.APPROVE_OPTION) {
					file = fc.getSelectedFile();
				} else {
					// set the bytecount to zero
					byteCount = 0;
					// give up
					return;
				}
			}
		}
		
		// try to open the input stream
		AudioInputStream sourceAudioInputStream = null;
		try {
			sourceAudioInputStream = AudioSystem.getAudioInputStream( file );
		} catch (Exception e) {
			errMessage( "Error reading file '" + file.getName() + "'" );
			byteCount = 0;
			return;
		}
		
		// get the audio format
		AudioFormat sourceAudioFormat = sourceAudioInputStream.getFormat();
		// see if it can be converted to 8 bit, mono, unsigned, little-endian
		// audioFormat = new AudioFormat(sourceAudioFormat.getSampleRate(), 8, 1, false, false);
		audioFormat = new AudioFormat(
			AudioFormat.Encoding.PCM_UNSIGNED,
			sourceAudioFormat.getSampleRate(),
            8,
			1,
			sourceAudioFormat.getFrameSize(),
			sourceAudioFormat.getFrameRate(),
			false );			
/*
		// FIXME: this errors out, even when it should work.
		// is conversion of this type supported?
		if (!AudioSystem.isConversionSupported( audioFormat, sourceAudioFormat )) {
			errMessage( "Can't convert audio type: " + sourceAudioFormat.toString() );
			byteCount = 0;
			return;
		}
*/
		
		// can it be converted?
//        if (audioFormat.getSampleSizeInBits() != 11025){}
		AudioInputStream audioInputStream;
		try {
			audioInputStream = AudioSystem.getAudioInputStream(audioFormat, sourceAudioInputStream );
		} catch (Exception e) {
			errMessage( "Can't convert file to 8 bit mono audio" );
			byteCount = 0;
			return;
		}
		
		
		// calculate the number of bytes in the stream
		byteCount = (int)(audioInputStream.getFrameLength() * audioFormat.getFrameSize());
		// calcuate the metrics of the wave
		calculateMetrics();
        
		// allocate and load the array
		bytes = new byte[byteCount]; 
		try {
		    audioInputStream.read(bytes, 0, byteCount);
		} catch (Exception e) {
			errMessage( "Error reading the audio file" );
			byteCount = 0;
			return;
		}
		
		// find the maximum amplitude of the wave
		for (int i = 0; i < byteCount; i++) {
			// maximum value?
			if (bytes[i] > maxAmplitude) {
				maxAmplitude = bytes[i];
			} else if (-bytes[i] > maxAmplitude) {
				maxAmplitude = -bytes[i];
			}
		}

		// save the name
		fileName = file.getPath();

		// display the new wave
		repaint();
        
        // reset needed for sample-rate reasons
        sourceDataLine = null;

		// need to open a line?
		if (sourceDataLine == null) {

			// the data line
			DataLine.Info info = new DataLine.Info(SourceDataLine.class,
					audioFormat);
			try {
				// open the line
				sourceDataLine = (SourceDataLine) AudioSystem.getLine(info);
				sourceDataLine.open(audioFormat);

				// prepare the line for output
				sourceDataLine.start();

			} catch (Exception e) {
				errMessage("Unable to open audio device" + e);
				sourceDataLine = null;
			}
		} else {
			// is the line open?
			if (!(sourceDataLine.isOpen())) {
				errMessage("Data line is not open");
				sourceDataLine = null;
			}

		}

	}

	// calcuate metrics
	public void calculateMetrics() {

		// is a wave loaded?
		if (byteCount != 0) {
			// number of seconds is (frames / frames per second)
			float seconds = byteCount / audioFormat.getSampleRate();

			// number of displayed frames per second
			frameCount = (int) Math.floor(framesPerSecond * seconds);

			// number of audio bytes in each animation frame
			bytesPerFrame = (int) (byteCount / frameCount);
		}

		// display entire wave
		zoomAll();
	}

	// play the wave file
	public void playFrames(int startFrame, int endFrame) {

		// no start frame
		if (startFrame == 0) {
			startFrame = 1;
		}

		// no end frame or past end
		if (endFrame == 0 || endFrame > frameCount) {
			endFrame = frameCount;
		}

		// calculate start and end bytes
		int startByte = bytesPerFrame * (startFrame - 1);
		int endByte = bytesPerFrame * endFrame;

		// range check bytes
		if (startByte < 1) {
			startByte = 1;
		}
		if (endByte > byteCount) {
			endByte = byteCount;
		}

		// play the thread on a background thread
		try {
			new PlayThread(startByte, endByte).start();
		} catch (Exception e) {
			errMessage("Error playing the wave file: " + e);
		}
	}

	// play the sound on a background thread
	class PlayThread extends Thread {

		int startPosition, endPosition;

		public PlayThread(int startAtByte, int endAtByte) {
			startPosition = startAtByte;
			endPosition = endAtByte;
			stopPlayingWave = false;
		}

		public void run() {

			// make sure a waveform is loaded
			if (byteCount == 0) {
				return;
			}

			// make sure audio device connected
			if (sourceDataLine == null) {
				errMessage("Audio device failed. Try reloading file");
				return;
			}

			// is it open?
			if (!(sourceDataLine.isOpen())) {
				errMessage("Data line is not open");
				sourceDataLine = null;
			}

			// send out 16K at a time
			int bufferSize = (1024 * 16);

			// calculate buffer
			int startOfBuffer = startPosition;

			int counter = 0;
			while (!stopPlayingWave) {
				// check for buffer overflow
				int currentPosition = startOfBuffer + bufferSize;
				if ((startOfBuffer + bufferSize) >= endPosition) {
					bufferSize = (endPosition) - startOfBuffer;
				}

				// start the line
				try {
					sourceDataLine.start();
				} catch (Exception e) {
					// oops
					System.out.println("Unable to start the line");
				}

				System.out.println("Buffer size is " + bufferSize);
				// clear semaphore
				playingWave = true;

				int nBytesWritten = sourceDataLine.write(bytes, startOfBuffer,
						bufferSize);
				System.out.println("wrote " + nBytesWritten + " bytes");

				// give the face drawing code a chance to run
				try {
					sleep(1);
				} catch (Exception e) {
					// oops
					System.out.println("Exception triggered in sleep()");
				}

				// point to next starting point in the buffer
				startOfBuffer += bufferSize;
				if (startOfBuffer >= endPosition) {
					break;
				}

			}
			
			// play out the remainder of the line, but don't close it
			sourceDataLine.drain();
			sourceDataLine.stop();
			sourceDataLine.flush();

		}

	}

	// zoom in to fit the current selection
	void zoomToFit() {
		// zoom if markers are set
		if (markerStart != 0) {
			// set range
			zoomStart = markerStart;
			zoomEnd = markerEnd;

			// clear selection
			markerStart = 0;
			markerEnd = 0;

			// redraw the wave
			repaint();
		}
	}

	// zoom in to display the entire wave
	void zoomAll() {
		// set range
		zoomStart = 1;
		zoomEnd = frameCount;

		// clear selection
		markerStart = 0;
		markerEnd = 0;

		// redraw the wave
		repaint();
	}

	// zoom in (half)
	void zoomIn() {

		// already at full zoom?
		if (zoomStart != zoomEnd) {

			int wide = (int) ((zoomEnd - zoomStart) / 4);
			zoomStart += wide;
			zoomEnd -= wide;

			// range check
			if (zoomStart > zoomEnd) {
				int middle = wide;
				if (middle < 0) {
					middle = 1;
				} else if (middle > frameCount) {
					middle = frameCount;
				}
				zoomStart = middle;
				zoomEnd = middle;
			}
		}

		// clear selection
		markerStart = 0;
		markerEnd = 0;

		// update the wave
		repaint();
	}

	// zoom out (double)
	void zoomOut() {

		// amount to zoom out by
		int wide = (int) ((zoomEnd - zoomStart) / 2);

		// check for edge case
		if (wide == 0) {
			wide = 1;
		}

		// adjust left side
		zoomStart -= wide;
		if (zoomStart < 1) {
			zoomStart = 1;
		}

		// adjust right side
		zoomEnd += wide;
		if (zoomEnd > frameCount) {
			zoomEnd = frameCount;
		}

		// clear selection
		markerStart = 0;
		markerEnd = 0;

		// update the wave image
		repaint();
	}

	void ensureFrameVisible(int frameNumber) {
		// ensure that the current frame is visible

		// out of range?
		if (frameNumber < 1 || frameNumber >= this.frameCount) {
			return;
		}

		// already visible?
		if (frameNumber >= this.zoomStart && frameNumber <= this.zoomEnd) {
			return;
		}

		// determine the number of frames visible
		int framesShown = (zoomEnd - zoomStart) + 1;

		// calculate new display
		if (frameNumber < this.zoomStart) {
			// move backwards
			this.zoomStart = frameNumber;
			this.zoomEnd = this.zoomStart + framesShown - 1;
		} else {
			// move forwards
			this.zoomEnd = frameNumber;
			this.zoomStart = this.zoomEnd - framesShown + 1;
		}

		// select current frame
		this.markerStart = frameNumber;
		this.markerEnd = frameNumber;

		// update the wave image
		this.repaint();

	}

	int mouseOnFrame(int x) {

		// get the width of the wave panel
		int width = getWidth();

		// clip x to the panel
		if (x < 0) {
			x = 0;
		} else if (x > width) {
			x = width;
		}

		// get number of displayed frames
		int framesShown = (zoomEnd - zoomStart) + 1;

		// get the width of a displayed frame
		float pixelsPerFrame = (float) width / (float) framesShown;

		// how many frames into the panel?
		int frame = zoomStart + (int) Math.floor(x / pixelsPerFrame);
		
		// clip to range
		if (frame > zoomEnd ) {
			frame = zoomEnd;
		}
		
		return frame;
		
	}

	public void mousePressed(MouseEvent e) {
		// left button?
		if (e.getButton() == MouseEvent.BUTTON1) {
			// selection?
			if (e.isShiftDown() || e.isControlDown() ) {
				this.selecting = true;
			} else {
				this.selecting = false;
			}
			
			// set start anchor
			anchorStart = mouseOnFrame(e.getX());
			anchorEnd = anchorStart;

			// for now, just set marker
			markerStart = anchorStart;
			markerEnd = anchorStart;

			// update frame
			repaint();

			// add a listener for mouse motion
			addMouseMotionListener(this);
									
			// select row in timesheet?
			if (timeSheetTable != null) {
				timeSheetTable.changeSelection( anchorStart-1, TimeSheet.COLUMN_MOUTH, true, false );
			}
			
			// play the frame
			this.stopPlayingWave = true;
			this.playFrames(markerStart, markerStart);			

		}
	}

	public void mouseDragged(MouseEvent e) {
		int frame = mouseOnFrame(e.getX());
		
		//new position?
		if (frame != anchorEnd) {
			
			// save frame
			anchorEnd = frame;

			// what order to display?
			if (anchorEnd > anchorStart) {
				markerStart = anchorStart;
				markerEnd = anchorEnd;
			} else {
				// swap order
				markerStart = anchorEnd;
				markerEnd = anchorStart;
			}

			// was shift/ctrl pressed in the middle of a drag?
			if ( !this.selecting && (e.isShiftDown() || e.isControlDown() ) ) {
				// start anchor at this point
				markerStart = frame;
				markerEnd = frame;
				anchorStart = frame;
				anchorEnd = frame;
				this.selecting = true;
			}

			// was shift/ctrl released in the middle of a drag?
			if ( this.selecting && !(e.isShiftDown() || e.isControlDown() ) ) {
				// clear flag
				this.selecting = false;
			}

			
			// play the frame
			this.stopPlayingWave = true;
			this.playFrames(frame, frame);
			
			
			// select row in timesheet?
			if (timeSheetTable != null) {
				// selecting mode?
				if (selecting) {
					// get the face from the time sheet
					String face = (String)timeSheetTable.getValueAt(frame-1,TimeSheet.COLUMN_MOUTH);
					// make it the current face?
					if (face.length() > 0) {
						facePanel.setFace( face );
					}
				} else {
					// select a new row in the timesheet as well
					timeSheetTable.changeSelection( frame-1, TimeSheet.COLUMN_MOUTH, true, false );					
				}
					
			}
			
			// update
			repaint();

		}
	}

	public void mouseReleased(MouseEvent e) {
		// stop listening for move events
		removeMouseMotionListener(this);
	}

	// mouse events to ignore
	public void mouseClicked(MouseEvent e) {
	}

	public void mouseMoved(MouseEvent e) {
	}

	public void mouseEntered(MouseEvent e) {
	}

	public void mouseExited(MouseEvent e) {
	}

	public void errMessage(String s) {
		JOptionPane.showMessageDialog(null, s, "Error",
				JOptionPane.ERROR_MESSAGE);
	}
	
}