
import React from 'react';

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
        {icon && <span className="text-navy-600 text-blue-600">{icon}</span>}
        <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
};

export default Section;
