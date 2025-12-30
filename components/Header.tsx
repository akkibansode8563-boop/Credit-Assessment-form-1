
import React from 'react';
import { COMPANY_NAME } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center py-2">
          <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase border-b-4 border-slate-900 pb-1">
            {COMPANY_NAME}
          </span>
        </div>
        <div className="h-px w-32 bg-slate-200 mt-2" />
        <h1 className="text-lg md:text-xl font-bold text-slate-600 tracking-widest text-center uppercase mt-1">
          Credit Assessment & Risk Evaluation System
        </h1>
      </div>
    </header>
  );
};

export default Header;
