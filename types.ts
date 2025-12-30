
export interface BusinessReference {
  vendorName: string;
  phoneNumber: string;
}

export interface SignatureData {
  name: string;
  designation: string;
  date: string;
}

export interface FormData {
  // Section 1: Business Profile
  customerCode: string;
  companyName: string;
  ownerName: string; // Changed from tradingName
  yearEstablished: string;
  legalStatus: string; 
  natureOfBusiness: string;
  
  // Section 2: Contacts
  registeredAddress: string;
  homeAddress: string;
  officePhone: string;
  ownerNumber: string; // Changed from officeFax
  email: string;
  contactPerson: string;
  contactPersonMobile: string;

  // Section 3: References
  references: BusinessReference[];

  // Section 4: Financial Details
  lastYearTurnover: string;
  currentYearTurnover: string;
  bankName: string;
  accountNumber: string;

  // Section 6: Field Visit
  fieldVisitSummary: string;

  // Section 7: Expected Credit limit & Payment Term
  expectedCreditLimit: string;
  newIncreaseCreditLimit: string;
  proposedPaymentTerms: string;

  // Section 8: Sanctions
  sanctions: {
    creditControl: SignatureData;
    headOfCredit: SignatureData;
    opsDirector: SignatureData;
    managingDirector: SignatureData;
  };

  // Section 9: Filling Authority
  fillingAuthorityName: string;
  fillingDate: string;

  // Section 5: Compliance
  compliance: { [key: string]: boolean };

  // Helper for submission
  pdfData?: string;
}

export const COMPLIANCE_ITEMS = [
  "Authorization Letter",
  "Security Cheque",
  "GST Certificate",
  "Adhar card",
  "Pan Card",
  "Home light bill",
  "Office light bill",
  "6 Month Bank Statement"
];
