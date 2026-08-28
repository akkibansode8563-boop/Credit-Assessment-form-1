
/**
 * GAS Backend Logic for Credit Assessment System - DCC INFOTECH PVT LTD
 * View Logs: Apps Script editor -> Executions (left sidebar).
 */

const RECIPIENT_EMAILS = [
  "pravin.bhosale@datacare.in",
  "creditgruop@datacare.in",
  "sharad.mulmule@datacare.in"
];

function doGet(e) {
  return HtmlService.createHtmlOutput(
    '<h3>CARES - Credit Assessment System API Endpoint Active</h3><p>Use POST method to submit form evaluations.</p>'
  )
    .setTitle('CARES - Credit Assessment System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Web App HTTP POST Endpoint
 */
function doPost(e) {
  try {
    let formData;
    if (e && e.postData && e.postData.contents) {
      formData = JSON.parse(e.postData.contents);
    } else {
      formData = JSON.parse(e.parameter.data);
    }
    const result = processSubmission(formData);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
 * Main entry point called from frontend / doPost
 */
function processSubmission(formData) {
  const timestamp = new Date().toLocaleString();
  console.log("--- START SUBMISSION PROCESS ---");
  console.log("Target Recipients: " + RECIPIENT_EMAILS.join(", "));
  
  try {
    let sheetSaved = false;
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        const sheet = ss.getActiveSheet();
        const cleanData = { ...formData };
        delete cleanData.pdfData;
        delete cleanData.attachedFiles;

        const rowData = [
          new Date(),
          formData.customerCode || "N/A",
          formData.companyName || "N/A",
          formData.filledBy || "Customer",
          formData.filledBy === "Sales Manager" ? (formData.salesManagerName || "N/A") : "N/A",
          formData.email || "N/A",
          formData.expectedCreditLimit || "0",
          formData.fillingAuthorityName || "System",
          JSON.stringify(cleanData)
        ];
        sheet.appendRow(rowData);
        sheetSaved = true;
        console.log("Data saved to spreadsheet successfully.");
      }
    } catch (sheetErr) {
      console.warn("Spreadsheet logging bypassed or unavailable: " + sheetErr.toString());
    }

    // Email Dispatch
    const emailSent = sendEmailNotification(formData);
    
    console.log("--- END SUBMISSION PROCESS (SUCCESS) ---");
    return { 
      success: true, 
      sheetSaved: sheetSaved,
      emailSent: emailSent,
      recipients: RECIPIENT_EMAILS,
      quota: MailApp.getRemainingDailyQuota()
    };
  } catch (e) {
    console.error("CRITICAL ERROR: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function sendEmailNotification(formData) {
  const recipientList = RECIPIENT_EMAILS.join(",");
  const subject = "CARES Credit Assessment: " + (formData.companyName || "New Evaluation") + " (" + (formData.customerCode || "N/A") + ")";
  
  const filledByDetails = formData.filledBy === "Sales Manager" 
    ? `<b>Sales Manager (On behalf of Customer)</b><br/>Manager Name: ${formData.salesManagerName || 'N/A'} (Contact: ${formData.salesManagerContact || 'N/A'})`
    : `<b>Direct Customer</b>`;

  const attachedFilesCount = formData.attachedFiles ? formData.attachedFiles.length : 0;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
      <div style="border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0 0 6px 0; font-size: 20px; text-transform: uppercase;">DCC INFOTECH PVT LTD</h2>
        <span style="color: #0284c7; font-weight: bold; font-size: 13px; tracking-wide: 1px;">CREDIT ASSESSMENT & RISK EVALUATION SYSTEM</span>
      </div>
      
      <p style="font-size: 14px; color: #334155;">A new credit assessment form submission has been generated and filed into the system.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="background: #f8fafc;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Form Filled By:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${filledByDetails}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Customer Name / Code:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><b>${formData.companyName || 'N/A'}</b> (${formData.customerCode || 'N/A'})</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Expected Credit Limit:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #0369a1; font-weight: bold;">${formData.expectedCreditLimit || 'N/A'}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Proposed Payment Terms:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${formData.proposedPaymentTerms || 'N/A'}</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Prepared By:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${formData.fillingAuthorityName || 'System'} (${formData.fillingDate || 'N/A'})</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Document Attachments:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${attachedFilesCount} uploaded file(s) attached</td></tr>
      </table>

      <div style="font-size: 13px; background: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px; border-radius: 4px; margin: 20px 0; color: #0369a1;">
        <b>Attached Report:</b> The official Credit Assessment Report PDF is generated in real-time and attached to this email along with all uploaded compliance documents.
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94a3b8; margin: 0;">Automated System Notification from CARES - DCC Infotech Pvt Ltd</p>
    </div>
  `;
               
  const options = {
    name: "DCC CARES Evaluation System",
    htmlBody: htmlBody,
    attachments: []
  };

  // 1. Attach generated Credit Assessment PDF
  if (formData.pdfData) {
    const decodedPdf = Utilities.base64Decode(formData.pdfData);
    const pdfBlob = Utilities.newBlob(
      decodedPdf, 
      "application/pdf", 
      "CARES_Credit_Assessment_" + (formData.customerCode || "Report") + ".pdf"
    );
    options.attachments.push(pdfBlob);
  }

  // 2. Attach uploaded compliance documents
  if (formData.attachedFiles && Array.isArray(formData.attachedFiles)) {
    formData.attachedFiles.forEach(function(file, idx) {
      try {
        if (file.dataUrl) {
          const parts = file.dataUrl.split(",");
          const base64Data = parts.length > 1 ? parts[1] : parts[0];
          const decodedDoc = Utilities.base64Decode(base64Data);
          const mimeType = file.type || "application/octet-stream";
          const docBlob = Utilities.newBlob(decodedDoc, mimeType, file.name || ("Attachment_" + (idx + 1)));
          options.attachments.push(docBlob);
        }
      } catch (attachErr) {
        console.warn("Failed to process attachment " + file.name + ": " + attachErr.toString());
      }
    });
  }
  
  try {
    GmailApp.sendEmail(recipientList, subject, "", options);
    console.log("GmailApp: Email dispatched to " + recipientList);
    return true;
  } catch (err) {
    console.warn("GmailApp failed, trying MailApp fallback: " + err.toString());
    MailApp.sendEmail(recipientList, subject, "CARES Credit Assessment PDF report and document attachments enclosed.", options);
    return true;
  }
}
