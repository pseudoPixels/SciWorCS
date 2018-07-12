// About.java
// About Dialog
//
// from JPatch: http://www.jpatch.com
// (c) 2005 Sascha Ledinsky
// Released under GPL

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.border.*;

public class About extends JDialog implements ActionListener {
	private JTabbedPane tabbedPane = new JTabbedPane();
	
	private JScrollPane paneAbout;
	private JScrollPane paneLicense;
	// private JScrollPane pane3rdParty;
	private JScrollPane paneThanks;

	private String strAbout;
	private String strThanks;
	// private String str3rdParty;
	private String strLicense;

	private JButton buttonOK = new JButton("OK",new ImageIcon(getClass().getClassLoader().getResource("images/ok.gif")));
	
	public About(Frame owner, String version ) {
		super(owner, "About JLipSync...", true);

		strAbout = 		"JLipSync " + version + "\n\n";
		strAbout += 	"Original developer:\t David Cuny                               \n";
		strAbout += 	"Additional programming:\t David Lamhauge                       \n";
		strAbout += 	"Copyright 2009                                               \n\n\n";
		strAbout +=		"Released under Q Public License                              \n";
		strAbout +=		"    http://JLipSync.sourceforge.net                          \n\n";
		strAbout +=		"Based on the shareware program \"Magpie\" by Miguel Grinberg \n";
		strAbout +=		"    http://www.thirdwishsoftware.com                          \n\n";
		
		
		strThanks =		"Thanks to:                                                             \n\n";
		strThanks +=	"    Miguel Grinberg                                                    \n";
		strThanks +=    "    Sascha Ledinsky                                                    \n";
		strThanks +=	"    Elaine Reali                                  						\n";
		strThanks +=    "    SourceForge.net                                                    \n";
		strThanks +=    "    Myles Strous                                                       \n";

		StringBuffer sbLicense = new StringBuffer();
		sbLicense.append("The Q Public License Version 1.0												\n");
		sbLicense.append("																				\n");
		sbLicense.append("Copyright (C) 1999 Trolltech AS, Norway.										\n");
		sbLicense.append("Everyone is permitted to copy and distribute this license document.			\n");
		sbLicense.append("																				\n");
		sbLicense.append("The intent of this license is to establish freedom to share and change the 	\n");
        sbLicense.append("software regulated by this license under the open source model.               \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("This license applies to any software containing a notice placed by the        \n");
        sbLicense.append("copyright holder saying that it may be distributed under the terms of the     \n");
        sbLicense.append("Q Public License version 1.0. Such software is herein referred to as the      \n");
        sbLicense.append("Software. This license covers modification and distribution of the Software,  \n");
        sbLicense.append("use of third-party application programs based on the Software, and            \n");
        sbLicense.append("development of free software which uses the Software.                         \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("Granted Rights                                                                \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("1. You are granted the non-exclusive rights set forth in this license         \n");
        sbLicense.append("provided you agree to and comply with any and all conditions in this license. \n");
        sbLicense.append("Whole or partial distribution of the Software, or software items that link    \n");
        sbLicense.append("with the Software, in any form signifies acceptance of this license.          \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("2. You may copy and distribute the Software in unmodified form provided that  \n");
        sbLicense.append("the entire package, including - but not restricted to - copyright, trademark  \n");
        sbLicense.append("notices and disclaimers, as released by the initial developer of the Software,\n"); 
        sbLicense.append("is distributed.                                                               \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("3. You may make modifications to the Software and distribute your             \n");
        sbLicense.append("modifications, in a form that is separate from the Software, such as patches. \n");
        sbLicense.append("The following restrictions apply to modifications:                            \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("a. Modifications must not alter or remove any copyright notices in the        \n");
        sbLicense.append("Software.                                                                     \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("    b. When modifications to the Software are released under this license, a  \n");
        sbLicense.append("  non-exclusive royalty-free right is granted to the initial developer of     \n");
        sbLicense.append("  the Software to distribute your modification in future versions of the      \n");
        sbLicense.append("  Software provided such versions remain available under these terms in       \n");
        sbLicense.append("  addition to any other license(s) of the initial developer.                  \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("4. You may distribute machine-executable forms of the Software or machine-    \n");
        sbLicense.append("  executable forms of modified versions of the Software, provided that you    \n");
        sbLicense.append("  meet these restrictions:                                                    \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("    a. You must include this license document in the distribution.            \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("    b. You must ensure that all recipients of the machine-executable forms    \n");
        sbLicense.append("  are also able to receive the complete machine-readable source code to       \n");
        sbLicense.append("  the distributed Software, including all modifications, without any charge   \n");
        sbLicense.append("  beyond the costs of data transfer, and place prominent notices in the       \n");
        sbLicense.append("  distribution explaining this.                                               \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("    c. You must ensure that all modifications included in the machine-        \n");
        sbLicense.append("  executable forms are available under the terms of this license.             \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("5. You may use the original or modified versions of the Software to compile,  \n");
        sbLicense.append("link and run application programs legally developed by you or by others.      \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("6. You may develop application programs, reusable components and other        \n");
        sbLicense.append("software items that link with the original or modified versions of the        \n");
        sbLicense.append("Software. These items, when distributed, are subject to the following         \n");
        sbLicense.append("requirements:                                                                 \n"); 
        sbLicense.append("                                                                              \n");
        sbLicense.append("    a. You must ensure that all recipients of machine-executable forms of     \n");
        sbLicense.append("  these items are also able to receive and use the complete machine-readable  \n");
        sbLicense.append("  source code to the items without any charge beyond the costs of data        \n");
        sbLicense.append("  transfer.                                                                   \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("    b. You must explicitly license all recipients of your items to use and    \n");
        sbLicense.append("  re-distribute original and modified versions of the items in both machine-  \n");
        sbLicense.append("  executable and source code forms. The recipients must be able to do so      \n");
        sbLicense.append("  without any charges whatsoever, and they must be able to re-distribute      \n");
        sbLicense.append("  to anyone they choose.                                                      \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("    c. If the items are not available to the general public, and the initial  \n");
        sbLicense.append("  developer of the Software requests a copy of the items, then you must       \n");
        sbLicense.append("  supply one.                                                                 \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("Limitations of Liability                                                      \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("In no event shall the initial developers or copyright holders be liable for   \n");
        sbLicense.append("any damages whatsoever, including - but not restricted to - lost revenue or   \n");
        sbLicense.append("profits or other direct, indirect, special, incidental or consequential       \n");
        sbLicense.append("damages, even if they have been advised of the possibility of such damages,   \n");
        sbLicense.append("except to the extent invariable law, if any, provides otherwise.              \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("No Warranty                                                                   \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("The Software and this license document are provided AS IS with NO WARRANTY    \n");
        sbLicense.append("OF ANY KIND, INCLUDING THE WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS    \n");
        sbLicense.append("FOR A PARTICULAR PURPOSE.                                                     \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("Choice of Law                                                                 \n");
        sbLicense.append("                                                                              \n");
        sbLicense.append("This license is governed by the Laws of Norway. Disputes shall be settled     \n");
        sbLicense.append("by Oslo City Court.                                                           \n");
		
		strLicense = sbLicense.toString();
		
		JTextArea taAbout = new JTextArea(strAbout);
		JTextArea taLicense = new JTextArea(strLicense);
		// JTextArea ta3rdParty = new JTextArea(str3rdParty);
		JTextArea taThanks = new JTextArea(strThanks);
		
		taAbout.setEditable(false);
		taLicense.setEditable(false);
		// ta3rdParty.setEditable(false);
		taThanks.setEditable(false);
		
		taAbout.setBorder(new EmptyBorder(5,5,5,5));
		taLicense.setBorder(new EmptyBorder(5,5,5,5));
		// ta3rdParty.setBorder(new EmptyBorder(5,5,5,5));
		taThanks.setBorder(new EmptyBorder(5,5,5,5));
		
		taAbout.setFont(new Font("SansSerif",Font.BOLD,12));
		taLicense.setFont(new Font("Monospaced",Font.PLAIN,12));
		//ta3rdParty.setFont(new Font("SansSerif",Font.BOLD,12));
		// taThanks.setFont(new Font("SansSerif",Font.BOLD,14));
		
		paneAbout = new JScrollPane(taAbout);
		paneLicense = new JScrollPane(taLicense);
		//pane3rdParty = new JScrollPane(ta3rdParty);
		paneThanks = new JScrollPane(taThanks);
		
		tabbedPane.addTab("About",paneAbout);
		tabbedPane.addTab("License",paneLicense);
		//tabbedPane.addTab("3rd party software",pane3rdParty);
		tabbedPane.addTab("Thanks",paneThanks);
		
		JPanel panel = new JPanel();
		panel.add(buttonOK);
		buttonOK.addActionListener(this);
		getContentPane().setLayout(new BorderLayout());
		getContentPane().add(tabbedPane,BorderLayout.CENTER);
		getContentPane().add(panel,BorderLayout.SOUTH);
		//getContentPane().add(new ImagePane(new ImageIcon(ClassLoader.getSystemResource("jpatch/images/jpatch.png"))),BorderLayout.WEST);
		setSize(640,480);
		setLocationRelativeTo(owner);
        setVisible(true);
	}
	
	class ImagePane extends JPanel {
		private ImageIcon icon;
		private ImagePane(ImageIcon icon) {
			this.icon = icon;
			Dimension dim = new Dimension(icon.getIconWidth() + 10,icon.getIconHeight() + 10);
			setPreferredSize(dim);
		}
		@Override
		public void paint(Graphics g) {
			icon.paintIcon(this, g,5,getHeight() - icon.getIconHeight() - 5);
		}
	}
	
	public void actionPerformed(ActionEvent actionEvent) {
		if (actionEvent.getSource() == buttonOK) {
			setVisible(false);
			dispose();
		}
	}
}
