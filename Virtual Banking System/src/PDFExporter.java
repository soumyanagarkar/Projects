//import com.itextpdf.kernel.pdf.PdfDocument;
//import com.itextpdf.kernel.pdf.PdfWriter;
//import com.itextpdf.layout.Document;
//import com.itextpdf.layout.element.Paragraph;
//import com.itextpdf.layout.element.Table;
//import com.itextpdf.layout.element.Cell;
//
//import javax.swing.*;
//import javax.swing.table.DefaultTableModel;
//import java.io.File;
//import java.io.IOException;
//
//public class PDFExporter {
//
//    public static void exportToPDF(DefaultTableModel tableModel, String filePath) {
//        try {
//            PdfWriter writer = new PdfWriter(filePath);
//            PdfDocument pdf = new PdfDocument(writer);
//            Document document = new Document(pdf);
//
//            // Add title
//            document.add(new Paragraph("Passbook Transactions").setBold().setFontSize(20));
//
//            // Create a table with the same number of columns as the table model
//            Table table = new Table(tableModel.getColumnCount());
//
//            // Add column headers
//            for (int i = 0; i < tableModel.getColumnCount(); i++) {
//                table.addHeaderCell(new Cell().add(tableModel.getColumnName(i)));
//            }
//
//            // Add rows
//            for (int i = 0; i < tableModel.getRowCount(); i++) {
//                for (int j = 0; j < tableModel.getColumnCount(); j++) {
//                    table.addCell(new Cell().add(tableModel.getValueAt(i, j).toString()));
//                }
//            }
//
//            document.add(table);
//            document.close();
//            JOptionPane.showMessageDialog(null, "PDF saved successfully to " + filePath);
//        } catch (IOException e) {
//            JOptionPane.showMessageDialog(null, "Error saving PDF: " + e.getMessage());
//        }
//    }
//}
