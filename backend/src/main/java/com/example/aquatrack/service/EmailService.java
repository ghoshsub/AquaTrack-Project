package com.example.aquatrack.service;

import com.example.aquatrack.model.Invoice;
import com.example.aquatrack.model.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final PdfService pdfService;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender, PdfService pdfService) {
        this.mailSender = mailSender;
        this.pdfService = pdfService;
    }

    public void sendWelcomeEmail(User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            logger.warn("Skipping welcome email: no email address configured for user {}", user.getUsername());
            return;
        }

        try {
            logger.info("Attempting to send welcome email to {} from {}", user.getEmail(), fromEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to AquaTrack!");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;\">" +
                    "<h2 style=\"color: #0b5b66; text-align: center;\">Welcome to AquaTrack!</h2>" +
                    "<p>Hello <strong>" + user.getUsername() + "</strong>,</p>" +
                    "<p>Thank you for registering an account on AquaTrack — the modern water management and billing platform.</p>" +
                    "<p>With AquaTrack, you can easily:</p>" +
                    "<ul>" +
                    "<li>Track your water consumption.</li>" +
                    "<li>View your billing history and current invoice details.</li>" +
                    "<li>Manage households and flat details dynamically.</li>" +
                    "</ul>" +
                    "<br/>" +
                    "<p><strong>Your Registration Details:</strong></p>" +
                    "<table style=\"width:100%; border-collapse: collapse; margin-bottom: 20px;\">" +
                    "<tr><td style=\"padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;\">Username:</td>" +
                    "<td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">" + user.getUsername() + "</td></tr>" +
                    "<tr><td style=\"padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;\">Role Assigned:</td>" +
                    "<td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">" + user.getRole().name() + "</td></tr>" +
                    "</table>" +
                    "<div style=\"text-align: center; margin: 25px 0;\">" +
                    "<a href=\"http://localhost:5173\" style=\"background-color: #0b5b66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;\">Access Dashboard</a>" +
                    "</div>" +
                    "<p style=\"color: #888888; font-size: 12px; text-align: center;\">If you did not create this account, please ignore this email or contact support.</p>" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Welcome email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    public void sendInvoiceEmail(Invoice invoice, String recipientEmail) {
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            logger.warn("Skipping invoice email: recipient email address is empty.");
            return;
        }

        try {
            logger.info("Attempting to send invoice email to {} from {}", recipientEmail, fromEmail);
            byte[] pdfBytes = pdfService.generateInvoicePdf(invoice);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("[AquaTrack] New Water Bill Generated");

            String monthName = invoice.getBillingCycle().getStartDate().getMonth().name();
            int year = invoice.getBillingCycle().getStartDate().getYear();

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;\">" +
                    "<h2 style=\"color: #0b5b66;\">AquaTrack Water Bill Issued</h2>" +
                    "<p>Hello,</p>" +
                    "<p>Your water bill for <strong>" + monthName + " " + year + "</strong> has been generated and is attached as a PDF to this email.</p>" +
                    "<p><strong>Summary of Bill Details:</strong></p>" +
                    "<ul>" +
                    "<li><strong>Water Usage:</strong> " + invoice.getWaterUsage() + " Liters</li>" +
                    "<li><strong>Base Charge:</strong> INR " + invoice.getBaseCharge() + "</li>" +
                    "<li><strong>Adjustments:</strong> INR " + invoice.getAdjustments() + "</li>" +
                    "<li><strong>Total Bill Amount:</strong> <strong>INR " + invoice.getTotal() + "</strong></li>" +
                    "</ul>" +
                    "<p>Please refer to the attached PDF invoice for detailed breakdown of apartment details and consumption rate tiers.</p>" +
                    "<br/>" +
                    "<p style=\"color: #888888; font-size: 12px;\">Thank you for being part of AquaTrack!</p>" +
                    "</div>";

            helper.setText(htmlContent, true);

            // Attach PDF
            String fileName = "Invoice_" + invoice.getId() + ".pdf";
            helper.addAttachment(fileName, new ByteArrayResource(pdfBytes), "application/pdf");

            mailSender.send(message);
            logger.info("Invoice email sent successfully with attachment to {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send invoice email to {}: {}", recipientEmail, e.getMessage(), e);
        }
    }
}
