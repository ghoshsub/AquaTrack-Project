package com.example.aquatrack.service;

import com.example.aquatrack.model.Invoice;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final java.awt.Color BRAND_TEAL  = new java.awt.Color(11, 91, 102);
    private static final java.awt.Color BRAND_GREEN = new java.awt.Color(16, 185, 129);
    private static final java.awt.Color LIGHT_GRAY  = new java.awt.Color(240, 240, 240);
    private static final java.awt.Color WHITE       = java.awt.Color.WHITE;
    private static final java.awt.Color DARK_GRAY   = java.awt.Color.DARK_GRAY;
    private static final java.awt.Color BORDER_GRAY = new java.awt.Color(220, 220, 220);

    public byte[] generateInvoicePdf(Invoice invoice) {
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            boolean isPaid = invoice.getStatus() == Invoice.Status.PAID;

            // ── Fonts ─────────────────────────────────────────────────────────
            Font titleFont        = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD, DARK_GRAY);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, BRAND_TEAL);
            Font headerFont       = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, WHITE);
            Font boldFont         = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, java.awt.Color.BLACK);
            Font regularFont      = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, java.awt.Color.BLACK);
            Font footerFont       = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.ITALIC, java.awt.Color.GRAY);
            Font receiptLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD, WHITE);
            Font receiptValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, WHITE);
            Font receiptSubFont   = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, WHITE);

            // ── Title ─────────────────────────────────────────────────────────
            String docTitle = isPaid ? "AQUATRACK — PAYMENT RECEIPT" : "AQUATRACK WATER BILL";
            Paragraph title = new Paragraph(docTitle, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(isPaid ? 10 : 25);
            document.add(title);

            // ── PAYMENT CONFIRMED Banner (PAID invoices only) ─────────────────
            if (isPaid) {
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
                String paymentDateStr = invoice.getPaymentDate() != null
                        ? invoice.getPaymentDate().format(dtf) : "N/A";

                PdfPTable banner = new PdfPTable(1);
                banner.setWidthPercentage(100);
                banner.setSpacingAfter(20);
                banner.setSpacingBefore(6);

                PdfPCell confirmedHeader = new PdfPCell(new Phrase("  PAYMENT CONFIRMED", receiptLabelFont));
                confirmedHeader.setBackgroundColor(BRAND_GREEN);
                confirmedHeader.setPadding(10);
                confirmedHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
                confirmedHeader.setBorder(Rectangle.NO_BORDER);
                banner.addCell(confirmedHeader);

                PdfPTable receiptMeta = new PdfPTable(2);
                receiptMeta.setWidthPercentage(100);
                receiptMeta.setWidths(new float[]{50f, 50f});

                java.awt.Color bannerBg = new java.awt.Color(5, 150, 105);
                receiptMeta.addCell(createColorCell("Receipt No:", receiptValueFont, bannerBg, Element.ALIGN_LEFT));
                receiptMeta.addCell(createColorCell(invoice.getReceiptNumber() != null ? invoice.getReceiptNumber() : "-", receiptSubFont, bannerBg, Element.ALIGN_RIGHT));
                receiptMeta.addCell(createColorCell("Transaction ID:", receiptValueFont, bannerBg, Element.ALIGN_LEFT));
                receiptMeta.addCell(createColorCell(invoice.getTransactionId() != null ? invoice.getTransactionId() : "-", receiptSubFont, bannerBg, Element.ALIGN_RIGHT));
                receiptMeta.addCell(createColorCell("Payment Method:", receiptValueFont, bannerBg, Element.ALIGN_LEFT));
                receiptMeta.addCell(createColorCell(invoice.getPaymentMethod() != null ? formatPaymentMethod(invoice.getPaymentMethod()) : "-", receiptSubFont, bannerBg, Element.ALIGN_RIGHT));
                receiptMeta.addCell(createColorCell("Paid On:", receiptValueFont, bannerBg, Element.ALIGN_LEFT));
                receiptMeta.addCell(createColorCell(paymentDateStr, receiptSubFont, bannerBg, Element.ALIGN_RIGHT));

                PdfPCell metaWrapper = new PdfPCell(receiptMeta);
                metaWrapper.setBorder(Rectangle.NO_BORDER);
                metaWrapper.setPadding(0);
                banner.addCell(metaWrapper);

                document.add(banner);
            }

            // ── Meta Table (Invoice ID, Bill Date, Status) ────────────────────
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String billDate  = invoice.getCreatedAt() != null ? invoice.getCreatedAt().format(formatter) : "N/A";
            String startDate = invoice.getBillingCycle().getStartDate().toString();
            String endDate   = invoice.getBillingCycle().getEndDate().toString();

            metaTable.addCell(createNoBorderCell("Invoice ID: #" + invoice.getId(), boldFont, Element.ALIGN_LEFT));
            metaTable.addCell(createNoBorderCell("Bill Date: " + billDate, regularFont, Element.ALIGN_RIGHT));
            metaTable.addCell(createNoBorderCell("Billing Period: " + startDate + " to " + endDate, regularFont, Element.ALIGN_LEFT));
            metaTable.addCell(createNoBorderCell("Status: " + invoice.getStatus().name(), boldFont, Element.ALIGN_RIGHT));
            document.add(metaTable);

            // ── Teal Divider ──────────────────────────────────────────────────
            document.add(buildDivider(BRAND_TEAL));

            // ── Apartment & Household Section ─────────────────────────────────
            Paragraph sectionTitle = new Paragraph("APARTMENT & HOUSEHOLD DETAILS", sectionTitleFont);
            sectionTitle.setSpacingAfter(10);
            document.add(sectionTitle);

            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingAfter(20);
            detailsTable.setWidths(new float[]{30f, 70f});

            detailsTable.addCell(createNoBorderCell("Apartment Name:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getApartment().getName(), regularFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell("Address:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getApartment().getAddress(), regularFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell("Flat Number:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getFlatNumber(), regularFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell("Flat Size:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getFlatSize().toString() + " sqft", regularFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell("Occupancy:", boldFont, Element.ALIGN_LEFT));
            detailsTable.addCell(createNoBorderCell(invoice.getHousehold().getOccupancy() + " Resident(s)", regularFont, Element.ALIGN_LEFT));
            document.add(detailsTable);

            document.add(buildDivider(BRAND_TEAL));

            // ── Charges Breakdown ─────────────────────────────────────────────
            Paragraph chargesTitle = new Paragraph("CHARGES BREAKDOWN", sectionTitleFont);
            chargesTitle.setSpacingAfter(10);
            document.add(chargesTitle);

            PdfPTable chargesTable = new PdfPTable(2);
            chargesTable.setWidthPercentage(100);
            chargesTable.setSpacingAfter(30);
            chargesTable.setWidths(new float[]{60f, 40f});

            PdfPCell descHeader = new PdfPCell(new Phrase("Description", headerFont));
            descHeader.setBackgroundColor(BRAND_TEAL);
            descHeader.setPadding(8);
            descHeader.setHorizontalAlignment(Element.ALIGN_LEFT);
            chargesTable.addCell(descHeader);

            PdfPCell valueHeader = new PdfPCell(new Phrase("Amount / Value", headerFont));
            valueHeader.setBackgroundColor(BRAND_TEAL);
            valueHeader.setPadding(8);
            valueHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            chargesTable.addCell(valueHeader);

            chargesTable.addCell(createBorderedCell("Water Usage (Liters)", regularFont, Element.ALIGN_LEFT, 6));
            chargesTable.addCell(createBorderedCell(invoice.getWaterUsage().toString() + " L", regularFont, Element.ALIGN_RIGHT, 6));
            chargesTable.addCell(createBorderedCell("Base Usage Charge", regularFont, Element.ALIGN_LEFT, 6));
            chargesTable.addCell(createBorderedCell("INR " + invoice.getBaseCharge().toString(), regularFont, Element.ALIGN_RIGHT, 6));
            chargesTable.addCell(createBorderedCell("Adjustments", regularFont, Element.ALIGN_LEFT, 6));
            chargesTable.addCell(createBorderedCell("INR " + invoice.getAdjustments().toString(), regularFont, Element.ALIGN_RIGHT, 6));

            // Total row
            String totalLabel = "Total Bill Amount" + (isPaid ? " (PAID)" : " Due");
            PdfPCell totalLabelCell = new PdfPCell(new Phrase(totalLabel, boldFont));
            totalLabelCell.setBackgroundColor(isPaid ? new java.awt.Color(209, 250, 229) : LIGHT_GRAY);
            totalLabelCell.setPadding(10);
            totalLabelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            chargesTable.addCell(totalLabelCell);

            Font totalValFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD,
                    isPaid ? new java.awt.Color(6, 95, 70) : java.awt.Color.BLACK);
            PdfPCell totalValCell = new PdfPCell(new Phrase("INR " + invoice.getTotal().toString(), totalValFont));
            totalValCell.setBackgroundColor(isPaid ? new java.awt.Color(209, 250, 229) : LIGHT_GRAY);
            totalValCell.setPadding(10);
            totalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            chargesTable.addCell(totalValCell);

            document.add(chargesTable);

            // ── Footer ─────────────────────────────────────────────────────────
            Paragraph footer1 = new Paragraph("Thank you for using AquaTrack Water Management Platform.", footerFont);
            footer1.setAlignment(Element.ALIGN_CENTER);
            footer1.setSpacingAfter(4);
            document.add(footer1);

            String footerMsg = isPaid
                    ? "This is an official payment receipt. Please retain it for your records."
                    : "Please pay your bill online before the due date to avoid service disruptions.";
            Paragraph footer2 = new Paragraph(footerMsg, footerFont);
            footer2.setAlignment(Element.ALIGN_CENTER);
            document.add(footer2);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    // ── Helper Methods ─────────────────────────────────────────────────────────

    private String formatPaymentMethod(String method) {
        if (method == null) return "-";
        switch (method.toUpperCase()) {
            case "CREDIT_CARD": return "Credit Card";
            case "NET_BANKING": return "Net Banking";
            case "UPI":         return "UPI / GPay";
            default:            return method;
        }
    }

    private PdfPTable buildDivider(java.awt.Color color) throws DocumentException {
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorder(Rectangle.BOTTOM);
        lineCell.setBorderWidth(1.5f);
        lineCell.setBorderColor(color);
        lineCell.setPadding(0);
        divider.addCell(lineCell);
        divider.setSpacingAfter(15);
        return divider;
    }

    private PdfPCell createColorCell(String text, Font font, java.awt.Color bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        return cell;
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
        cell.setBorderColor(BORDER_GRAY);
        cell.setPadding(padding);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }
}
