// JLipSync.java
// clone of Magpie lipsync program
// (c) 2004 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Graphics;
import java.awt.GraphicsConfiguration;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.HeadlessException;
import java.awt.Image;
import java.awt.Toolkit;
import java.awt.Transparency;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.PixelGrabber;
import java.io.File;
import java.io.FileWriter;

import javax.swing.BorderFactory;
import javax.swing.ButtonGroup;
import javax.swing.Icon;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButtonMenuItem;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JToolBar;
import javax.swing.KeyStroke;
import javax.swing.ListCellRenderer;
import javax.swing.ListSelectionModel;
import javax.swing.UIManager;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import javax.swing.table.TableColumn;

public class JLipSync extends JFrame implements ActionListener, ItemListener,
		ListSelectionListener {

	final static String JLIPSYNC_VERSION = "built Saturday, January 10, 2009";
	
	// file export formats
	final static int FORMAT_MAGPIE = 0;
	final static int FORMAT_MOHO = 1;
	final static int FORMAT_GAMESTUDIO = 2;
	final static int FORMAT_CSV = 3;
    final static int FORMAT_PDF = 4;


	// list of phonemes
	JList phonemeList;

	// buttons
	 JButton fileOpenButton, fileSaveButton, copyButton, zoomToFitButton,
			zoomAllButton, zoomInButton, zoomOutButton, playAllButton,
			playSelectionButton, playFromButton, playToButton;

	// frames per second
	JRadioButtonMenuItem fps24, fps25, fps30;
    // frames per second
	JRadioButtonMenuItem letter, a4;

	// panel for drawing the wave on
	WavePanel wavePanel;

	// panel for displaying the faces
	FacePanel facePanel;

	// timesheet holding timing data
	TimeSheet timeSheet = null;
	
	// timesheet table for displaying timesheet
	JTable timeSheetTable = null;

	// currently open file
	File openFile = null;

	// track offset
	int trackOffset = 0;

	JLabel statusBar;

	public JLipSync() {

		// set the name
		super("JLipSync 0.9 ");

		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

		// create the menu bar
		setJMenuBar(createMenuBar());

		// create the window content
		setContentPane(createContentPanel());
		
		//Display the window.
		setSize(Toolkit.getDefaultToolkit().getScreenSize());
		setVisible(true);
        
	}

	// play the wave and faces in sync
	public void playFrames(int startFrame, int endFrame) {

		// calculate start and end bytes
//		int startByte = wavePanel.bytesPerFrame * (startFrame - 1);
		int endByte = wavePanel.bytesPerFrame * endFrame;

		// no start frame
		if (startFrame == 0) {
			startFrame = 1;
		}

		// no end frame
		if (endFrame == 0) {
			endFrame = wavePanel.frameCount;
		}

		// range check
		if (endByte > wavePanel.byteCount) {
			endByte = wavePanel.byteCount;
		}

		// play the thread on a background thread
		try {

			// set semaphor
			wavePanel.playingWave = false;

			// this runs a thread for the wave
			wavePanel.playFrames(startFrame, endFrame);

			// create a thread for the animation
			new PlayFaces(startFrame, endFrame).start();

		} catch (Exception e) {
			Utilities.errMessage("Error playing the wave file. " + e);
		}
	}

	// play the sound on a background thread
	class PlayFaces extends Thread {

		int startIndex, endIndex;

		public PlayFaces(int startAtIndex, int endAtIndex) {

			startIndex = startAtIndex;
			endIndex = endAtIndex;
		}

        @Override
		public void run() {
			try {
				// wait for wave to start playing
				double startWait = System.currentTimeMillis();
				while (!wavePanel.playingWave) {
					// give the multitasker a chance to run something else
					sleep(1);

					// timed out?
					if (System.currentTimeMillis() - startWait > 8000) {
						break;
					}
				}
				// calculate wait time between frames
				double startTime = System.currentTimeMillis();
				double sleepTime = 1000 / wavePanel.framesPerSecond;
				// time next frame is to appear
				double nextFrame = startTime;
				// extend play time for negative track offsets
				if (trackOffset < 0) {
					endIndex -= trackOffset;
				}

				// display the frames
				for (int i = startIndex; i <= endIndex; i++) {
					int frameIndex = trackOffset + i - 1;

					// in range?
					if (frameIndex > -1 && frameIndex < wavePanel.frameCount) {

						// get the mouth
						String useMouth = timeSheet.mouth[frameIndex];

						// set the mouth
						facePanel.setFace(useMouth);

						// wait for next frame
						nextFrame += sleepTime;
						while (System.currentTimeMillis() <= nextFrame) {
							// sleep a bit
							sleep(10);
						}
					}
				}
			} catch (Exception e) {
				// oops.
			}
		}
	}

	// erase the timesheet
	public void eraseTimeSheet() {
		// clear the time sheet
		timeSheet.init(wavePanel.frameCount, wavePanel.framesPerSecond);
		
		// clear the track offset
		trackOffset = 0;

	}

	// set the timesheet to a new framerate
	public void rescaleTimeSheet(int newFramesPerSecond) {

		// save the old values
		int oldFrameCount = wavePanel.frameCount;

		// create a copy of the timesheet.
		String priorMouth[] = new String[oldFrameCount];
		String priorComment[] = new String[oldFrameCount];
		boolean priorKey[] = new boolean[oldFrameCount];
		for (int i = 0; i < oldFrameCount; i++) {
			priorMouth[i] = timeSheet.mouth[i];
			priorComment[i] = timeSheet.comment[i];
			priorKey[i] = timeSheet.key[i];
		}

		// set the new values
		wavePanel.framesPerSecond = newFramesPerSecond;
		wavePanel.calculateMetrics();
		eraseTimeSheet();

		// map between the two
		float delta = (float) wavePanel.frameCount / (float) oldFrameCount;

		// walk through the old timesheet
		for (int i = 0; i < oldFrameCount; i++) {
			// determine target
			int target = (int) (i * delta);
			if (target > wavePanel.frameCount) {
				target = wavePanel.frameCount - 1;
			}

			// copy the mouth shape, comment and keyframe flag
			timeSheet.mouth[target] = priorMouth[i];
			timeSheet.comment[target] = priorComment[i];
			timeSheet.key[target] = priorKey[i];
		}

		// repaint the table
		timeSheetTable.repaint();
	}

	// load a wave file
	public void loadWave(File file) {
		wavePanel.loadWave(file);
		eraseTimeSheet();
	}

	// load a timesheet (along with the wave)
	void loadTimeSheet(File file) {

		try {

			SimpleXmlReader xml = new SimpleXmlReader(file);

			// xml header
			String theHeader = xml.getTag("");
			if (!theHeader.substring(0, 6).equals("<?xml ")) {
				throw new Exception("Not an XML file");
			}

			// header
			xml.getTag("<jlipsync>");

			// version number
			String version = xml.getString("version");
            this.setTitle("JLipSync " + version + "  -  " + file.getName());

			// get the wave file name
			String waveFileName = xml.getString("wavefile");

			// get fps
			wavePanel.framesPerSecond = (int) xml.getFloat("fps");
			timeSheet.framesPerSecond = wavePanel.framesPerSecond;
			if (wavePanel.framesPerSecond == 24) {
				fps24.setSelected(true);
			} else if (wavePanel.framesPerSecond == 25) {
				fps25.setSelected(true);
			} else if (wavePanel.framesPerSecond == 30) {
				fps30.setSelected(true);
			}

			// try loading the wave file
			File waveFile;
			try {
				// open the file
				waveFile = new File(waveFileName);
			} catch (Exception ex) {
				// failed
				throw new Exception("Can't find file " + waveFileName);
			}

			if (waveFile != null) {
				loadWave(waveFile);
			}

			// get framecount
			wavePanel.frameCount = (int) xml.getFloat("framecount");

			// create a new timesheet
			timeSheet.init(wavePanel.frameCount, wavePanel.framesPerSecond);

			// offsets (new to 1.1)
			if (xml.getCurrentTag().equals("<offset>")) {
				xml.getTag("<offset>");
				trackOffset = xml.getInt("track");
				timeSheet.hourOffset = xml.getInt("hour");
				timeSheet.minuteOffset = xml.getInt("minute");
				timeSheet.secondOffset = xml.getInt("second");
                // to ensure backwards compatibility
                if (! xml.getCurrentTag().equals("</offset>"))
                        timeSheet.framesOffset = xml.getInt("frm");
		        xml.getTag("</offset>");
			} else {
				// set to zero
				trackOffset = 0;
				timeSheet.hourOffset = 0;
				timeSheet.minuteOffset = 0;
				timeSheet.secondOffset = 0;
                timeSheet.framesOffset = 0;
			}

            // set the column widths
			int widths[] = { 10, 220, 20, 40, 100 };
			for (int i = 0; i < 1; i++) {
				TableColumn column = timeSheetTable.getColumnModel().getColumn(i);
				column.setWidth(widths[i]);
			}
			
			// read the frames
			xml.getTag("<frames>");
			for (int i = 0; i < wavePanel.frameCount; i++) {
				// start of frame
				xml.getTag("<frame>");

				// mouth is optional
				timeSheet.mouth[i] = xml.getOptionalString("mouth");

				// key is optional
				timeSheet.key[i] = xml.getOptionalString("key").equals("true");

				// comment is optional
				timeSheet.comment[i] = xml.getOptionalString("comment");

				// required end tag
				xml.getTag("</frame>");
			}

			xml.getTag("</frames>");

            if (xml.getCurrentTag().equals("<pdf>")){
            xml.getTag("<pdf>");
/*            timeSheet.pdfSize = xml.getOptionalString("pdfSize");
            timeSheet.pdfLayout = xml.getOptionalString("pdfLayout"); */
            timeSheet.pdfLogo = xml.getOptionalString("pdfLogo");
/*            timeSheet.pdfComp = xml.getOptionalString("pdfComp");
            timeSheet.pdfLayout = xml.getOptionalString("pdfLayout");
            if (xml.getOptionalString("pdfTCode").equals("false"))
                timeSheet.pdfTCode = false; else timeSheet.pdfTCode = true; */
            xml.getTag("</pdf>");
            }

			xml.getTag("</jlipsync>");

		} catch (Exception e) {

			// display an error
			Utilities.errMessage("Error reading file: " + e);

			// clear the timesheet
			wavePanel.frameCount = 20;
			wavePanel.framesPerSecond = 24;
			eraseTimeSheet();
		}
        // remove "Closed" and replace with "-"
		for (int i = 0; i < wavePanel.frameCount; i++) {
            String s =timeSheet.mouth[i];
            if (s.equalsIgnoreCase("Closed") || s.isEmpty())
                timeSheet.mouth[i] = "-";
        }
		// update the display
		wavePanel.repaint();
		timeSheetTable.repaint();

	}

	// write the file to disk
	void writeXML(File file) {

		FileWriter stream;

		try {
			stream = new FileWriter(file);
		} catch (Exception e) {
			Utilities.errMessage("Error writing file " + e);
			return;
		}

		// write the file
		try {
			// xml header
			stream.write("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n");

			// header
			stream.write("<jlipsync>\n");
			stream.write("\t<version>0.9</version>\n");
			stream.write("\t<wavefile>" + wavePanel.fileName + "</wavefile>\n");
			stream.write("\t<fps>" + wavePanel.framesPerSecond + "</fps>\n");
			stream.write("\t<framecount>" + wavePanel.frameCount
					+ "</framecount>\n");

			// offsets (new to 1.1)
			stream.write("\t<offset>\n");
			stream.write("\t\t<track>" + trackOffset + "</track>\n");
			stream.write("\t\t<hour>" + timeSheet.hourOffset + "</hour>\n");
			stream.write("\t\t<minute>" + timeSheet.minuteOffset + "</minute>\n");
			stream.write("\t\t<second>" + timeSheet.secondOffset + "</second>\n");
			stream.write("\t\t<frm>" + timeSheet.framesOffset + "</frm>\n");
			stream.write("\t</offset>\n");

			// the frames
			stream.write("\t<frames>\n");
			for (int i = 0; i < wavePanel.frameCount; i++) {

				// frame number
				stream.write("\t\t<frame>");

				// optional mouth
				if (timeSheet.mouth[i].length() > 0) {
					stream.write("<mouth>" + timeSheet.mouth[i] + "</mouth>");
				}

				// optional key
				if (timeSheet.key[i]) {
					stream.write("<key>true</key>");
				}

				// optional comment
				if (timeSheet.comment[i].length() > 0) {
					stream.write("<comment>" + timeSheet.comment[i]
							+ "</comment>");
				}
				stream.write("</frame>\n");
			}
			stream.write("\t</frames>\n");
            // PDF settings
            stream.write("\t<pdf>\n");
            // Page Size: A4 or LETTER
/*            stream.write("\t<pdfSize>"      + "LETTER" + "</pdfSize>\n");
            // Logo pict 60 x 40 points */
            stream.write("\t<pdfLogo>"      + "" + "</pdfLogo>\n");
/*            // Company name - maximum 40 chars
            stream.write("\t<pdfComp>"      + "" + "</pdfComp>\n");
            // Layout:  50 frm per page, no bold lines
            //          48 frm per page, every eight bold
            stream.write("\t<pdfLayout>"    + "normal" + "</pdfLayout>\n");
            // Offset: 8 or 16 frames down the x-sheet
            stream.write("\t<pdfOffset>"    + "0" + "</pdfOffset>\n");
            // Show timecode?
            stream.write("\t<pdfTCode>"     + "false" + "</pdfTCode>\n");
*/
			stream.write("\t</pdf>\n");

            //End tag
			stream.write("</jlipsync>");
			stream.close();

		} catch (Exception e) {
			Utilities.errMessage("Error writing file:" + e);
			return;
		}

		// make this the current file
		openFile = file;
	}

	// if returns false, user cancelled autosave action
	public boolean cancelledAutoSave() {
		// no work to save?
		if (openFile == null) {
			return false;
		}

		// ask user if they want to save their current work
		int result = JOptionPane.showConfirmDialog(null,
				"Save Current File First?", "Save File?",
				JOptionPane.YES_NO_CANCEL_OPTION);
		if (result == JOptionPane.CANCEL_OPTION) {
			// cancelled
			return true;

		} else if (result == JOptionPane.NO_OPTION) {
			// didn't save, but didn't cancel
			return false;
		}

		// make sure it ends with the proper extention
		String fileName = openFile.getPath();
		fileName = addFileExtention(fileName, ".jls");

		// write the timesheet out
		writeXML(new File(fileName));

		return false;

	}

	// Menu actions
	public void fileOpen() {

		// autosave?
		if (cancelledAutoSave()) {
			return;
		}

		// look for default directory
		String dirName = Utilities.getPreference("defaultDirectory");

		// open file dialog
		JFileChooser fc = Utilities.fileChooser(null);
		fc.addChoosableFileFilter(new WavFilter());
		fc.addChoosableFileFilter(new JlsFilter());
		int returnVal = Utilities.showOpenDialog(this, fc);
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			// get the file name
			openFile = fc.getSelectedFile();
			String fileName = openFile.getName();

			// end with ".jls" ?
			fileName = fileName.toLowerCase();
			if (fileName.endsWith(".jls")) {
				// pass the file and the path to load the timesheet
				loadTimeSheet(openFile);
			} else {
				// assume a wave file of some sort
				loadWave(openFile);
			}
//            this.setTitle("JLipSync - " + fileName);
		}
	}

	// ensure file name ends with given extention
	public String addFileExtention(String fileName, String extention) {

		String lowerFileName = fileName.toLowerCase();
		if (!(lowerFileName.endsWith(extention))) {
			return fileName + extention;
		}
		return fileName;

 }

	public void fileSave() {
		if (this.openFile == null) {
			// use save as instead
			fileSaveAs();
		} else {
			// make sure it ends with the proper extention
			String fileName = openFile.getPath();
			fileName = addFileExtention(fileName, ".jls");

			// write the timesheet out
			writeXML(new File(fileName));
		}
	}

	public void fileSaveAs() {
		JFileChooser fc = Utilities.fileChooser(openFile);
		fc.addChoosableFileFilter(new JlsFilter());
		int returnVal = Utilities.showSaveDialog(this, fc);
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			// get the selected file
			File file = fc.getSelectedFile();

			// make sure it ends with the proper extention
			String fileName = file.getPath();
			fileName = addFileExtention(fileName, ".jls");

			// write the timesheet out
			writeXML(new File(fileName));
		}
	}

    // the String pdf is either Letter or A4
    public void fileSaveAsPdf(String pdf) {
		JFileChooser fc = Utilities.fileChooser(openFile);
//		fc.addChoosableFileFilter(new JlsFilter());
		int returnVal = Utilities.showSaveDialog(this, fc);
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			// get the selected file
			File file = fc.getSelectedFile();
            JPdfWriter jpdf = new JPdfWriter();
            jpdf.JPdf(timeSheet, pdf, wavePanel.getPath(file));
		}
	}


	public static String padString(String s, int padSize) {
		String padded = new String(s
				+ "                                              ");
		return padded.substring(0, padSize - 1);
	}


	public String magpieFormat() {
		StringBuffer s = new StringBuffer(
				"Frame   Timecode   Key   Mouth name    Comments\n");


		for (int i = 0; i < wavePanel.frameCount; i++) {

			// leading spaces
			s.append("  ");

			// the frame number
			int theFrame = i + 1;
			if (theFrame < 100)
				s.append(" ");
			if (theFrame < 10)
				s.append(" ");
			s.append(theFrame);
			s.append("  ");

			// caculate timecode
			s.append(timeSheet.calcTimeCode(i + 1));

			// key?
			if (timeSheet.key[i]) {
				s.append("   X   ");
			} else {
				s.append("       ");
			}

			// 15 characters for the mouth shape
			s.append(padString(timeSheet.mouth[i], 15));

			// optional comment
			s.append(timeSheet.comment[i]);
			s.append("\n");
		}

		// convert to a string
		return s.toString();
	}

	public String csvFormat() {
		StringBuffer s = new StringBuffer(
				"Frame,Timecode,Key,Mouth name,Comments\n");

        for (int i = 0; i < wavePanel.frameCount; i++) {
			// the frame number
			int theFrame = i + 1;
			s.append(theFrame);
			s.append(",");

			// caculate timecode
			s.append(timeSheet.calcTimeCode(i + 1));
            s.append(",");

			// key?   X if YES
			if (timeSheet.key[i]) {
				s.append("X,");
			} else {
				s.append(",");
			}

			// 15 characters for the mouth shape
			s.append(padString(timeSheet.mouth[i], 15));
            s.append(",");

			// optional comment
			s.append(timeSheet.comment[i]);
			s.append("\n");
		}

		// convert to a string
		return s.toString();
	}

    public String pdfFormat(TimeSheet t) {
        String s = "t.txt";
        return s;
    }

	public String mohoFormat() {
		StringBuffer s = new StringBuffer("MohoSwitch1\n");

		for (int i = 0; i < wavePanel.frameCount; i++) {
			String mouthShape = timeSheet.mouth[i];
			if (mouthShape.length() > 0) {
				s.append((i + 1) + " " + mouthShape + "\n");
			}
		}

		// convert to a string
		return s.toString();
	}

	public String gameStudioFormat() {
		StringBuffer s = new StringBuffer();

		// frame count and frames per second
		s.append(wavePanel.frameCount + " " + wavePanel.framesPerSecond + "\n");

		// initialize timing
		int hour = timeSheet.hourOffset;
		int minute = timeSheet.minuteOffset;
		int second = timeSheet.secondOffset;
		int tick = 0;

		for (int i = 0; i < wavePanel.frameCount; i++) {
			// tick
			tick++;
			if (tick > wavePanel.framesPerSecond) {
				tick = 1;
				second++;
				if (second > 59) {
					second = 0;
					minute++;
					if (minute > 59) {
						minute = 0;
						hour++;
					}
				}
			}

			// add frame number
			s.append((i + 1) + " ");

			// add timecode
			s.append(hour + " " + minute + " " + second + " ");

			// key?
			if (timeSheet.key[i]) {
				// true
				s.append("1 ");
			} else {
				// false
				s.append("0 ");
			}

			// mouth shape
			String mouth = timeSheet.mouth[i];
			if (mouth.length() == 0) {
				s.append("none, ");
			} else {
				s.append(mouth + ", ");
			}

		}

		// convert to a string
		return s.toString();
	}

	public void exportFile(int fileType) {
		JFileChooser fc = Utilities.fileChooser(null);
		int returnVal = Utilities.showSaveDialog(this, fc);
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			// get the selected file
            File file = fc.getSelectedFile();

			// make sure it ends with the proper extention
            String exte = "";
            if (fileType == 3) exte = ".csv"; else exte = ".txt";

            FileWriter stream;

			try {
				stream = new FileWriter(file + exte);
			} catch (Exception e) {
				Utilities.errMessage("Error writing file " + e);
				return;
			}

			// create file contents
			String contents = new String();

			try {
				// create the contents
				switch (fileType) {
				case FORMAT_MAGPIE:
					contents = magpieFormat();
					break;
				case FORMAT_MOHO:
					contents = mohoFormat();
                	break;
				case FORMAT_GAMESTUDIO:
					contents = gameStudioFormat();
					break;
				case FORMAT_CSV:
					contents = csvFormat();
            		break;
				}

				// write the contents
				stream.write(contents);

				stream.close();

			} catch (Exception e) {
				Utilities.errMessage("Error writing file:" + e);
				return;
			}
		}
	}

	public void copyToClipboard() {
		// create a clipboard
		Clipboard clipboard = clipboard = Toolkit.getDefaultToolkit()
				.getSystemClipboard();

		// create the contents
		StringSelection contents = new StringSelection(magpieFormat());

		// copy to clipboard
		clipboard.setContents(contents, null);
	}

	// This method returns true if the specified image has transparent pixels
	public static boolean hasAlpha(Image image) {
		// If buffered image, the color model is readily available
		if (image instanceof BufferedImage) {
			BufferedImage bimage = (BufferedImage) image;
			return bimage.getColorModel().hasAlpha();
		}

		// Use a pixel grabber to retrieve the image's color model;
		// grabbing a single pixel is usually sufficient
		PixelGrabber pg = new PixelGrabber(image, 0, 0, 1, 1, false);
		try {
			pg.grabPixels();
		} catch (InterruptedException e) {
			// nothing to do
		}

		// Get the image's color model
		ColorModel cm = pg.getColorModel();
		return cm.hasAlpha();
	}

	// This method returns a buffered image with the contents of an image
	public static BufferedImage toBufferedImage(Image image) {
		if (image instanceof BufferedImage) {
			return (BufferedImage) image;
		}

		// This code ensures that all the pixels in the image are loaded
		image = new ImageIcon(image).getImage();

		// Determine if the image has transparent pixels; for this method's
		// implementation, see e665 Determining If an Image Has Transparent
		// Pixels
		boolean hasAlpha = hasAlpha(image);

		// Create a buffered image with a format that's compatible with the
		// screen
		BufferedImage bimage = null;
		GraphicsEnvironment ge = GraphicsEnvironment
				.getLocalGraphicsEnvironment();
		try {
			// Determine the type of transparency of the new buffered image
			int transparency = Transparency.OPAQUE;
			if (hasAlpha) {
				transparency = Transparency.BITMASK;
			}

			// Create the buffered image
			GraphicsDevice gs = ge.getDefaultScreenDevice();
			GraphicsConfiguration gc = gs.getDefaultConfiguration();
			bimage = gc.createCompatibleImage(image.getWidth(null), image
					.getHeight(null), transparency);

		} catch (HeadlessException e) {
			// The system does not have a screen
		}

		if (bimage == null) {
			// Create a buffered image using the default color model
			int type = BufferedImage.TYPE_INT_RGB;
			if (hasAlpha) {
				type = BufferedImage.TYPE_INT_ARGB;
			}
			bimage = new BufferedImage(image.getWidth(null), image
					.getHeight(null), type);
		}

		// Copy image to buffered image
		Graphics g = bimage.createGraphics();

		// Paint the image onto the buffered image
		g.drawImage(image, 0, 0, null);
		g.dispose();

		return bimage;
	}

	// write out an AviFile
	public void writeAviFile() {

		// no wave selected?
		if (wavePanel == null || wavePanel.fileName.equals("")) {
			Utilities.errMessage("Audio file must be selected first.");
			return;
		}

		// Show save file dialog
		JFileChooser fc = Utilities.fileChooser(null);
		fc.addChoosableFileFilter(new AviFilter());
		int returnVal = Utilities.showSaveDialog(this, fc);
		if (returnVal == JFileChooser.APPROVE_OPTION) {

			// get the selected file
			File file = fc.getSelectedFile();

			// need to add an extention?
			String fileName = file.getPath();
			fileName = addFileExtention(fileName, ".avi");
			new CreateAviFile(fileName).start();
		}
	}

	// create an AVI file on a background thread
	class CreateAviFile extends Thread {

		String fileName;

		public CreateAviFile(String theFileName) {
			// save the name of the file
			fileName = theFileName;
		}

		public void run() {

			// for now, dummy code
			AviWriter theWriter;

			// get the default icon
			String priorFace = "<none>";
			ImageIcon icon = facePanel.getFace(priorFace);

			// make it a BufferedImages
			BufferedImage bufferedImage = toBufferedImage(icon.getImage());

			// values for the avi file
			int frames = wavePanel.frameCount;
			int fps = wavePanel.framesPerSecond;
			int height = 116; // must be divisible by 4
			int width = 126; // must be an even number

			// write the frames to the file
			try {
				// create the AviWriter
				theWriter = new AviWriter(fileName, wavePanel.fileName, height,
						width, frames, fps);

				// write out the required number of frames
				for (int i = 0; i < frames; i++) {
					statusBar.setText("Frame #" + (i + 1));

					// get the next mouth
					String useFace = timeSheet.mouth[i];

					// update frame if different
					if (!useFace.equals(priorFace) && !useFace.equals("")) {

						// get the icon
						ImageIcon nextIcon = facePanel.getFace(useFace);
						if (nextIcon != null) {

							// make it a BufferedImages
							bufferedImage = toBufferedImage(nextIcon.getImage());

							// copy the pixels into the frame
							for (int x = 0; x < icon.getIconWidth(); x++) {
								for (int y = 0; y < icon.getIconHeight(); y++) {
									int rgb = bufferedImage.getRGB(x, y);
									int r = (0xff & (rgb >> 16));
									int g = (0xff & (rgb >> 8));
									int b = (0xff & rgb);
									theWriter.setPixel(x, y, r, g, b);
								}
							}
						}
					}

					// add the frame to the file
					theWriter.addFrame();
				}

				// close the file
				statusBar.setText("Writing the AVI file...");
				theWriter.close();

				// success
				statusBar.setText("Created AVI file");

			} catch (Exception e1) {
				Utilities.errMessage("Error creating .AVI file: " + e1);
			}
		}
	}

	public JMenuBar createMenuBar() {
		JMenuBar menuBar;
		JMenu menu, subMenu;
		JMenuItem menuItem, subMenuItem;
		JRadioButtonMenuItem rbMenuItem;
		JCheckBoxMenuItem cbMenuItem;

		//Create the menu bar.
		menuBar = new JMenuBar();

		// file menu
		menu = new JMenu("File");
		menu.setMnemonic(KeyEvent.VK_F);
		menu.getAccessibleContext().setAccessibleDescription(
				"Open and Save options");
		menuBar.add(menu);

		//file : new
		menuItem = new JMenuItem("New...", KeyEvent.VK_O);
		menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_N,
				ActionEvent.ALT_MASK));
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Create a new timesheet");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {

				// save current work?
				if (cancelledAutoSave()) {
					return;
				}

				// erase time sheet
				eraseTimeSheet();
			}
		});

		//file : open
		menuItem = new JMenuItem("Open...", KeyEvent.VK_O);
		menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_O,
				ActionEvent.ALT_MASK));
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Load a file from disk");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				fileOpen();
			}
		});

		// file : save
		menuItem = new JMenuItem("Save", KeyEvent.VK_S);
		menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_S,
				ActionEvent.ALT_MASK));
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Save the current file to disk");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				fileSave();
			}
		});

		// file : save as
		menuItem = new JMenuItem("Save As...", KeyEvent.VK_A);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Save to disk with a new filename");
		menuItem.addActionListener(this);
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				fileSaveAs();
			}
		});

		// seperator
		menu.addSeparator();

		// file : export
		subMenu = new JMenu("Export To File");
		menu.add(subMenu);
		subMenuItem = new JMenuItem("Magpie...", KeyEvent.VK_M);
		subMenu.add(subMenuItem);
		subMenuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				exportFile(FORMAT_MAGPIE);
			}
		});
		subMenuItem = new JMenuItem("Moho...", KeyEvent.VK_H);
		subMenu.add(subMenuItem);
		subMenuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				exportFile(FORMAT_MOHO);
			}
		});
		subMenuItem = new JMenuItem("3D GameStudio...", KeyEvent.VK_3);
		subMenu.add(subMenuItem);
		subMenuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				exportFile(FORMAT_GAMESTUDIO);
			}
		});
		subMenuItem = new JMenuItem("Comma sep...", KeyEvent.VK_C);
		subMenu.add(subMenuItem);
		subMenuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				exportFile(FORMAT_CSV);
			}
		});

		// file : copy to clipboard
		menuItem = new JMenuItem("Copy Timesheet To Clipboard", KeyEvent.VK_C);
		menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_C,
				ActionEvent.CTRL_MASK));
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Copy the exposure sheet to the clipboard");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				copyToClipboard();
			}
		});

		// file : create avi file
		menuItem = new JMenuItem("Create AVI File...", KeyEvent.VK_C);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Create an AVI file of the animation");
		menuItem.addActionListener(this);
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				writeAviFile();
			}
		});

		// seperator
		menu.addSeparator();

		// file exit
		menuItem = new JMenuItem("Exit", KeyEvent.VK_X);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Copy the exposure sheet to the clipboard");
		menuItem.addActionListener(this);
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				// save current work?
				if (cancelledAutoSave()) {
					return;
				}
				// exit application
				System.exit(0);
			}
		});

		// waveform menu
		menu = new JMenu("Waveform");
		menu.setMnemonic(KeyEvent.VK_W);
		menu.getAccessibleContext()
				.setAccessibleDescription("Waveform options");
		menuBar.add(menu);

		// waveform : play the waveform
		menuItem = new JMenuItem("Play the waveform", KeyEvent.VK_P);
		menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_P,
				ActionEvent.CTRL_MASK));
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Play the entire waveform");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(1, wavePanel.frameCount);
			}
		});

		// waveform : play the selection
		menuItem = new JMenuItem("Play the selection", KeyEvent.VK_L);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Play the selected portion of the waveform");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(wavePanel.markerStart, wavePanel.markerEnd);
			}
		});

		// waveform : play from selection
		menuItem = new JMenuItem("Play from selection", KeyEvent.VK_F);
		menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F,
				ActionEvent.CTRL_MASK));
		menuItem
				.getAccessibleContext()
				.setAccessibleDescription(
						"Play the waveform starting from the current selection to the end");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(wavePanel.markerStart, wavePanel.frameCount);
			}
		});

		// waveform : play to selection
		menuItem = new JMenuItem("Play to selection", KeyEvent.VK_T);
		menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_T,
				ActionEvent.CTRL_MASK));
		menuItem
				.getAccessibleContext()
				.setAccessibleDescription(
						"Play the waveform from the beginning to the end of the current selection");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(1, wavePanel.markerEnd);
			}
		});

		// seperator
		menu.addSeparator();

		// waveform : zoom to selection
		menuItem = new JMenuItem("Zoom to selection", KeyEvent.VK_Z);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Display the selected portion of the wave");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				wavePanel.zoomToFit();
			}
		});

		// waveform : zoom back
		menuItem = new JMenuItem("Zoom back", KeyEvent.VK_B);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Display the entire wave");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				wavePanel.zoomAll();
			}
		});

		menu = new JMenu("PDF");
		menu.setMnemonic(KeyEvent.VK_P);
		menu.getAccessibleContext()
				.setAccessibleDescription("Pdf export options");
		menuBar.add(menu);

		ButtonGroup pdfGroup = new ButtonGroup();
		letter = new JRadioButtonMenuItem("Letter");
		letter.setMnemonic(KeyEvent.VK_L);
		letter.getAccessibleContext().setAccessibleDescription(
				"Uses Letter - mainly American paper size");
        letter.setSelected(true);
		pdfGroup.add(letter);
		menu.add(letter);
		letter.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				fileSaveAsPdf("LETTER");
			}
		});

		a4 = new JRadioButtonMenuItem("A4");
		a4.setMnemonic(KeyEvent.VK_A);
		a4.getAccessibleContext().setAccessibleDescription(
				"Uses A4 - mainly European papir size");
		pdfGroup.add(a4);
		menu.add(a4);
		a4.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
                fileSaveAsPdf("A4");
            }
		});


		/*
		 *  // mouth menu menu = new JMenu("Mouth");
		 * menu.setMnemonic(KeyEvent.VK_M);
		 * menu.getAccessibleContext().setAccessibleDescription("Mouth
		 * options"); menuItem.addActionListener(this); menuBar.add(menu);
		 *  // toon ButtonGroup mouthGroup = new ButtonGroup(); rbMenuItem = new
		 * JRadioButtonMenuItem("Toon Default"); rbMenuItem.setSelected(true);
		 * rbMenuItem.setMnemonic(KeyEvent.VK_F);
		 * rbMenuItem.getAccessibleContext().setAccessibleDescription("Use the
		 * Toon-style faces"); mouthGroup.add(rbMenuItem); menu.add(rbMenuItem);
		 * rbMenuItem.addActionListener(new ActionListener() { public void
		 * actionPerformed(ActionEvent e) { facePanel.useSet( "toon" ); //
		 * phonemeList.setListData(facePanel.phonemes );
		 * phonemeList.paintImmediately(phonemeList.getBounds()); } });
		 * 
		 *  // magpie mouthGroup = new ButtonGroup(); rbMenuItem = new
		 * JRadioButtonMenuItem("Magpie Default"); rbMenuItem.setSelected(true);
		 * rbMenuItem.setMnemonic(KeyEvent.VK_F);
		 * rbMenuItem.getAccessibleContext().setAccessibleDescription("Use the
		 * Magpie-style default faces"); mouthGroup.add(rbMenuItem);
		 * menu.add(rbMenuItem); rbMenuItem.addActionListener(new
		 * ActionListener() { public void actionPerformed(ActionEvent e) {
		 * facePanel.useSet( "default" ); //
		 * phonemeList.setListData(facePanel.phonemes );
		 * phonemeList.paintImmediately(phonemeList.getBounds()); } });
		 *  // wally worm rbMenuItem = new JRadioButtonMenuItem("Wally Worm");
		 * rbMenuItem.setSelected(false); rbMenuItem.setMnemonic(KeyEvent.VK_W);
		 * rbMenuItem.getAccessibleContext().setAccessibleDescription("Use the
		 * Wally Worm faces"); mouthGroup.add(rbMenuItem); menu.add(rbMenuItem);
		 * rbMenuItem.addActionListener(new ActionListener() { public void
		 * actionPerformed(ActionEvent e) { facePanel.useSet( "wally" );
		 * phonemeList.paintImmediately(phonemeList.getBounds()); //
		 * phonemeList.setListData( facePanel.phonemes ); } });
		 *  // preston blair // rbMenuItem = new JRadioButtonMenuItem("Preston
		 * Blair"); // rbMenuItem.setSelected(false); //
		 * rbMenuItem.setMnemonic(KeyEvent.VK_P); //
		 * rbMenuItem.getAccessibleContext().setAccessibleDescription("Use
		 * Preston Blair-style faces"); // mouthGroup.add(rbMenuItem); //
		 * menu.add(rbMenuItem); // rbMenuItem.addActionListener(new
		 * ActionListener() { // public void actionPerformed(ActionEvent e) { //
		 * facePanel.useSet( "blair" ); // phonemeList.setListData(
		 * facePanel.phonemes ); // } // });
		 */

		// options menu
		menu = new JMenu("Options");
		menu.setMnemonic(KeyEvent.VK_O);
		menu.getAccessibleContext().setAccessibleDescription(
				"Configuration options and settings");
		menuBar.add(menu);

		// options : base timecode
		menuItem = new JMenuItem("Base timecode...", KeyEvent.VK_B);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Set the starting time of the soundclip");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				// build base time
				StringBuilder baseTime = new StringBuilder();

				// hour offset
				if (timeSheet.hourOffset < 10)
					baseTime.append("0");
				baseTime.append(timeSheet.hourOffset + ":");

				// minute offset
				if (timeSheet.minuteOffset < 10)
					baseTime.append("0");
				baseTime.append(timeSheet.minuteOffset + ":");

				// seconds offset
				if (timeSheet.secondOffset < 10)
					baseTime.append("0");
				baseTime.append(timeSheet.secondOffset + ":");

                // frames offset
				if (timeSheet.framesOffset < 10)
					baseTime.append("0");
				baseTime.append(timeSheet.framesOffset);

				// cancel returns null value
				String s = JOptionPane.showInputDialog(null,
						"Enter the new base time:", baseTime.toString());
				if (s != null) {
					try {
						// split on spaces
						String value[] = s.toString().split(":", 0);
						int newHour = Integer.parseInt(value[0]);
						int newMinute = Integer.parseInt(value[1]);
						int newSecond = Integer.parseInt(value[2]);
                        int newFrames = Integer.parseInt(value[3]);

						// validate
						if (newHour > -1 && newHour < 99 
                                && newMinute > -1 && newMinute < 60
                                && newSecond > -1 && newSecond < 60
                                && newFrames > -1 
                                && newFrames < timeSheet.framesPerSecond) {

							// save offsets
							timeSheet.hourOffset = newHour;
							timeSheet.minuteOffset = newMinute;
							timeSheet.secondOffset = newSecond;
                            timeSheet.framesOffset = newFrames;

							// repaint the timesheet
							timeSheetTable.repaint();
						} else {
							throw new Exception("Bad time format");
						}
					} catch (Exception e1) {
						Utilities.errMessage("Bad time format '" + s
								+ "' - use HH:MM:SS:FR" + e1);
					}

				}
			}
		});

		// options : audio/video sync
		menuItem = new JMenuItem("Audio/Video sync...", KeyEvent.VK_S);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"Set the audio/video sync");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				String s = JOptionPane.showInputDialog(null,
						"Enter the audio track offset in frames:", new String(
								trackOffset + ""));
				if (s != null) {
					try {
						trackOffset = Integer.parseInt(s);
					} catch (Exception e1) {
						String message = new String("'" + s
								+ "' is not an integer");
						JOptionPane.showMessageDialog(null, message,
								"Bad Track Offset", JOptionPane.ERROR_MESSAGE);
					}
				}
			}
		});

		// seperator
		menu.addSeparator();

		// options : file (24fps)
		ButtonGroup group = new ButtonGroup();
		fps24 = new JRadioButtonMenuItem("Film (24 fps)");
		fps24.setSelected(true);
		fps24.setMnemonic(KeyEvent.VK_F);
		fps24.getAccessibleContext().setAccessibleDescription(
				"Use 24 frames per second (standard film rate)");
		group.add(fps24);
		menu.add(fps24);
		fps24.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				rescaleTimeSheet(24);
				wavePanel.repaint();
			}
		});

		fps25 = new JRadioButtonMenuItem("PAL (25 fps)");
		fps25.setMnemonic(KeyEvent.VK_F);
		fps25.getAccessibleContext().setAccessibleDescription(
				"Use 25 frames per second (standard PAL video rate)");
		group.add(fps25);
		menu.add(fps25);
		fps25.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				rescaleTimeSheet(25);
				wavePanel.repaint();
			}
		});

		fps30 = new JRadioButtonMenuItem("NTSC (30 fps)");
		fps30.setMnemonic(KeyEvent.VK_F);
		fps30.getAccessibleContext().setAccessibleDescription(
				"Use 30 frames per second (standard NTSC video rate)");
		group.add(fps30);
		menu.add(fps30);
		fps30.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				rescaleTimeSheet(30);
				wavePanel.repaint();
			}
		});

		// help menu
		menu = new JMenu("Help");
		menu.setMnemonic(KeyEvent.VK_H);
		menu.getAccessibleContext().setAccessibleDescription("Help options");
		menuItem.addActionListener(this);
		menuBar.add(menu);

		// help : contents
		/*
		 * menuItem = new JMenuItem("Contents...", KeyEvent.VK_C);
		 * menuItem.getAccessibleContext().setAccessibleDescription( "Display
		 * helpfile contents"); menu.add(menuItem);
		 * menuItem.addActionListener(new ActionListener() { public void
		 * actionPerformed(ActionEvent e) { // help contents } });
		 *  // help : search for help on menuItem = new JMenuItem("Search for
		 * help on...", KeyEvent.VK_S);
		 * menuItem.getAccessibleContext().setAccessibleDescription( "Search
		 * helpfile for particular topic"); menu.add(menuItem);
		 * menuItem.addActionListener(new ActionListener() { public void
		 * actionPerformed(ActionEvent e) { // search for help on } });
		 *  // seperator menu.addSeparator();
		 */

		// help : about
		menuItem = new JMenuItem("About JLipSync...", KeyEvent.VK_A);
		menuItem.getAccessibleContext().setAccessibleDescription(
				"About this program");
		menu.add(menuItem);
		menuItem.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {

				About aboutDialog = new About(null,
						JLIPSYNC_VERSION );

			}
		});
		return menuBar;
	}

	public void actionPerformed(ActionEvent e) {
		String s;

		// selected from the list?
		if (e.getSource() instanceof JList) {
			JList source = (JList) (e.getSource());
			s = (String) source.getSelectedValue();
			// hrm... do something?
			// FIXME: should this set the check?
			return;
		}
	}

	public void valueChanged(ListSelectionEvent e) {
		JList list = (JList) e.getSource();
		String s = (String) list.getSelectedValue();
		// update displayed face
		facePanel.setFace(s);
	}

	public void itemStateChanged(ItemEvent e) {
		// not implemented
	}

	// Returns just the class name -- no package info.
	protected String getClassName(Object o) {
		String classString = o.getClass().getName();
		int dotIndex = classString.lastIndexOf(".");
		return classString.substring(dotIndex + 1);
	}

	public Container createContentPanel() {
		//Create the content-pane-to-be.
		JButton button;
		JPanel contentPanel = new JPanel(new BorderLayout());
		contentPanel.setPreferredSize(new Dimension(200, 200));
		contentPanel.setOpaque(true);

		// create a panel to put buttons in
		JToolBar toolbar = new JToolBar();
		toolbar.setPreferredSize(new Dimension(200, 30));
		contentPanel.add("North", toolbar);

		// file open
		button = new JButton(createImageIcon("images/open.gif"));
		button.setToolTipText("Load a file from disk");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				fileOpen();
			}
		});

		// file save
		button = new JButton(createImageIcon("images/save.gif"));
		button.setToolTipText("Save the current file disk");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				fileSave();
			}
		});

		// copy
		button = new JButton(createImageIcon("images/copy.gif"));
		button.setToolTipText("Copy the exposure sheet to the clipboard");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				copyToClipboard();
			}
		});

		toolbar.addSeparator();

		button = new JButton(createImageIcon("images/play.gif"));
		button.setToolTipText("Play the entire waveform");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(1, wavePanel.frameCount);
			}
		});

		button = new JButton(createImageIcon("images/play_selection.gif"));
		button.setToolTipText("Play the selected portion of the waveform");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(wavePanel.markerStart, wavePanel.markerEnd);
			}
		});

		button = new JButton(createImageIcon("images/play_from.gif"));
		button
				.setToolTipText("Play the waveform starting from the current selection to the end");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(wavePanel.markerStart, wavePanel.frameCount);
			}
		});

		button = new JButton(createImageIcon("images/play_to.gif"));
		button
				.setToolTipText("Play the waveform from the beginning to the end of the current selection");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				playFrames(1, wavePanel.markerEnd);
			}
		});

		toolbar.addSeparator();

		button = new JButton(createImageIcon("images/zoom_fit.gif"));
		button.setToolTipText("Display the selected portion of the wave");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				wavePanel.zoomToFit();
			}
		});

		button = new JButton(createImageIcon("images/zoom_1.gif"));
		button.setToolTipText("Display the entire wave");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				wavePanel.zoomAll();
			}
		});

		button = new JButton(createImageIcon("images/zoom_in.gif"));
		button.setToolTipText("Zoom in on the wave");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				wavePanel.zoomIn();
			}
		});

		button = new JButton(createImageIcon("images/zoom_out.gif"));
		button.setToolTipText("Zoom out on the wave");
		toolbar.add(button);
		button.addActionListener(new java.awt.event.ActionListener() {
			public void actionPerformed(ActionEvent e) {
				wavePanel.zoomOut();
			}
		});

		class MyCellRenderer extends JLabel implements ListCellRenderer {
			// This is the only method defined by ListCellRenderer.
			// We just reconfigure the JLabel each time we're called.

			public Component getListCellRendererComponent(JList list,
					Object value, // value to display
					int index, // cell index
					boolean isSelected, // is the cell selected
					boolean cellHasFocus) // the list and the cell have the
										  // focus
			{
				// get the text
				String s = value.toString();
				setText(s);

				// FIXME: make this optional
				// get the icon
				if (facePanel != null) {
					Icon faceIcon = facePanel.getSmallFace(s);
					if (faceIcon != null) {
						setIcon(faceIcon);
					}
				}

				// handle focus
				if (isSelected) {
					setBackground(list.getSelectionBackground());
					setForeground(list.getSelectionForeground());
				} else {
					setBackground(list.getBackground());
					setForeground(list.getForeground());
				}

				setEnabled(list.isEnabled());
				setFont(list.getFont());
				setOpaque(true);
				return this;
			}
		}

		// create an area for the list
		String phonemeNames[] = { "<none>" };

		JList phonemeList = new JList(phonemeNames);
		phonemeList.setCellRenderer(new MyCellRenderer());
		phonemeList.setVisibleRowCount(25);
		JScrollPane phonemeScrollPane = new JScrollPane();
		phonemeScrollPane.setViewportView(phonemeList);
		phonemeScrollPane.setPreferredSize(new Dimension(100, 200));
		contentPanel.add("West", phonemeScrollPane);

		// the list selection changed listener
		phonemeList.addListSelectionListener(new ListSelectionListener() {
			public void valueChanged(ListSelectionEvent e) {
				JList list = (JList) e.getSource();
				String s = (String) list.getSelectedValue();

				// update displayed face
				facePanel.setFace(s);
			}
		});

		// the mouse listener
		phonemeList.addMouseListener(new MouseAdapter() {
            @Override
			public void mouseClicked(MouseEvent e) {
				// doubleclick?
				if (e.getClickCount() == 2) {

					// get the selection model for the timesheet
					ListSelectionModel lsm = timeSheetTable.getSelectionModel();

					// not empty?
					if (!lsm.isSelectionEmpty()) {
						// get the selected row
						int selectedRow = lsm.getMinSelectionIndex();

						// get the list
						JList list = (JList) e.getSource();

						// get the value from the list
						String s = (String) list.getSelectedValue();

						// convert "<none>" to empty string
						if (s.equals("<none>")) {
							s = "";
						}

						// set the value into the timesheet
						timeSheet.mouth[selectedRow] = s;

						// update
						timeSheetTable.repaint();
					}
				}
			}
		});

		// create a panel to hold the waveform, phoneme image and chart
		JPanel midPanel = new JPanel(new BorderLayout());
		contentPanel.add("Center", midPanel);

		// create a panel to hold the wavePanel and facePanel
		JPanel waveAndFacePanel = new JPanel(new BorderLayout());
		midPanel.add("North", waveAndFacePanel);

		// create an area to draw the phoneme on
		facePanel = new FacePanel("default");
		waveAndFacePanel.add("East", facePanel);

		// create an area to draw the wave on
		wavePanel = new WavePanel();
		wavePanel.setPreferredSize(new Dimension(128, 128));
		waveAndFacePanel.add("Center", wavePanel);

		// load the phonemes for the face
		phonemeList.setListData(facePanel.phonemes);

		// create a timesheet to hold the data
		timeSheet = new TimeSheet(wavePanel.frameCount, wavePanel.framesPerSecond);
		
		// create a timesheet table
		TimeSheetTableModel timeSheetTableModel = new TimeSheetTableModel( timeSheet );
		timeSheetTable = new JTable(timeSheetTableModel);
			
		// set the preferred size
		timeSheetTable.setPreferredScrollableViewportSize(new Dimension(425, 200));
		timeSheetTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

		timeSheetTable.revalidate();
		
		JScrollPane scrollPane = new JScrollPane(timeSheetTable);

		// connect the timesheet to the wave panel and face panel
		wavePanel.timeSheetTable = timeSheetTable;
		wavePanel.facePanel = facePanel;
		
		// create a selection listener for the table
		ListSelectionModel rowSM = timeSheetTable.getSelectionModel();
		rowSM.addListSelectionListener(new ListSelectionListener() {
			public void valueChanged(ListSelectionEvent e) {
				//Ignore extra messages.
				if (e.getValueIsAdjusting()) {
					return;
				}

				ListSelectionModel lsm = (ListSelectionModel) e.getSource();
				if (lsm.isSelectionEmpty()) {
					// no rows selected
				} else {
					// get the selected row
					int selectedRow = lsm.getMinSelectionIndex();

					// set as the selection
					wavePanel.markerStart = selectedRow + 1;
					wavePanel.markerEnd = selectedRow + 1;
					
					// update the wave
					wavePanel.repaint();

					// update the face
					facePanel.setFace(timeSheet.mouth[selectedRow]);

					// ensure the current frame is visible
					wavePanel.ensureFrameVisible(selectedRow + 1);
				}
			}
		});

		// the list selection gets a key
		timeSheetTable.addKeyListener(new KeyListener() {

			public void keyTyped(KeyEvent e) {

				int selectedColumn = timeSheetTable.getSelectedColumn();

				// ignore if comments column
				if (selectedColumn == TimeSheet.COLUMN_COMMENTS) {
					return;
				}

				// get the current row and row count
				int selectedRow = timeSheetTable.getSelectedRow();
//				int rows = timeSheetTable.getRowCount();

				// get character pressed
				char c = e.getKeyChar();

				// in key column?
				if (selectedColumn == TimeSheet.COLUMN_KEY) {
					// toggle?
					if (c == ' ' || c == 'x' || c == 'X') {
						// toggle value
						timeSheet.key[selectedRow] = !timeSheet.key[selectedRow];

						// update timesheet
						timeSheetTable.repaint();
					}
					return;
				}

				// editing for faces

				// space bar
				if (c == ' ') {
					// play four frames of audio starting from this row
					wavePanel.playFrames(selectedRow + 1, selectedRow + 4);
					return;
				}

				// not in range?
				if (c > 'z') {
					return;
				}

				// convert to a string
				String s = new String(c + "").toUpperCase();

				// special handling for blends
				if (s.equals("H")) {
					String currentValue = timeSheet.mouth[selectedRow];
					if (currentValue.equals("C")) {
						s = "CH";
					} else if (currentValue.equals("S")) {
						s = "SH";
					} else if (currentValue.equals("T")) {
						s = "TH";
					}
				} else if (s.equals("X")) {
					// "X" is "Closed" pose
					s = "-";
				}

				// set the value into the timesheet
				timeSheet.mouth[selectedRow] = new String(s);

				// update
				timeSheetTable.repaint();
				facePanel.setFace(s);
			}

			public void keyPressed(KeyEvent e) {
				// get the current row and row count
				int selectedRow = timeSheetTable.getSelectedRow();
				int rows = timeSheetTable.getRowCount();

				// get character pressed
				int c = e.getKeyCode();

				// insert key
				if (c == KeyEvent.VK_INSERT) {
					// move all rows down one line
					for (int i = rows - 1; i > selectedRow; i--) {
						// copy
						timeSheet.mouth[i] = timeSheet.mouth[i - 1];
						timeSheet.comment[i] = timeSheet.comment[i - 1];
						timeSheet.key[i] = timeSheet.key[i - 1];
					}

					// insert a blank in the current row
					timeSheet.mouth[selectedRow] = "";
					timeSheet.comment[selectedRow] = "";
					timeSheet.key[selectedRow] = false;

					// update
					timeSheetTable.repaint();
				}

				// delete key?
				if (c == KeyEvent.VK_DELETE) {
					// move all rows up one
					for (int i = selectedRow; i < rows - 1; i++) {
						// copy up
						timeSheet.mouth[i] = timeSheet.mouth[i + 1];
						timeSheet.comment[i] = timeSheet.comment[i + 1];
						timeSheet.key[i] = timeSheet.key[i + 1];
					}

					// clear the last row
					timeSheet.mouth[rows - 1] = new String("");
					timeSheet.comment[rows - 1] = new String("");
					timeSheet.key[rows - 1] = false;

					// update
					timeSheetTable.repaint();
				}

			}

			public void keyReleased(KeyEvent e) {
				// ignore event
			}

		});

		// the list selection gets a key
		timeSheetTable.addMouseListener(new MouseAdapter() {
            @Override
			public void mouseClicked(MouseEvent e) {
				int selectedColumn = timeSheetTable.getSelectedColumn();

				// not the key column?
				if (selectedColumn != TimeSheet.COLUMN_KEY) {
					return;
				}

				// get the current row
				int selectedRow = timeSheetTable.getSelectedRow();

				// toggle
				timeSheet.key[selectedRow] = !timeSheet.key[selectedRow];

				// update timesheet
				timeSheetTable.repaint();

			}
		});

		midPanel.add("Center", scrollPane);

		// status bar
		statusBar = new JLabel("Welcome to JLipSync!");
        JPanel statusPanel = new JPanel();
		statusPanel.setLayout(new FlowLayout());
		statusPanel.add(statusBar);
        statusBar.setBorder(BorderFactory.createEtchedBorder());
		contentPanel.add("South", statusBar);

		return contentPanel;
	}

	// return an icon
	protected static ImageIcon createImageIcon(String path) {
		java.net.URL imgURL = JLipSync.class.getResource(path);
		if (imgURL != null) {
			return new ImageIcon(imgURL);
		} else {
			String message = new String("Couldn't find file: " + path);
			JOptionPane.showMessageDialog(null, message, "Error",
					JOptionPane.ERROR_MESSAGE);
			return null;
		}
	}

	// create and launch the application
	public static void main(String[] args) {
		// use native look and feel
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch (Exception e) {
			// don't really care
		}

		JLipSync app = new JLipSync();
		app.repaint();

	}
}