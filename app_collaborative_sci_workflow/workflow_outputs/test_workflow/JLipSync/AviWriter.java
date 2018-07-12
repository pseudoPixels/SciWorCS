// AviWriter.java
// Create .avi file from framebuffer
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License

import java.io.File;
import java.io.FileOutputStream;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.swing.JOptionPane;


class AviWriter
{  
	int frameRate;                      // frames per second
	int frameCount;                     // total count of frames
	int currentFrameNumber;     		// index of frame being written
	int frameWidth;                     // frame width
	int frameHeight;                    // frame height
	int bitCount;                       // size of color data (defaults to 24)
	int frameBufferSize;                // size of buffer holding image  
	byte[] frameBuffer;                 // buffer holding the image
	int dataOffset;                        // position in file where data starts
	int frameDataIndex[];           // position of frame data in file, relative to dataStarts
	AudioInputStream audioInputStream = null;

	int posInFile = 0;  // position in file, for debugging
    
	FileOutputStream fileOutputStream;  // output file
    
	// audio support
	boolean hasAudio = true;    // true if this file has audio support
	int waveSamplesPerSecond;
	int waveSamplesPerFrame;
	int waveBitsPerSample;
	int waveBufferSize;
	byte waveBuffer[];      // buffer holding wave data for a single frame
	int waveDataIndex[];    // position of wave data in file, relative to dataStarts
	int waveDataSize[];	// number of bytes of wave data in frame
	int waveBufferPadding = 0;
	int waveFrameCount;	// number of wave frames


