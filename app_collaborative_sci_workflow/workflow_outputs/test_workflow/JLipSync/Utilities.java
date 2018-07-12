// Utilities.java
// Various useful routines
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License


import java.awt.Component;
import java.awt.Image;
import java.io.File;
import java.util.prefs.Preferences;

import javax.swing.ImageIcon;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;

public class Utilities {
	// get the icon
	final static ImageIcon createImageIcon(String path) {
	    java.net.URL imgURL = JLipSync.class.getResource(path);
	    if (imgURL != null) {
			return new ImageIcon(imgURL);
	    } else {
			System.err.println("Couldn't find Icon: " + path);
			return null;
	    }
	}
	
	// return a 32x32 version of the icon
	final static ImageIcon createScaledImageIcon( ImageIcon icon ) {
		// get the image
		Image image = icon.getImage();
		
		// create an icon to hold the image
		ImageIcon scaledIcon = new ImageIcon();
		
		// scale down the icon
		scaledIcon.setImage( 
				image.getScaledInstance(32, 32,
				Image.SCALE_DEFAULT));
		
		return scaledIcon;
	}
	final static void errMessage(String s) {
		JOptionPane.showMessageDialog(null, s, "Error",
				JOptionPane.ERROR_MESSAGE);
	}
	
	final static void setPreference( String key, String value ) {
		// get the user preferences
		Preferences userPrefs = Preferences.userRoot().node("/jlipsync/preferences");
		
		try {
			// save preference
			userPrefs.put(key, value); 
			userPrefs.flush();
		} catch (Exception e) {
			errMessage( "Unable to store persistant settings.");
		}
	}
	
	final static String getPreference( String key ) {
		// get the user preferences
		Preferences userPrefs = Preferences.userRoot().node("/jlipsync/preferences");

		// return preference, default is empty string
		return userPrefs.get(key, "" );
	}
	
	// return a JFileChooser that opens at the default directory
	final static JFileChooser fileChooser( File file) {
		
		JFileChooser fc = new JFileChooser();
		
		// look for default directory?
		String dirName = Utilities.getPreference("defaultDirectory");					

		if (dirName.length() > 0) {
			try {
				fc.setCurrentDirectory( new File(dirName) );
			} catch (Exception e) {
				// oh, well...
			}
		}
		
		// was a file specified?
		if (file != null) {
			// set as selected file
			try {
				fc.setSelectedFile( file );
			} catch (Exception e) {
				// ignore
			}
		}

		// return the dialog
		return fc;
	}
	
	// showSaveDialog, but automatically saves the current directory
	final static int showSaveDialog( Component c, JFileChooser fc ) {
		int returnVal = fc.showSaveDialog(c);
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			// save as default directory
			String dirName = fc.getCurrentDirectory().getAbsolutePath();
			Utilities.setPreference("defaultDirectory", dirName );			
		}
		
		return returnVal;
	}

	// showOpenDialog, but automatically saves the current directory
	final static int showOpenDialog( Component c, JFileChooser fc ) {
		int returnVal = fc.showOpenDialog(c);
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			// save as default directory
			String dirName = fc.getCurrentDirectory().getAbsolutePath();
			Utilities.setPreference("defaultDirectory", dirName );			
		}
		
		return returnVal;
	}

	
}
