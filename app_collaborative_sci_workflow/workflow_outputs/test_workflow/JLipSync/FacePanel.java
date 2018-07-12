// FacePanel.java
// Display face for current phoneme
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License

import java.awt.Color;
import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JLabel;


public class FacePanel 
	extends JLabel {
	
	// list of phonemes
	Object phonemes[] = { "<none>" };
		
    // face images
	ImageIcon poses[] = new ImageIcon[30];
	ImageIcon smallPoses[] = new ImageIcon[30];
	int pose_rest = 0,
		pose_a = 1,
		pose_b = 2,
		pose_c = 3,
		pose_ch  = 4,
		pose_d = 5,
		pose_e = 6,
		pose_f = 7,
		pose_g = 8,
		pose_i = 9,
		pose_j = 10,
		pose_k = 11,
		pose_l = 12,
		pose_m = 13,
		pose_n = 14,
		pose_o = 15,
		pose_p = 16,
		pose_q = 17,
		pose_r = 18,
		pose_s = 19,
		pose_sh = 20,
		pose_t = 21,
		pose_th = 22,
		pose_u = 23,
		pose_v = 24,
		pose_w = 25,
		pose_y = 26,
		pose_z = 27;

	public FacePanel( String set ) {
		useSet( set );
	}

	public void useSet( String faces ) {
		// load the graphics
		
		// clear the poses
		poses = new ImageIcon[30];
		smallPoses = new ImageIcon[30];

		// which set to load?
		if (faces.equals("default")) {			
			// a, i
			poses[pose_a] = Utilities.createImageIcon( "default/ai.png" );
			poses[pose_i] = poses[pose_a];

			// c, e, g, k, n, r, s, t
			poses[pose_c] =Utilities.createImageIcon( "default/cdgk.png" );
			poses[pose_e] = poses[pose_c];
			poses[pose_g] = poses[pose_c];
			poses[pose_k] = poses[pose_c];
			poses[pose_n] = poses[pose_c];
			poses[pose_r] = poses[pose_c];
			poses[pose_s] = poses[pose_c];
			poses[pose_t] = poses[pose_c];
			
			// closed
			poses[pose_rest] =Utilities.createImageIcon( "default/closed.png" );
			
			// d
			poses[pose_d] =Utilities.createImageIcon( "default/d.png" );
			
			// e
			poses[pose_e] =Utilities.createImageIcon( "default/e.png" );
			
			// f, v
			poses[pose_f] =Utilities.createImageIcon( "default/fv.png" );
			poses[pose_v] = poses[pose_f];
			
			// l
			poses[pose_l] =Utilities.createImageIcon( "default/l.png" );
			poses[pose_th] =Utilities.createImageIcon( "default/th.png" );
			
			// m, b, p
			poses[pose_m] =Utilities.createImageIcon( "default/mbp.png" );
			poses[pose_b] = poses[pose_m];
			poses[pose_p] = poses[pose_m];
			
			// o
			poses[pose_o] =Utilities.createImageIcon( "default/o.png" );
			
			// u
			poses[pose_u] =Utilities.createImageIcon( "default/u.png" );
			
			// q, w
			poses[pose_w] =Utilities.createImageIcon( "default/wq.png" );
			poses[pose_q] = poses[pose_w];
			
			// set the phoneme list
			Object defaultList[] = { "<none>", "A", "B", "C", "Closed", "D", "E", "F", "G", "I", "K", "L", 
                "M", "N", "O", "P", "Q", "R", "S", "SH", "T", "TH", "U", "V", "W" };
			phonemes = defaultList;

		} else if (faces.equals("toon")) {			
				// a, i
				poses[pose_a] = Utilities.createImageIcon( "toon/ai.gif" );
				poses[pose_i] = poses[pose_a];

				// e
				poses[pose_e] =Utilities.createImageIcon( "toon/e.gif" );
				
				// c, g, k, n, r, s, t
				poses[pose_c] =Utilities.createImageIcon( "toon/cdgk.gif" );
				poses[pose_g] = poses[pose_c];
				poses[pose_k] = poses[pose_c];
				poses[pose_n] = poses[pose_c];
				poses[pose_r] = poses[pose_c];
				poses[pose_s] = poses[pose_c];
				poses[pose_t] = poses[pose_c];
				
				// closed
				poses[pose_rest] =Utilities.createImageIcon( "toon/closed.gif" );
				
				// d
				poses[pose_d] =Utilities.createImageIcon( "toon/d.gif" );
				
				// e
				poses[pose_e] =Utilities.createImageIcon( "toon/e.gif" );
				
				// f, v
				poses[pose_f] =Utilities.createImageIcon( "toon/fv.gif" );
				poses[pose_v] = poses[pose_f];
				
				// l
				poses[pose_l] =Utilities.createImageIcon( "toon/l.gif" );
				
				// th
				poses[pose_th] =Utilities.createImageIcon( "toon/th.gif" );
				
				// m, b, p
				poses[pose_m] =Utilities.createImageIcon( "toon/mbp.gif" );
				poses[pose_b] = poses[pose_m];
				poses[pose_p] = poses[pose_m];
				
				// o
				poses[pose_o] =Utilities.createImageIcon( "toon/o.gif" );
				
				// u
				poses[pose_u] =Utilities.createImageIcon( "toon/u.gif" );
				
				// q, w
				poses[pose_w] =Utilities.createImageIcon( "toon/wq.gif" );
				poses[pose_q] = poses[pose_w];
				
				// set the phoneme list
				Object toonList[] = { "<none>", "A", "B", "C", "CH", "Closed", "D", "E", "F", "G", "I", "K", "L", 
	                "M", "N", "O", "P", "Q", "R", "S", "SH", "T", "TH", "U", "V", "W" };
				phonemes = toonList;
			
			
	} else if (faces.equals("wally")) {
			// rest
			poses[pose_rest] = Utilities.createImageIcon( "wally/rest.gif" );
			
			// a, i
			poses[pose_a] =Utilities.createImageIcon( "wally/ai.gif" );
			poses[pose_i] = poses[pose_a];

			// e
			poses[pose_e] =Utilities.createImageIcon( "wally/e.gif" );
			
			// g, t, c, k, r, s, u
			poses[pose_g] = Utilities.createImageIcon( "wally/etc.gif" );
			poses[pose_t] = poses[pose_g];
			poses[pose_c] = poses[pose_g];
			poses[pose_j] = poses[pose_g];
			poses[pose_k] = poses[pose_g];
			poses[pose_r] = poses[pose_g];
			poses[pose_s] = poses[pose_g];
			poses[pose_u] = poses[pose_g];

			// f, v
			poses[pose_f] =Utilities.createImageIcon( "wally/fv.gif" );
			poses[pose_v] = poses[pose_f];

			// l
			poses[pose_l] =Utilities.createImageIcon( "wally/l.gif" );
			poses[pose_n] = poses[pose_l];
			poses[pose_d] = poses[pose_l];
			
			// m, b, p
			poses[pose_b] =Utilities.createImageIcon( "wally/mbp.gif" );
			poses[pose_m] = poses[pose_b];
			poses[pose_p] = poses[pose_b];

			// o
			poses[pose_o] =Utilities.createImageIcon( "wally/o.gif" );

			// w, q
			poses[pose_w] =Utilities.createImageIcon( "wally/wq.gif" );
			poses[pose_q] = poses[pose_w];
			
			// set the phomene list
			Object wally[] =  { "<none>", "A", "B", "C", "Closed", "D", "E", "F", "G", "I", "J", "K", "L", 
				"M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W" };
			phonemes = wally;

			
		} else if (faces.equals("blair")) {
			// rest
			poses[pose_rest] = Utilities.createImageIcon( "blair/rest.gif" );
			
			// a, i
			poses[pose_a] =Utilities.createImageIcon( "blair/ai.gif" );
			poses[pose_i] = poses[pose_a];

			// e
			poses[pose_e] =Utilities.createImageIcon( "blair/e.gif" );
			
			// g, t, c, k, r, s, u
			poses[pose_g] = Utilities.createImageIcon( "blair/etc.gif" );
			poses[pose_t] = poses[pose_g];
			poses[pose_c] = poses[pose_g];
			poses[pose_j] = poses[pose_g];
			poses[pose_k] = poses[pose_g];
			poses[pose_r] = poses[pose_g];
			poses[pose_s] = poses[pose_g];
			poses[pose_u] = poses[pose_g];

			// f, v
			poses[pose_f] =Utilities.createImageIcon( "blair/fv.gif" );
			poses[pose_v] = poses[pose_f];

			// l
			poses[pose_l] =Utilities.createImageIcon( "blair/ldth.gif" );
			poses[pose_n] = poses[pose_l];
			poses[pose_d] = poses[pose_l];
			poses[pose_th] = poses[pose_l];
			
			// m, b, p
			poses[pose_b] =Utilities.createImageIcon( "blair/mbp.gif" );
			poses[pose_m] = poses[pose_b];
			poses[pose_p] = poses[pose_b];

			// o
			poses[pose_o] =Utilities.createImageIcon( "blair/o.gif" );

			// w, q
			poses[pose_w] =Utilities.createImageIcon( "blair/wq.gif" );
			poses[pose_q] = poses[pose_w];

			// u
			poses[pose_u] =Utilities.createImageIcon( "blair/u.gif" );			

			// set the phonemes list
			Object blair[] =  { "<none>", "A", "B", "C", "D", "E", "F", "G", "I", "J", "K", "L", 
				"M", "N", "O", "P", "Q", "R", "S", "T", "TH", "U", "V", "W" };
			phonemes = blair;

		} else if (faces.equals("extended")) {
			// rest
			poses[pose_rest] = Utilities.createImageIcon( "extended/rest.jpg" );

			// a, i
			poses[pose_a] =Utilities.createImageIcon( "extended/ai.jpg" );
			poses[pose_i] = poses[pose_a];

			// e
			poses[pose_e] =Utilities.createImageIcon( "extended/e.jpg" );
			
			// c, d, g, k, n, r, s, y, z
			poses[pose_c] = Utilities.createImageIcon( "extended/etc.jpg" );
			poses[pose_d] = poses[pose_c];
			poses[pose_g] = poses[pose_c];
			poses[pose_k] = poses[pose_c];
			poses[pose_n] = poses[pose_c];
			poses[pose_r] = poses[pose_c];
			poses[pose_s] = poses[pose_c];
			poses[pose_y] = poses[pose_c];
			poses[pose_z] = poses[pose_c];

			// f, v
			poses[pose_f] =Utilities.createImageIcon( "extended/fv.jpg" );
			poses[pose_v] = poses[pose_f];

			// j, ch, sh
			poses[pose_j] =Utilities.createImageIcon( "extended/jchsh.jpg" );
			poses[pose_ch] = poses[pose_j];
			poses[pose_sh] = poses[pose_j];			

			// l
			poses[pose_l] =Utilities.createImageIcon( "extended/l.jpg" );
			poses[pose_t] = poses[pose_l];
			
			// m, b, p
			poses[pose_b] =Utilities.createImageIcon( "extended/mbp.jpg" );
			poses[pose_m] = poses[pose_b];
			poses[pose_p] = poses[pose_b];

			// o
			poses[pose_o] =Utilities.createImageIcon( "extended/o.jpg" );

			// th
			poses[pose_th] =Utilities.createImageIcon( "extended/th.jpg" );

			// w, q
			poses[pose_w] =Utilities.createImageIcon( "extended/wq.jpg" );
			poses[pose_q] = poses[pose_w];

			// u
			poses[pose_u] =Utilities.createImageIcon( "extended/u.jpg" );			

			// set the phonemes list
			Object extended[] =  { "<none>", "A", "B", "C", "CH", "D", "E", "F", "G", "I", "J", "K", "L", 
                "M", "N", "O", "P", "Q", "R", "S", "SH", "T", "TH", "U", "V", "W", "Z" };
			phonemes = extended;

		} else if (faces.equals("clay")) {			
				// a, i
				poses[pose_a] = Utilities.createImageIcon( "clay/ai.gif" );
				poses[pose_i] = poses[pose_a];

				// c, e, g, k, n, r, s, t
				poses[pose_c] =Utilities.createImageIcon( "clay/cdgk.gif" );
				poses[pose_e] = poses[pose_c];
				poses[pose_g] = poses[pose_c];
				poses[pose_k] = poses[pose_c];
				poses[pose_n] = poses[pose_c];
				poses[pose_r] = poses[pose_c];
				poses[pose_s] = poses[pose_c];
				poses[pose_t] = poses[pose_c];
				
				// closed
				poses[pose_rest] =Utilities.createImageIcon( "clay/closed.gif" );
				
				// d
				poses[pose_d] =Utilities.createImageIcon( "clay/d.gif" );
				
				// e
				poses[pose_e] =Utilities.createImageIcon( "clay/e.gif" );
				
				// f, v
				poses[pose_f] =Utilities.createImageIcon( "clay/fv.gif" );
				poses[pose_v] = poses[pose_f];
				
				// l, th
				poses[pose_l] =Utilities.createImageIcon( "clay/lth.gif" );
				poses[pose_th] = poses[pose_l];
				
				// m, b, p
				poses[pose_m] =Utilities.createImageIcon( "clay/mbp.gif" );
				poses[pose_b] = poses[pose_m];
				poses[pose_p] = poses[pose_m];
				
				// o
				poses[pose_o] =Utilities.createImageIcon( "clay/o.gif" );
				
				// u
				poses[pose_u] =Utilities.createImageIcon( "clay/u.gif" );
				
				// q, w
				poses[pose_w] =Utilities.createImageIcon( "clay/wq.gif" );
				poses[pose_q] = poses[pose_w];
				
				// set the phoneme list
				Object defaultList[] = { "<none>", "A", "B", "C", "Closed", "D", "E", "F", "G", "I", "K", "L", 
	                "M", "N", "O", "P", "Q", "R", "S", "SH", "T", "TH", "U", "V", "W" };
				phonemes = defaultList;

			
		}

		// create small versions of the icons
		for (int i = 0; i < 30; i++ ) {
			// get a pose
			ImageIcon pose = poses[i];
			
			// null?
			if (pose == null) {
				// set small version to null
				smallPoses[i] = null;
			} else {
				// create a scaled version of the pose
				smallPoses[i] = Utilities.createScaledImageIcon(pose);
			}
		}
		
		// create a border
        setBorder(BorderFactory.createLineBorder(Color.black));
		
		// set to empty face
		setFace( "Closed" );
		
		
	}


    public int getFaceIndex( String s ) {
        
        int faceIndex = -1;
        
		if ( s.equals("<none>") ) 			faceIndex = pose_rest;
        else if (s.equals("Closed"))        faceIndex = pose_rest;
		else if (s.equals("A")) 			faceIndex = pose_a;
		else if (s.equals("B")) 			faceIndex = pose_b;
		else if (s.equals("C")) 			faceIndex = pose_c;
        else if (s.equals("CH"))            faceIndex = pose_ch;
		else if (s.equals("D")) 			faceIndex = pose_d;
		else if (s.equals("E")) 			faceIndex = pose_e;
		else if (s.equals("F")) 			faceIndex = pose_f;
		else if (s.equals("G")) 			faceIndex = pose_g;		
		else if (s.equals("I")) 			faceIndex = pose_i;
		else if (s.equals("J")) 			faceIndex = pose_j;
		else if (s.equals("K")) 			faceIndex = pose_k;
		else if (s.equals("L")) 			faceIndex = pose_l;
		else if (s.equals("M")) 			faceIndex = pose_m;
		else if (s.equals("N")) 			faceIndex = pose_n;
		else if (s.equals("O")) 			faceIndex = pose_o;
		else if (s.equals("P")) 			faceIndex = pose_p;
		else if (s.equals("Q")) 			faceIndex = pose_q;
		else if (s.equals("R")) 			faceIndex = pose_r;
		else if (s.equals("S")) 			faceIndex = pose_s;
        else if (s.equals("SH"))            faceIndex = pose_sh;
		else if (s.equals("T")) 			faceIndex = pose_t;
        else if (s.equals("TH"))            faceIndex = pose_th;
		else if (s.equals("U")) 			faceIndex = pose_u;
		else if (s.equals("V")) 			faceIndex = pose_v;
        else if (s.equals("W"))             faceIndex = pose_w;
		else if (s.equals("Y")) 			faceIndex = pose_y;
		else if (s.equals("Z")) 			faceIndex = pose_z;
		
		return faceIndex;
    }
    
    // get the icon for a face
    public ImageIcon getFace( String s ) {
    	int faceIndex = getFaceIndex( s );

        // return a face
        if (faceIndex == -1) {
            return null;
        } else {
            return poses[faceIndex];
        }

    }

    // get the small icon for a face
    public ImageIcon getSmallFace( String s ) {
    	int faceIndex = getFaceIndex( s );

        // return a face
        if (faceIndex == -1) {
            return null;
        } else {
            return smallPoses[faceIndex];
        }
    }
    
    // set the proper face
    public void setFace( String s ) {
        // set icon
        ImageIcon icon = getFace( s );
        if (icon != null) {
            setIcon( icon );
            repaint();
        }
    }
}