	// create the writer, and write out the header
	public AviWriter( String fileName, String waveFileName, int width, int height, int nFrames, int framesPerSecond) throws Exception {
		
		// save the parameters
		frameWidth = width;
		frameHeight = height;
		frameCount = nFrames;
		frameRate = framesPerSecond;

		// header size
		int headerSize = 204;  // 12+12+56+8+12+56+8+40       
        
		// hard coded bitCount. Other values can be supported, but
		// you'll have to write your own routines to write to the
		// framebuffer.
		bitCount = 24;

		// number of streams
		int streamCount = 1;
        
		// frame width must be divisible by 4, and height an even number
		if (((frameWidth & 3) != 0 ) | ((frameHeight & 1) != 0)) {
			throw new Exception("Bad frame format. Width must be divisible by 4, and height by 2");
		}
			
		// open the file
		fileOutputStream = new FileOutputStream( fileName );
        
		// allocate the frame buffer
		frameBufferSize = frameWidth*frameHeight*(int)Math.floor((bitCount+1)/8);
		frameBuffer = new byte[frameBufferSize];

		// indexes for frame data
		frameDataIndex = new int[frameCount];
        
		// wave information		
		if (!(waveFileName.equals(""))) {
			// try to open the file		
			try {
				File waveFile = new File( waveFileName );
				audioInputStream = AudioSystem.getAudioInputStream( waveFile );
				hasAudio = true;
			} catch (Exception e) {
				errMessage( "Unable to open audio file " + waveFileName );
				hasAudio = false;
			}
		}
		

		if (hasAudio) {			
			// add audio to stream count
			streamCount = 2;
            						
			// get the audio format
			AudioFormat audioFormat = audioInputStream.getFormat();
			waveBitsPerSample = audioFormat.getSampleSizeInBits();
			waveSamplesPerSecond = (int)audioFormat.getSampleRate();
			waveSamplesPerFrame = waveSamplesPerSecond / framesPerSecond;
			waveBufferSize = waveSamplesPerFrame * ( waveBitsPerSample/8 );
			
			// total count of bytes
			int byteCount = byteCount = (int)(audioInputStream.getFrameLength() * audioFormat.getFrameSize());

			// ensure minimum size for smooth playback
			waveBufferSize = 1024;
			waveFrameCount = (int)Math.floor( byteCount / waveBufferSize );
			if ( (byteCount % waveBufferSize) != 0 ) {
				waveFrameCount++;
			}
						

			// indexes for wave data
			waveDataIndex = new int[waveFrameCount];
			waveDataSize = new int[waveFrameCount];
            
			// create and initialize wave buffer
			waveBuffer = new byte[waveBufferSize];
			for (int i = 0; i < waveBufferSize; i++ ) {
				waveBuffer[i] = 0;
			}
			
			// does the wave buffer need padding?
			if ((waveBufferSize % 2) != 0) {
				waveBufferPadding = 1;
			}
			
		}

		// flags
		int flags = 2064;   // dwFlags  0x18  HASINDEX | TRUSTCKTYPE
		
		// list chunk size
		int listChunkSize = 192;	// magic number
		
		// calculate total file size        
		int indexesSize = (frameCount*16)+8;
		int dataSize = ( (frameBufferSize+8) * frameCount ) + 12; // space needed for video frames +4 for movie
		int totalFileSize;
		
		if (hasAudio) {                    
			// double the size to include indexes to audio frames			
			indexesSize += (waveFrameCount*16);
            
			// add space needed for audio frames
			dataSize += ( (waveBufferSize+waveBufferPadding+8) * waveFrameCount );
			
			// add to header size
			headerSize += 100;
			
			// flags
			flags = 272;   // dwFlags  0x18  HASINDEX | ISINTERLEAVED
			
			// adjust chunk size
			//listChunkSize += 100;
			listChunkSize = 292;
		}
        headerSize = 304;
		// sum all the values
		totalFileSize = headerSize + dataSize + indexesSize;

        
		// AVI RIFF file
		ccOut( "RIFF");
		dWordOut(totalFileSize);

		ccOut( "AVI ");                // 'AVI '
			
		ccOut( "LIST");		
		dWordOut( listChunkSize );
			
		ccOut( "hdrl");
			
		ccOut( "avih");            // avi header
		dWordOut( 0x38 );          // 00000038
			
		dWordOut( (int)Math.floor(1000000/frameRate));   // dwMicroSecPerFrame
		dWordOut( frameBufferSize*frameRate );       // dwMaxBytesPerSec
		dWordOut( 0 );                            // dwPaddingGranularity (0)
		dWordOut( flags );                         // dwFlags  
		dWordOut( frameCount );                    // dwTotalFrames
		dWordOut( 0 );             // dwInitialFrames
		dWordOut( streamCount );             // dwStreams (1 = video only, 2 = audio+video)
		dWordOut( frameBufferSize );     // dwSuggestedBufferSize
		dWordOut( frameWidth );    // dwWidth
		dWordOut( frameHeight );   // dwHeight
		dWordOut( 0 );             // dwReserved[1]
		dWordOut( 0 );             // dwReserved[2]
		dWordOut( 0 );             // dwReserved[3]
		dWordOut( 0 );             // dwReserved[4]
					
		ccOut( "LIST" );
		dWordOut( 0x74 );       // size of this chunk
		ccOut( "strl" );
			
		ccOut( "strh" );
		dWordOut( 0x38 );         // size of this chunk - FIXME!
			
		ccOut( "vids" );           // fccType
		/* Note: the codecs are:
			cvid  	Radius CinePak  	
			msvc 	Microsoft Video 1 	
			iv32 	Intel Indeo 3.2 	
			iv41 	Intel Indeo 4.1 	
			iv50 	Intel Indeo 5.1 	
			mpg4 	Microsoft MPEG4 v1 	
			mp42 	Microsoft MPEG4 v2 	
			mp43 	Microsoft MPEG4 v3 	
			div3 	DivX Low-Motion 	
			div4 	DivX Fast-Motion 	
			divx 	Divx 4.x/5.x 	
			xvid 	Xvid 	
			dvsd 	DV-AVI 	type 2
			dvsd 	DV (D1) 	type 1
			dvhd 	DV (HD) 	
			dvsl 	DV (???)
		*/
		dWordOut( 0 );            	 // fccHandler: should this be 'dvsd'?		
		dWordOut( 0 );             // dwFlags 0x0
		wordOut( 0 );              // wPriority
		wordOut( 0 );              // wLanguage 0x0 undefined
		dWordOut( 0 );             // dwInitialFrames
		dWordOut( 1 );             // dwScale (example had 100 = 29.970 frames/sec)
		dWordOut( frameRate );     // dwRate
		dWordOut( 0 );             // dwStart
		dWordOut( frameCount );    // length
		dWordOut( frameBufferSize );     // suggested buffer size
		dWordOut( 0 );             // dwQuality
		dWordOut( 0 );             // dwSampleSize
		wordOut( 0 );                // rcFrame left
		wordOut( 0 );                // rcFrame top
		wordOut( frameWidth );       // rcFrame right
		wordOut( frameHeight );    // rcFrame bottom
			
		ccOut( "strf" );              // AVI Stream Format
		dWordOut( 40 );               // size of this chunk
		dWordOut( 40 );               // size of this chunk, (repeated, odd)
		dWordOut( frameWidth );     // biWidth
		dWordOut( frameHeight );    // biHeight
		wordOut( 1 );              // biPlanes
		wordOut( bitCount );       // biBitCount
		dWordOut( 0 );              // No compression - "raw " and "rgb " don't work
		dWordOut( frameBufferSize );      // biSizeImage
		dWordOut( 0 );              // biXPelsPerMeter
		dWordOut( 0 );              // biYPelsPerMeter
		dWordOut( 0 );              // biClrUsed
		dWordOut( 0 );              // biClrImportant		


		// does this have audio?
		if (hasAudio) {
			ccOut( "LIST" );
			dWordOut( 92 );		// size of this chunk - fixme! (94 if using cbSize)
			ccOut( "strl" );	// stream 1 (audio stream) "strl"
			
			ccOut( "strh" );	// audio header "strh
			dWordOut( 56 );		// size of header (56)
			
		 	ccOut( "auds" );	// fccType "auds"
			ccOut( "    " ); 	// fccHandler (codec)			            
			dWordOut( 0 );   	// dwFlags 0x0
			wordOut( 0 );              // wPriority
			wordOut( 0 );              // wLanguage 0x0 undefined
			dWordOut( 0 );             // dwInitialFrames (8268)
			dWordOut( 1 );             // dwScale (1)
			dWordOut( waveSamplesPerSecond );     // dwRate (11025)
			dWordOut( 0 );             // dwStart (0)
			dWordOut( waveBufferSize * frameCount  );    // length (25924)
			dWordOut( waveBufferSize );     // suggested buffer size (8268)
			dWordOut( 0 );             // dwQuality (should this be 1?) (0)
			dWordOut( 1 );             // dwSampleSize (1)
			wordOut( 0 );                // rcFrame left (0)
			wordOut( 0 );                // rcFrame top (0)
			wordOut( 0 );       // rcFrame right (0)
			wordOut( 0 );    // rcFrame bottom (0)

			ccOut( "strf" );	// audio format "strf"
			dWordOut( 16 );		// side of header (18) 
			wordOut( 1 );		// wFormatTag (codec) 1 = PCM (1) 
			wordOut( 1 );		// nChannels  = 1 (mono) (FIXME!) (1)
			dWordOut( waveSamplesPerSecond );	// nSamplesPerSec (11025)
			dWordOut( waveSamplesPerSecond );	// nAvgBytesPerSec (11025)
			wordOut( 1 );		// nBlockAlign (1) What is this???
			wordOut( waveBitsPerSample );		// wBitsPerSample (8)
			// wordOut( 0 ); // cbSize (ignored for PCM)
		}

		ccOut( "LIST");
		// ChunkID + length
		dWordOut( dataSize-8 ); 
		ccOut( "movi" );
        
		// data starts here
		dataOffset = 4;
		currentFrameNumber = 0;
	}
	
	
	// write the current frame buffer to the avi file
	void addFrame() throws Exception {
        
		// check current frame
		if (currentFrameNumber >= frameCount) {
			// throw an exception
			throw new Exception("Can't add frame " + (currentFrameNumber+1) + ", only " +  frameCount + " allocated");
		}
        
		// save position of frame data
		frameDataIndex[currentFrameNumber] = dataOffset;
        
		// 8 byte header
		// "00" = stream 0, "db" = uncompressed video frame
		ccOut("00db");
		dWordOut(frameBufferSize);        
	
		// framebuffer data
		fileOutputStream.write( frameBuffer );
        
		// increment data position
		dataOffset += 8 + frameBufferSize;
                
		// increment current frame index
		currentFrameNumber += 1;
        }



