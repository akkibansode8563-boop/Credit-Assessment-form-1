
import React from 'react';
import { COMPANY_NAME } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col items-center justify-center text-center gap-1.5">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="DCC Logo" 
              className="h-10 md:h-12 w-auto object-contain brightness-105 contrast-110"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase block leading-none">
            {COMPANY_NAME}
          </span>
        </div>
        <div className="h-0.5 w-28 bg-sky-600 rounded-full my-0.5" />
        <h1 className="text-xs md:text-sm font-bold text-slate-600 tracking-widest uppercase">
          Credit Assessment & Risk Evaluation System
        </h1>
      </div>
    </header>
  );
};

export default Header;
