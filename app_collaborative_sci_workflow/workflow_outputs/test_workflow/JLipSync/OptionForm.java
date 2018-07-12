/** OptionForm.java
 * Choose options for pdf-file output
 *
 * (c) 2009 David Lamhauge
 * http://jlipsync.lamhauge.dk
 * Released under Qt Public License
 */

import java.awt.Container;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JRadioButton;
import javax.swing.JTextField;


public class OptionForm {

    JFrame frame    = new JFrame ("Options");
    Container pane  = frame.getContentPane();

    JTextField f1   = new JTextField(30);
    JTextField f2   = new JTextField(30);
    JTextField f3   = new JTextField(30);

    JButton btnFile = new JButton("Find picture file");

    public void openWindow(){
        pane.add(f1);
        pane.add(f2);
        pane.add(f3);
        pane.setVisible(true);


    }

    public String getCompanyName(){
        return f1.getText();
    }

}