	// write out word-sized number
	public void wordOut( int i ) throws Exception {		
		// get the low byte
		int i1 = i & 0xFF;
		
		// get the high byte
		i = i >> 8;
		int i2 = i & 0xFF;

		// write them to the file
		fileOutputStream.write( i1 );
		fileOutputStream.write( i2 );
        
		posInFile += 2;
	}


	// write out a double-word sized number
	public void dWordOut( int i ) throws Exception {
		// get the bytes
		int i1 = i & 0xFF;
		i = i >> 8;
		int i2 = i & 0xFF;
		i = i >> 8;
		int i3 = i & 0xFF;
		i = i >> 8;
		int i4 = i & 0xFF;

		// write them out
		fileOutputStream.write( i1 );
		fileOutputStream.write( i2 );
		fileOutputStream.write( i3 );
		fileOutputStream.write( i4 );
        
		posInFile += 4;
	}


	// write out a 4 byte character code
	public void ccOut( String text ) throws Exception {	
		fileOutputStream.write( text.getBytes() );
		posInFile += 4;
	}


	// write out the indexes, and close the file
	public void close() throws Exception {	

		// need to add audio data?
		if (hasAudio) {
			// write out the wave frames
			for ( int i = 0; i < waveFrameCount; i++ ) {
				// save position
				waveDataIndex[i] = dataOffset;
            
				// 8 byte header
				// "01" = stream 1, "wb" = wave buffer
				ccOut("01wb");
				dWordOut(waveBufferSize);
			
				// read in the audio
				waveDataSize[i] = audioInputStream.read(waveBuffer, 0, waveBufferSize);
			
				// write wave data
				fileOutputStream.write( waveBuffer );
			
				// increment data position
				dataOffset += 8 + waveBufferSize;

				// need to pad buffer to an even boundary?
				if (waveBufferPadding != 0) {			
					fileOutputStream.write( 0 );				
					dataOffset += 1;
				}
			}

		}
		
		
		
		// frame index
		int dataSize = frameCount * 16;
		if (hasAudio) {
			// include audio frames
			dataSize += waveFrameCount * 16;
		}
		ccOut( "idx1" ); 
		dWordOut(dataSize); // index data size only 14.6.2004 BLE
		
		// video frame indexes
		for ( int i = 0; i < frameCount; i++ ) {
			// "00" = stream 0, "db" = uncompressed video frame
			ccOut("00db");
			dWordOut( 0x10 );    // key frame flag
			dWordOut( frameDataIndex[i] );  // offset to chunk
			dWordOut(frameBufferSize);  // frame buffer size            
		}
		
		// audio frame indexes
		if (hasAudio) {
			for ( int i = 0; i < waveFrameCount; i++ ) {						
				ccOut("01wb");
				dWordOut( 0x10 );    // key frame flag
				
				// empty frame? (shouldn't happen)
				if (waveDataSize[i] == -1 ) {
					dWordOut( 0 );	// doesn't matter
					dWordOut( 0 );	// no size
				} else {
					dWordOut( waveDataIndex[i] );  // offset to chunk
					dWordOut(waveDataSize[i]);  // frame buffer size
				}
			}

		}
		
		
		// close the file
		fileOutputStream.close();
		
		// close the audio file
		if (hasAudio) {
			audioInputStream.close();
		}
	}


	// set the requested pixel in the framebuffer
	public void setPixel( int x, int y, int r, int g, int b ) {
        
		// this assumes a 24 bit framebuffer: ints stored in r, g, b order

		// invert the y value
		y = frameHeight - (y+1);

		// range check
		if ( x < 0 | y < 0 | x > frameWidth | y > frameHeight ) {
			return;
		}

		// offset into the buffer
		int offset = ((y * frameWidth) + x) * 3;

		// set rgb values
		frameBuffer[offset] = (byte)b;
		frameBuffer[offset+1] = (byte)g;
		frameBuffer[offset+2] = (byte)r;
	}
    
	// set the frame to a requested color
	void clearFrame( int r, int g, int b ) {
        
		// this assumes a 24 bit framebuffer

		// fill the buffer
		for ( int i = 0; i < frameBufferSize; i += 3 ) {
			frameBuffer[i] = (byte)b;
			frameBuffer[i+1] = (byte)g;
			frameBuffer[i+2] = (byte)r;
		}
	}

	public void errMessage( String s ) {
		JOptionPane.showMessageDialog(null, s, 
		"Error", JOptionPane.ERROR_MESSAGE);
	}	
	
}
