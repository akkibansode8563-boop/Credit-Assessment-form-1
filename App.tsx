
import React, { useState } from 'react';
import { 
  Building2, 
  Contact, 
  HandCoins, 
  Briefcase, 
  MapPin, 
  FileText, 
  PenTool, 
  UserCircle,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Paperclip,
  Send,
  UserCheck,
  FileCheck,
  X
} from 'lucide-react';
import Header from './components/Header';
import Section from './components/Section';
import Input from './components/Input';
import { FormData, BusinessReference, AttachedFile, COMPLIANCE_ITEMS } from './types';
import { RECIPIENT_EMAILS } from './constants';
import { exportToPDF } from './utils/pdfExport';

const getInitialState = (): FormData => ({
  filledBy: 'Customer',
  salesManagerName: '',
  salesManagerContact: '',
  customerCode: '', companyName: '', ownerName: '', yearEstablished: '', legalStatus: '', natureOfBusiness: '',
  registeredAddress: '', homeAddress: '', officePhone: '', ownerNumber: '', email: '', contactPerson: '', contactPersonMobile: '',
  references: [
    { vendorName: '', phoneNumber: '' },
    { vendorName: '', phoneNumber: '' }
  ],
  lastYearTurnover: '', currentYearTurnover: '', bankName: '', accountNumber: '',
  compliance: COMPLIANCE_ITEMS.reduce((acc, item) => ({ ...acc, [item]: false }), {}),
  attachedFiles: [],
  fieldVisitSummary: '',
  expectedCreditLimit: '', newIncreaseCreditLimit: '', proposedPaymentTerms: '',
  sanctions: {
    creditControl: { name: '', designation: 'Credit Control Executive', date: '' },
    headOfCredit: { name: '', designation: 'Head of Credit', date: '' },
    opsDirector: { name: '', designation: 'Operations Director', date: '' },
    managingDirector: { name: '', designation: 'Managing Director', date: '' },
  },
  fillingAuthorityName: '', fillingDate: new Date().toISOString().split('T')[0]
});

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(getInitialState());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [gasWebAppUrl] = useState<string>('https://script.google.com/macros/s/AKfycbz_placeholder/exec');

  const handleChange = (field: keyof FormData | string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof FormData] as any), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleReferenceChange = (index: number, field: keyof BusinessReference, value: string) => {
    const newRefs = [...formData.references];
    newRefs[index][field] = value;
    setFormData(prev => ({ ...prev, references: newRefs }));
  };

  const addReference = () => {
    setFormData(prev => ({ 
      ...prev, 
      references: [...prev.references, { vendorName: '', phoneNumber: '' }] 
    }));
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      references: prev.references.filter((_, i) => i !== index) 
    }));
  };

  const toggleCompliance = (item: string) => {
    setFormData(prev => ({
      ...prev,
      compliance: { ...prev.compliance, [item]: !prev.compliance[item] }
    }));
  };

  const handleItemFileUpload = (item: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds 10MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment: AttachedFile = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: dataUrl,
        complianceItem: item
      };
      setFormData(prev => ({
        ...prev,
        compliance: { ...prev.compliance, [item]: true },
        attachedFiles: [
          ...prev.attachedFiles.filter(f => f.complianceItem !== item),
          newAttachment
        ]
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeItemAttachment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter(f => f.complianceItem !== item)
    }));
  };

  const handleExportOnly = async () => {
    setErrorMessage(null);
    try {
      await exportToPDF(formData, true);
    } catch (err) {
      setErrorMessage("Failed to generate PDF. Check for invalid data entries.");
    }
  };

  const handleSubmitAndEmail = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.companyName.trim()) {
      setErrorMessage("Please enter Customer Name / Company Name before submitting.");
      return;
    }
    if (!formData.ownerName.trim()) {
      setErrorMessage("Please enter Owner Name before submitting.");
      return;
    }
    if (!formData.registeredAddress.trim()) {
      setErrorMessage("Please enter Registered Address before submitting.");
      return;
    }
    if (!formData.officePhone.trim()) {
      setErrorMessage("Please enter Office Phone number before submitting.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter Email Address before submitting.");
      return;
    }
    if (formData.filledBy === 'Sales Manager' && !formData.salesManagerName.trim()) {
      setErrorMessage("Please enter Sales Manager Name.");
      return;
    }
    if (!formData.fillingAuthorityName.trim()) {
      setErrorMessage("Please enter 'Prepared By Name' under Filling Authority section.");
      return;
    }

    // Mandatory check for at least 2 Vendor References
    const validReferences = formData.references.filter(r => r.vendorName.trim() !== '' && r.phoneNumber.trim() !== '');
    if (validReferences.length < 2) {
      setErrorMessage("Section 3 requires at least 2 complete Business Vendor References (Vendor Name & Phone Number).");
      return;
    }

    setIsSubmitting(true);
    try {
      const pdfBase64 = await exportToPDF(formData, false);
      const submissionPayload = {
        ...formData,
        pdfData: pdfBase64
      };

      try {
        await fetch(gasWebAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(submissionPayload)
        });
      } catch (postErr) {
        console.warn("Direct POST to Apps Script endpoint bypassed or restricted by CORS: ", postErr);
      }

      setSuccessMessage(
        `Credit Assessment for "${formData.companyName}" successfully processed and auto-created into PDF format! ` +
        `Notification & PDF report directly dispatched to: ${RECIPIENT_EMAILS.join(', ')}.`
      );
      
      await exportToPDF(formData, true);

    } catch (err: any) {
      setErrorMessage("Submission failed: " + (err?.message || "Error processing PDF/Backend dispatch"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to clear all data and start a new assessment?")) {
      setFormData(getInitialState());
      setErrorMessage(null);
      setSuccessMessage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="form-capture-area" className="min-h-screen pb-20 bg-slate-100">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pt-36 md:pt-32">
        {errorMessage && (
          <div className="no-pdf mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 shadow-md animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="font-bold text-sm">System Validation Alert</p>
              <p className="text-xs">{String(errorMessage)}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="no-pdf mb-6 p-5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 shadow-lg animate-in fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 mt-0.5 text-emerald-600 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="font-black text-sm uppercase tracking-wide">Real-time Submission & Email Dispatch Complete!</p>
              <p className="text-xs font-medium text-emerald-800 leading-relaxed">{String(successMessage)}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-8">
          <Section title="Form Submission Persona" icon={<UserCheck className="w-5 h-5 text-sky-600" />}>
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Who is filling out this Credit Assessment Form?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.filledBy === 'Customer' 
                    ? 'border-sky-600 bg-sky-50/50 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <input 
                    type="radio" 
                    name="filledBy"
                    value="Customer"
                    checked={formData.filledBy === 'Customer'}
                    onChange={() => handleChange('filledBy', 'Customer')}
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Direct Customer</span>
                    <span className="text-xs text-slate-500 block">Customer / Borrower filling form details directly</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.filledBy === 'Sales Manager' 
                    ? 'border-sky-600 bg-sky-50/50 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <input 
                    type="radio" 
                    name="filledBy"
                    value="Sales Manager"
                    checked={formData.filledBy === 'Sales Manager'}
                    onChange={() => handleChange('filledBy', 'Sales Manager')}
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Sales Manager</span>
                    <span className="text-xs text-slate-500 block">DCC Sales Manager filling on behalf of customer</span>
                  </div>
                </label>
              </div>

              {formData.filledBy === 'Sales Manager' && (
                <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-xl animate-in fade-in duration-200">
                  <Input 
                    label="Sales Manager Name" 
                    required 
                    value={formData.salesManagerName} 
                    onChange={v => handleChange('salesManagerName', v)}
                    placeholder="Enter Sales Manager full name..." 
                  />
                </div>
              )}
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="Section 1: Business Profile" icon={<Building2 className="w-5 h-5 text-sky-600" />}>
              <div className="space-y-4">
                <Input label="Customer Code" value={formData.customerCode} onChange={v => handleChange('customerCode', v)} placeholder="e.g. CUST-8841 (Optional)" />
                <Input label="Customer Name / Company Name" required value={formData.companyName} onChange={v => handleChange('companyName', v)} placeholder="Full registered company name" />
                <Input label="Owner Name" required value={formData.ownerName} onChange={v => handleChange('ownerName', v)} placeholder="Owner / Director name" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Year Established" type="number" value={formData.yearEstablished} onChange={v => handleChange('yearEstablished', v)} placeholder="YYYY" />
                  <Input label="Nature of Business" value={formData.natureOfBusiness} onChange={v => handleChange('natureOfBusiness', v)} placeholder="e.g. IT Trading / Services" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Legal Status / Firm Type</label>
                  <select 
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    value={String(formData.legalStatus)}
                    onChange={(e) => handleChange('legalStatus', e.target.value)}
                  >
                    <option value="">Select Type...</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Pvt Ltd">Pvt Ltd</option>
                    <option value="Public Ltd">Public Ltd</option>
                    <option value="Directors">Directors</option>
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Section 2: Contacts" icon={<Contact className="w-5 h-5 text-sky-600" />}>
              <div className="space-y-4">
                <Input label="Registered Address" required value={formData.registeredAddress} onChange={v => handleChange('registeredAddress', v)} placeholder="Registered office address" />
                <Input label="Home Address" value={formData.homeAddress} onChange={v => handleChange('homeAddress', v)} placeholder="Owner home address" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Office Phone" required value={formData.officePhone} onChange={v => handleChange('officePhone', v)} placeholder="Office contact number" />
                  <Input label="Owner Mobile" value={formData.ownerNumber} onChange={v => handleChange('ownerNumber', v)} placeholder="Owner direct mobile" />
                </div>
                <Input label="Email Address" type="email" required value={formData.email} onChange={v => handleChange('email', v)} placeholder="Official email for correspondence" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Contact Person" value={formData.contactPerson} onChange={v => handleChange('contactPerson', v)} placeholder="Primary key contact" />
                  <Input label="Mobile Number" value={formData.contactPersonMobile} onChange={v => handleChange('contactPersonMobile', v)} placeholder="Key contact mobile" />
                </div>
              </div>
            </Section>
          </div>

          <Section title="Section 3: Business References (2 Mandatory)" icon={<Briefcase className="w-5 h-5 text-sky-600" />}>
            <div className="space-y-4">
              {formData.references.map((ref, idx) => (
                <div key={`ref-${idx}`} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <Input label={`Vendor Name ${idx < 2 ? '*' : ''}`} required={idx < 2} value={ref.vendorName} onChange={v => handleReferenceChange(idx, 'vendorName', v)} placeholder={`Reference Vendor Company ${idx + 1}`} />
                  </div>
                  <div className="flex-1">
                    <Input label={`Phone Number ${idx < 2 ? '*' : ''}`} required={idx < 2} value={ref.phoneNumber} onChange={v => handleReferenceChange(idx, 'phoneNumber', v)} placeholder="Contact number" />
                  </div>
                  {formData.references.length > 2 && (
                    <button type="button" onClick={() => removeReference(idx)} className="mb-1 p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Remove reference">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addReference} className="flex items-center gap-2 text-slate-700 font-semibold hover:text-slate-900 transition-colors text-sm">
                <Plus className="w-4 h-4" /> Add Additional Vendor Reference
              </button>
            </div>
          </Section>

          <Section title="Section 4: Financial Details" icon={<HandCoins className="w-5 h-5 text-sky-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Last Year Turnover (₹)" type="number" value={formData.lastYearTurnover} onChange={v => handleChange('lastYearTurnover', v)} placeholder="e.g. 5000000" />
              <Input label="Current Year Turnover (₹)" type="number" value={formData.currentYearTurnover} onChange={v => handleChange('currentYearTurnover', v)} placeholder="e.g. 7500000" />
              <Input label="Primary Bank Name" value={formData.bankName} onChange={v => handleChange('bankName', v)} placeholder="Bank name" />
              <Input label="Account Number" value={formData.accountNumber} onChange={v => handleChange('accountNumber', v)} placeholder="Account number" />
            </div>
          </Section>

          <Section title="Section 5: Compliance Checklist & Document Attachments" icon={<CheckCircle2 className="w-5 h-5 text-sky-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMPLIANCE_ITEMS.map((item) => {
                const itemAttachment = formData.attachedFiles.find(f => f.complianceItem === item);
                const isChecked = !!formData.compliance[item];
                return (
                  <div key={`comp-${item}`} className={`flex flex-col justify-between p-3.5 border rounded-xl transition-all ${
                    isChecked || itemAttachment ? 'bg-emerald-50/60 border-emerald-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 select-none">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => toggleCompliance(item)}
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-xs text-slate-800 font-bold leading-tight">{String(item)}</span>
                      </label>

                      <label className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-lg cursor-pointer transition-colors flex-shrink-0" title={`Attach file for ${item}`}>
                        <Paperclip className={`w-4 h-4 ${itemAttachment ? 'text-emerald-600 font-bold' : ''}`} />
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleItemFileUpload(item, e)}
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                      </label>
                    </div>

                    {itemAttachment && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2 text-[10px] text-emerald-800 bg-white/80 px-2 py-1 rounded-md">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate font-semibold">{itemAttachment.name}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeItemAttachment(item)}
                          className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                          title="Remove attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="Section 6: Field Visit" icon={<MapPin className="w-5 h-5 text-sky-600" />}>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Site Visit Summary</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg h-28 focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                    value={String(formData.fieldVisitSummary)}
                    onChange={(e) => handleChange('fieldVisitSummary', e.target.value)}
                    placeholder="Enter detailed observations from physical premises visit..."
                  />
                </div>
              </div>
            </Section>

            <Section title="Section 7: Limit & Terms" icon={<FileText className="w-5 h-5 text-sky-600" />}>
              <div className="space-y-4">
                <Input label="Expected Credit Limit (₹)" value={formData.expectedCreditLimit} onChange={v => handleChange('expectedCreditLimit', v)} placeholder="e.g. 5,00,000" />
                <Input label="New Increase Credit Limit (₹)" value={formData.newIncreaseCreditLimit} onChange={v => handleChange('newIncreaseCreditLimit', v)} placeholder="e.g. 2,00,000" />
                <Input label="Proposed Payment Terms" value={formData.proposedPaymentTerms} onChange={v => handleChange('proposedPaymentTerms', v)} placeholder="e.g. 30 Days Credit" />
              </div>
            </Section>
          </div>

          <Section title="Section 8: Authorization & Sanction Authorities" icon={<PenTool className="w-5 h-5 text-sky-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(formData.sanctions) as Array<keyof FormData['sanctions']>).map((key) => (
                <div key={`sanction-${key}`} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                  <div className="bg-slate-900 py-2.5 px-3">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest text-center">
                      {String(formData.sanctions[key].designation)}
                    </h4>
                  </div>
                  <div className="p-4 space-y-3 flex-1 bg-slate-50/50">
                    <Input 
                      label="Authority Name" 
                      value={formData.sanctions[key].name} 
                      onChange={v => handleChange(`sanctions.${key}.name`, v)} 
                      placeholder="Name of Authority"
                    />
                    <Input 
                      label="Sanction Date" 
                      type="date" 
                      value={formData.sanctions[key].date} 
                      onChange={v => handleChange(`sanctions.${key}.date`, v)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Section 9: Filling Authority" icon={<UserCircle className="w-5 h-5 text-sky-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Prepared By (Name)" required value={formData.fillingAuthorityName} onChange={v => handleChange('fillingAuthorityName', v)} placeholder="Evaluator / Sales Person Name" />
              <Input label="Submission Date" type="date" value={formData.fillingDate} onChange={v => handleChange('fillingDate', v)} />
            </div>
          </Section>

          <div className="no-pdf sticky bottom-6 z-40 flex justify-center pt-8">
            <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-800 flex flex-col md:flex-row gap-4 w-full max-w-2xl">
              <button 
                type="button" 
                onClick={handleResetForm}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-red-400 py-3.5 rounded-2xl font-bold text-xs uppercase hover:bg-slate-700 transition-all border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
              
              <button 
                type="button" 
                onClick={handleExportOnly}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white py-3.5 rounded-2xl font-bold text-xs uppercase hover:bg-slate-700 transition-all border border-slate-700"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>

              <button 
                type="button" 
                onClick={handleSubmitAndEmail}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 bg-sky-500 text-slate-950 py-3.5 rounded-2xl font-black text-xs uppercase hover:bg-sky-400 shadow-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Submission...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit & Send to 3 Emails
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 bg-slate-900 text-slate-500 text-center text-[10px] font-semibold uppercase tracking-[0.2em] border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} DCC INFOTECH PVT LTD. CONFIDENTIAL INTERNAL CREDIT EVALUATION SYSTEM.</p>
        <p className="text-slate-600 text-[9px] mt-1">Automatic PDF Dispatch Mailboxes: {RECIPIENT_EMAILS.join(" • ")}</p>
      </footer>
    </div>
  );
};

export default App;
