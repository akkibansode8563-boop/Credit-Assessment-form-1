
/**
 * GAS Backend Logic for Credit Assessment System
 * View Logs: Apps Script editor -> Executions (left sidebar).
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('CARES - Credit Assessment System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Simple ping to verify the bridge is working
 */
function testConnection() {
  console.log("Connection test received at " + new Date().toISOString());
  return { 
    status: "online", 
    user: Session.getActiveUser().getEmail(),
    remainingQuota: MailApp.getRemainingDailyQuota()
  };
}

/**
 * Main entry point called from the frontend
 */
function processSubmission(formData) {
  const timestamp = new Date().toLocaleString();
  console.log("--- START SUBMISSION PROCESS ---");
  console.log("Target Email: akshay.bansode@datacare.in");
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    // 1. Storage Data Preparation
    const cleanData = { ...formData };
    delete cleanData.pdfData;

    // 2. Append to Sheet
    const rowData = [
      new Date(),
      formData.customerCode || "N/A",
      formData.companyName || "N/A",
      formData.email || "N/A",
      formData.expectedCreditLimit || "0",
      formData.fillingAuthorityName || "System",
      JSON.stringify(cleanData)
    ];
    sheet.appendRow(rowData);
    console.log("Data saved to sheet successfully.");

    // 3. Email Dispatch
    const emailSent = sendEmailNotification(formData);
    
    console.log("--- END SUBMISSION PROCESS (SUCCESS) ---");
    return { 
      success: true, 
      emailSent: emailSent,
      quota: MailApp.getRemainingDailyQuota()
    };
  } catch (e) {
    console.error("CRITICAL ERROR: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function sendEmailNotification(formData) {
  const recipient = "akshay.bansode@datacare.in";
  const subject = "CARES: New Credit Assessment - " + (formData.companyName || "Unknown");
  
  // Use HTML body for professional look
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; color: #334155;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Credit Assessment</h2>
      <p>A new evaluation report has been submitted for <b>${formData.companyName}</b>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Customer Code:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${formData.customerCode}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Expected Limit:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${formData.expectedCreditLimit}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Prepared By:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${formData.fillingAuthorityName}</td></tr>
      </table>
      <p style="font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 8px;">
        <b>Note:</b> The full PDF report is attached to this email.
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 11px; color: #94a3b8;">Sent via CARES Internal Evaluation Tool</p>
    </div>
  `;
               
  const options = {
    name: "CARES Assessment System",
    htmlBody: htmlBody,
    attachments: []
  };

  if (formData.pdfData) {
    const decodedPdf = Utilities.base64Decode(formData.pdfData);
    const pdfBlob = Utilities.newBlob(
      decodedPdf, 
      "application/pdf", 
      "Assessment_" + (formData.customerCode || "Report") + ".pdf"
    );
    options.attachments.push(pdfBlob);
  }
  
  try {
    GmailApp.sendEmail(recipient, subject, "", options);
    console.log("GmailApp: Email sent successfully.");
    return true;
  } catch (err) {
    console.warn("GmailApp failed, trying MailApp fallback: " + err.toString());
    MailApp.sendEmail(recipient, subject, "PDF report attached.", options);
    return true;
  }
}
