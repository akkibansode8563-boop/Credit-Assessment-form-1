
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
  // Fix: Added CheckCircle2 which was missing in imports
  CheckCircle2
} from 'lucide-react';
import Header from './components/Header';
import Section from './components/Section';
import Input from './components/Input';
import { FormData, BusinessReference, COMPLIANCE_ITEMS } from './types';
import { exportToPDF } from './utils/pdfExport';

const getInitialState = (): FormData => ({
  customerCode: '', companyName: '', ownerName: '', yearEstablished: '', legalStatus: '', natureOfBusiness: '',
  registeredAddress: '', homeAddress: '', officePhone: '', ownerNumber: '', email: '', contactPerson: '', contactPersonMobile: '',
  references: [{ vendorName: '', phoneNumber: '' }],
  lastYearTurnover: '', currentYearTurnover: '', bankName: '', accountNumber: '',
  compliance: COMPLIANCE_ITEMS.reduce((acc, item) => ({ ...acc, [item]: false }), {}),
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

  const handleExportOnly = async () => {
    setErrorMessage(null);
    try {
      await exportToPDF(formData, true);
    } catch (err) {
      setErrorMessage("Failed to generate PDF. Check for invalid data entries.");
    }
  };

  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to clear all data and start a new assessment?")) {
      setFormData(getInitialState());
      setErrorMessage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pt-48">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 shadow-md animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-sm">System Alert</p>
              <p className="text-xs">{String(errorMessage)}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="Section 1: Business Profile" icon={<Building2 className="w-5 h-5" />}>
              <div className="space-y-4">
                <Input label="Customer Code" required value={formData.customerCode} onChange={v => handleChange('customerCode', v)} />
                <Input label="Customer Name" required value={formData.companyName} onChange={v => handleChange('companyName', v)} />
                <Input label="Owner Name" value={formData.ownerName} onChange={v => handleChange('ownerName', v)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Year Established" type="number" value={formData.yearEstablished} onChange={v => handleChange('yearEstablished', v)} />
                  <Input label="Nature of Business" value={formData.natureOfBusiness} onChange={v => handleChange('natureOfBusiness', v)} />
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

            <Section title="Section 2: Contacts" icon={<Contact className="w-5 h-5" />}>
              <div className="space-y-4">
                <Input label="Registered Address" value={formData.registeredAddress} onChange={v => handleChange('registeredAddress', v)} />
                <Input label="Home Address" value={formData.homeAddress} onChange={v => handleChange('homeAddress', v)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Office Phone" value={formData.officePhone} onChange={v => handleChange('officePhone', v)} />
                  <Input label="Owner Number" value={formData.ownerNumber} onChange={v => handleChange('ownerNumber', v)} />
                </div>
                <Input label="Email Address" type="email" value={formData.email} onChange={v => handleChange('email', v)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Contact Person" value={formData.contactPerson} onChange={v => handleChange('contactPerson', v)} />
                  <Input label="Mobile Number" value={formData.contactPersonMobile} onChange={v => handleChange('contactPersonMobile', v)} />
                </div>
              </div>
            </Section>
          </div>

          <Section title="Section 3: Business References" icon={<Briefcase className="w-5 h-5" />}>
            <div className="space-y-4">
              {formData.references.map((ref, idx) => (
                <div key={`ref-${idx}`} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <Input label="Vendor Name" value={ref.vendorName} onChange={v => handleReferenceChange(idx, 'vendorName', v)} />
                  </div>
                  <div className="flex-1">
                    <Input label="Phone Number" value={ref.phoneNumber} onChange={v => handleReferenceChange(idx, 'phoneNumber', v)} />
                  </div>
                  {formData.references.length > 1 && (
                    <button type="button" onClick={() => removeReference(idx)} className="mb-1 p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addReference} className="flex items-center gap-2 text-slate-700 font-semibold hover:text-slate-900 transition-colors">
                <Plus className="w-4 h-4" /> Add Reference
              </button>
            </div>
          </Section>

          <Section title="Section 4: Financial Details" icon={<HandCoins className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Last Year Turnover" type="number" value={formData.lastYearTurnover} onChange={v => handleChange('lastYearTurnover', v)} />
              <Input label="Current Year Turnover" type="number" value={formData.currentYearTurnover} onChange={v => handleChange('currentYearTurnover', v)} />
              <Input label="Primary Bank Name" value={formData.bankName} onChange={v => handleChange('bankName', v)} />
              <Input label="Account Number" value={formData.accountNumber} onChange={v => handleChange('accountNumber', v)} />
            </div>
          </Section>

          <Section title="Section 5: Compliance Checklist" icon={<CheckCircle2 className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMPLIANCE_ITEMS.map((item) => (
                <label key={`comp-${item}`} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                  <input 
                    type="checkbox" 
                    checked={!!formData.compliance[item]} 
                    onChange={() => toggleCompliance(item)}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-700 font-bold">{String(item)}</span>
                </label>
              ))}
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="Section 6: Field Visit" icon={<MapPin className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Visit Summary</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                    value={String(formData.fieldVisitSummary)}
                    onChange={(e) => handleChange('fieldVisitSummary', e.target.value)}
                    placeholder="Enter findings from the site visit..."
                  />
                </div>
              </div>
            </Section>

            <Section title="Section 7: Limit & Terms" icon={<FileText className="w-5 h-5" />}>
              <div className="space-y-4">
                <Input label="Expected Credit Limit" value={formData.expectedCreditLimit} onChange={v => handleChange('expectedCreditLimit', v)} />
                <Input label="New Increase Limit" value={formData.expectedCreditLimit} onChange={v => handleChange('newIncreaseCreditLimit', v)} />
                <Input label="Proposed Payment Terms" value={formData.proposedPaymentTerms} onChange={v => handleChange('proposedPaymentTerms', v)} />
              </div>
            </Section>
          </div>

          <Section title="Section 8: Sanction Authorities" icon={<PenTool className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(formData.sanctions) as Array<keyof FormData['sanctions']>).map((key) => (
                <div key={`sanction-${key}`} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
                  <div className="bg-slate-900 py-2.5 px-3">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest text-center">
                      {String(formData.sanctions[key].designation)}
                    </h4>
                  </div>
                  <div className="p-4 space-y-4 flex-1">
                    <div className="w-full h-24 border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center rounded-lg">
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Digital Sign</span>
                    </div>
                    <div className="space-y-3">
                      <Input label="Name" value={formData.sanctions[key].name} onChange={v => handleChange(`sanctions.${key}.name`, v)} />
                      <Input label="Date" type="date" value={formData.sanctions[key].date} onChange={v => handleChange(`sanctions.${key}.date`, v)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Section 9: Filling Authority" icon={<UserCircle className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Prepared By (Name)" required value={formData.fillingAuthorityName} onChange={v => handleChange('fillingAuthorityName', v)} />
              <Input label="Submission Date" type="date" value={formData.fillingDate} onChange={v => handleChange('fillingDate', v)} />
            </div>
          </Section>

          <div className="sticky bottom-8 z-40 flex justify-center pt-8">
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-200 flex flex-col md:flex-row gap-4 w-full max-w-xl">
              <button 
                type="button" 
                onClick={handleResetForm}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 py-4 rounded-2xl font-black text-xs uppercase hover:bg-red-50 transition-all border border-red-100"
              >
                <RefreshCw className="w-4 h-4" /> Reset Form
              </button>
              <button 
                type="button" 
                onClick={handleExportOnly}
                className="flex-[2] flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-800 shadow-xl transition-all group"
              >
                <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" /> 
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 bg-slate-900 text-slate-500 text-center text-[10px] font-medium uppercase tracking-[0.2em] border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} DCC INFOTECH PVT LTD. CONFIDENTIAL INTERNAL DATA.</p>
      </footer>
    </div>
  );
};

export default App;
