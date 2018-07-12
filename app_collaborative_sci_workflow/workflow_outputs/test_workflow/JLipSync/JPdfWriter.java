/** JPdfWriter.java
 * Generates Timesheet/xsheet PDF-file
 *
 * (c) 2009 David Lamhauge
 * http://jlipsync.lamhauge.dk
 * Released under Qt Public License
 */

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;

import java.awt.event.ActionEvent;
import javax.swing.JOptionPane;

import com.lowagie.text.BadElementException;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfContentByte;

public class JPdfWriter{

    // pdf = Letter or A4
    // w = Path to file. Filename included
    void JPdf(TimeSheet t, String pdf, String w){
        String s = "";

        //  JOptionPane.showMessageDialog(null, w);

        Document document = new Document();
        BaseFont bf = FontFactory.getFont(FontFactory.COURIER).getCalculatedBaseFont(false);
        Integer framesRest = t.frameCount;
        Integer pageNo = 1;
        try {
            PdfWriter writer = PdfWriter.getInstance(document,
                    new FileOutputStream(w + ".pdf"));
            if (pdf.equalsIgnoreCase("A4"))
                document.setPageSize(PageSize.A4);
            else {
                document.setPageSize(PageSize.LETTER);
            }
            document.open();
            PdfContentByte pc = writer.getDirectContent();
            //In case of more than one page
            while (framesRest > 0) {
                framesRest = framesRest - 50;
                // draw rectangle that fits both Letter and A4
                pc.rectangle(30, 30, 530, 720);
                int i;
                // draw 50 lines
                for (i=1;i<=50;i++){
                    pc.moveTo( 30, 18 + i*12);
                    pc.lineTo(560, 18 + i*12);
                    pc.stroke();
                    }
                // Draw numbers and Mouths
                for (i=1;i<=50;i++){
                    Integer actualFr = i + (50 * (pageNo - 1));
                    s = Integer.toString(actualFr);
                    pc.beginText();
                    pc.setFontAndSize(bf, 9);
                    pc.showTextAligned(PdfContentByte.ALIGN_LEFT, s
                            , 200 , 632 - i*12, 0);
                    if (actualFr <= t.frameCount)
                    pc.showTextAligned(PdfContentByte.ALIGN_LEFT, t.mouth[actualFr - 1]
                            , 230 , 632 - i*12, 0);
/*                    if (t.comment[actualFr - 1].length() > 0)
                    pc.showTextAligned(PdfContentByte.ALIGN_RIGHT, t.comment[actualFr - 1]
                            , 196 , 632 - i*12, 0); */
                    pc.endText();
                    
                    }
                // draw vertical lines
                for (i=1; i<=9;i++){
                    pc.moveTo(176 + i*24, 30);
                    pc.lineTo(176 + i*24, 654);
                    pc.stroke();
                    }
                // write text
                pc.beginText();
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"Animator:"  , 36 , 740, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"Scene:"     , 400, 740, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"Seq:"       , 480, 740, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"Production:", 36 , 715, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"Length:"    , 400, 715, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"Page:"      , 480, 715, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"Notes:"     , 36 , 690, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"ACTION", 120, 640, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"#"     , 210, 640, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"dial"  , 224, 640, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"BG"    , 374, 640, 0);
                pc.showTextAligned(PdfContentByte.ALIGN_LEFT,"CAMERA", 464, 640, 0);
                pc.endText();
                // draw the thick lines
                pc.setLineWidth(2);
                pc.moveTo( 30, 630 );
                pc.lineTo(560, 630 );
                pc.stroke();
                pc.moveTo( 30, 654 );
                pc.lineTo(560, 654 );
                pc.stroke();
                pc.moveTo( 30, 702 );
                pc.lineTo(560, 702 );
                pc.stroke();
/*                // put in image
                try {
                    Image img = Image.getInstance(t.pdfLogo);
                    img.setAbsolutePosition(490, 660);
                    img.scaleAbsolute(60, 40);
                    pc.addImage(img);
                } catch  (BadElementException be) {
                    System.err.println(be.getMessage());
                } catch (MalformedURLException mu) {
                    System.err.println(mu.getMessage());
                } catch (IOException ioe) {
                    System.err.println(ioe.getMessage());
                }
*/
                // new page ?
                pageNo = pageNo + 1;
                if (framesRest > 0) document.newPage();
                }
            } catch (DocumentException de) {
            System.err.println(de.getMessage());
        } catch (IOException ioe) {
            System.err.println(ioe.getMessage());
        }
//        JOptionPane.showMessageDialog(null, s);
        document.close();
    }
    public String actionPerformed(ActionEvent e) {
        String s = e.getActionCommand();
        return s;
    }


    public void pdfWriteHeader(){
    }
}

