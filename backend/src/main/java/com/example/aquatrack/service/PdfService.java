package com.example.aquatrack.service;

import com.example.aquatrack.model.Invoice;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public byte[] generateInvoicePdf(Invoice invoice) {
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD, java.awt.Color.DARK_GRAY);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, new java.awt.Color(11, 91, 102));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, java.awt.Color.WHITE);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, java.awt.Color.BLACK);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, java.awt.Color.BLACK);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.ITALIC, java.awt.Color.GRAY);

            // Title Header
            Paragraph title = new Paragraph("AQUATRACK WATER BILL", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(25);
            document.add(title);

            // Metadata block (Invoice ID, Bill Date, Period, Status)
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String billDate = invoice.getCreatedAt() != null ? invoice.getCreatedAt().format(formatter) : "N/A";
            String startDate = invoice.getBillingCycle().getStartDate().toString();
            String endDate = invoice.getBillingCycle().getEndDate().toString();

            metaTable.addCell(createNoBorderCell("Invoice ID: " + invoice.getId(), boldFont, Element.ALIGN_LEFT));
            metaTable.addCell(createNoBorderCell("Billing Date: " + billDate, regularFont, Element.ALIGN_RIGHT));
            metaTable.addCell(createNoBorderCell("Billing Period: " + startDate + " to " + endDate, regularFont, Element.ALIGN_LEFT));
            metaTable.addCell(createNoBorderCell("Status: " + invoice.getStatus().name(), boldFont, Element.ALIGN_RIGHT));

            document.add(metaTable);

            // Colored Horizontal Divider
            PdfPTable lineDivider = new PdfPTable(1);
            lineDivider.setWidthPercentage(100);
            PdfPCell lineCell = new PdfPCell();
            lineCell.setBorder(Rectangle.BOTTOM);
            lineCell.setBorderWidth(1.5f);
            lineCell.setBorderColor(new java.awt.Color(11, 91, 102));
            lineCell.setPadding(0);
            lineDivider.addCell(lineCell);
            lineDivider.setSpacingAfter(15);
            document.add(lineDivider);

            // Address & Apartment Details Section
            Paragraph sectionTitle = new Paragraph("APARTMENT & HOUSEHOLD DETAILS", sectionTitleFont);
            sectionTitle.setSpacingAfter(10);
            document.add(sectionTitle);

            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingAfter(20);
            float[] columnWidths = {30f, 70f};
            detailsTable.setWidths(columnWidths);

            detailsTable.addCell(createNoBorderCell("Apartment Name:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getApartment().getName(), regularFont, Element.ALIGN_LEFT));

            detailsTable.addCell(createNoBorderCell("Address:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getApartment().getAddress(), regularFont, Element.ALIGN_LEFT));

            detailsTable.addCell(createNoBorderCell("Flat Number:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getFlatNumber(), regularFont, Element.ALIGN_LEFT));

            detailsTable.addCell(createNoBorderCell("Flat Size:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getFlatSize().toString() + " sqft", regularFont, Element.ALIGN_LEFT));

            detailsTable.addCell(createNoBorderCell("Occupancy:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(String.valueOf(invoice.getHousehold().getOccupancy()) + " Resident(s)", regularFont, Element.ALIGN_LEFT));

            document.add(detailsTable);

            // Divider
            document.add(lineDivider);

            // Bill Breakdown Details Table
            Paragraph chargesTitle = new Paragraph("CHARGES BREAKDOWN", sectionTitleFont);
            chargesTitle.setSpacingAfter(10);
            document.add(chargesTitle);

            PdfPTable chargesTable = new PdfPTable(2);
            chargesTable.setWidthPercentage(100);
            chargesTable.setSpacingAfter(30);
            float[] chargesColWidths = {60f, 40f};
            chargesTable.setWidths(chargesColWidths);

            // Headers
            PdfPCell descHeader = new PdfPCell(new Phrase("Description", headerFont));
            descHeader.setBackgroundColor(new java.awt.Color(11, 91, 102));
            descHeader.setPadding(8);
            descHeader.setHorizontalAlignment(Element.ALIGN_LEFT);
            chargesTable.addCell(descHeader);

            PdfPCell valueHeader = new PdfPCell(new Phrase("Amount / Value", headerFont));
            valueHeader.setBackgroundColor(new java.awt.Color(11, 91, 102));
            valueHeader.setPadding(8);
            valueHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            chargesTable.addCell(valueHeader);

            // Water usage
            chargesTable.addCell(createBorderedCell("Water Usage (Liters)", regularFont, Element.ALIGN_LEFT, 6));
            chargesTable.addCell(createBorderedCell(invoice.getWaterUsage().toString() + " L", regularFont, Element.ALIGN_RIGHT, 6));

            // Base charge
            chargesTable.addCell(createBorderedCell("Base Usage Charge", regularFont, Element.ALIGN_LEFT, 6));
            chargesTable.addCell(createBorderedCell("INR " + invoice.getBaseCharge().toString(), regularFont, Element.ALIGN_RIGHT, 6));

            // Adjustments
            chargesTable.addCell(createBorderedCell("Adjustments", regularFont, Element.ALIGN_LEFT, 6));
            chargesTable.addCell(createBorderedCell("INR " + invoice.getAdjustments().toString(), regularFont, Element.ALIGN_RIGHT, 6));

            // Total Due
            PdfPCell totalLabel = new PdfPCell(new Phrase("Total Bill Amount Due", boldFont));
            totalLabel.setBackgroundColor(new java.awt.Color(240, 240, 240));
            totalLabel.setPadding(10);
            totalLabel.setHorizontalAlignment(Element.ALIGN_LEFT);
            chargesTable.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Phrase("INR " + invoice.getTotal().toString(), boldFont));
            totalVal.setBackgroundColor(new java.awt.Color(240, 240, 240));
            totalVal.setPadding(10);
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            chargesTable.addCell(totalVal);

            document.add(chargesTable);

            // Footer
            Paragraph footer1 = new Paragraph("Thank you for using AquaTrack Water Management Platform.", footerFont);
            footer1.setAlignment(Element.ALIGN_CENTER);
            footer1.setSpacingAfter(4);
            document.add(footer1);

            Paragraph footer2 = new Paragraph("Please pay your bill online before the due date to avoid service disruptions.", footerFont);
            footer2.setAlignment(Element.ALIGN_CENTER);
            document.add(footer2);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private PdfPCell createNoBorderCell(String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }

    private PdfPCell createBorderedCell(String text, Font font, int alignment, float padding) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorderColor(new java.awt.Color(220, 220, 220));
        cell.setPadding(padding);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }
}
