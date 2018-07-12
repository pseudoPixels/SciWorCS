// SimpleXmlReader.java
// Basic XML-style file reader
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License


import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class SimpleXmlReader 
	extends FileInputStream {

	// holds the last tag not accepted
	public String tag = new String("");
	
	public SimpleXmlReader( File fileName ) 
		throws FileNotFoundException {		
		super( fileName );
	}
	
	// get the next XML tag in the stream
	public String getCurrentTag() 
		throws IOException {
            
		// if there is an unprocessed tag, return that
		if ( tag.length() != 0 ) {
			return tag;
		}
        
		// start reading tag
		int b = read();
		
        // skip whitespace
        while ( b == -1 || b == '\n' || b == '\r' || b == '\t' || b == ' ' ) {
            // check for end of file...
            if ( b == -1 ) {
                throw new IOException( "Unexpected end of file" );
            }
            b = read();
        }
			
		StringBuffer buffer = new StringBuffer();
			
		// read first character
		if ( (char)b != '<' ) {
			throw new IOException( "Expected start of XML tag, not " + (char)b + "(char #" + b + ")");
		}
		buffer.append( (char)b );
		// read until '<' is reached
		while ( (char)b != '>' ) {
			b = (int)read();
			if ( b == -1 ) {
				throw new IOException( "Expected XML tag not " + buffer.toString() +"{EOF}" );
			}
            buffer.append( (char)b );
		}

        tag = buffer.toString();
		return tag;
	}
		
		
	public String getString( String expectedTag ) 
		throws IOException {			
						
		String value;
		int b;
			
		if ( !getCurrentTag().equals("<" + expectedTag + ">" )) {
			throw new IOException( "Expected XML tag <" + expectedTag + ">, not " + getCurrentTag() );
		}
			
		// create a buffer to accumulate into
		StringBuffer buffer = new StringBuffer();
			
		// read from the stream
		while (true) {
				
			// read a byte
			b = read();
			if ( b == -1 ) {
				throw new IOException( "Expected XML tag data for </" + expectedTag + ">, not end of file" );
			}
			
			// end of tag?
			if ( (char)b == '<' ) {					
				break;
			} else {
				// accumulate
				buffer.append( (char)b );
			}
		}
			
		// save the value
		value = buffer.toString();
			
		// clear the buffer
		buffer = new StringBuffer("<");
				
		// closing tag			
		while ( (char)b != '>' ) {
			b = read();				
			if ( b == -1 ) {
				throw new IOException( "Expected tag </" + expectedTag + ">, not " + buffer.toString() + "{EOF}" );
			}
			buffer.append( (char)b );
		}
			
		// check tag
		if (!buffer.toString().equals( "</" + expectedTag + ">" )) {
			throw new IOException( "Expected XML tag </" + expectedTag + ">, not " + buffer.toString() );
		}
		tag = "";
			
		return value;
		}
		
		
		
	// get the next tag in the stream.
	String getTag( String expectedTag ) 
		throws IOException {

		// check against expected tag
		String theTag = getCurrentTag();
		if ( expectedTag.length() != 0 && !expectedTag.equals(theTag) ) {
			throw new IOException( "Expected XML tag " + expectedTag + ", not " + theTag );
		}
		// clear it
		tag = "";
		return theTag;
	}
				
	public int getInt( String s ) 
	throws IOException {
		return (int)getFloat(s);
	}
	
	public float getFloat( String s ) 
		throws IOException {
		return Float.valueOf(getString( s )).floatValue();
	}
	
	// return value from optional tag
	public String getOptionalString( String s ) 
		throws IOException {
			
		// is this the requested tag?
		if ( getCurrentTag().equals("<" + s + ">") ) {
			// get the string
			return getString( s );				
		}
		// return an empty string
		return "";
	}
	
}