// JlsFilter.java
// Filter for selecting .jls (JLipSync) files
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License

import java.io.File;

import javax.swing.filechooser.FileFilter;

// accept files ending with .jls
public class JlsFilter extends FileFilter {
	    
    // Accept all directories and all .jls files
    public boolean accept(File f) {
        if (f.isDirectory()) {
            return true;
        }

        String fileName = f.getName().toLowerCase();
		if (fileName.endsWith( ".jls" )) {
			return true;
		}			
        return false;
    }
    
    // The description of this filter
    public String getDescription() {
        return "JLipSync Files";
    }
}

