
import React from 'react';
import { COMPANY_NAME } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/10 border border-sky-400/30 p-2 rounded-xl text-sky-400 font-black text-2xl tracking-tighter flex items-center justify-center w-12 h-12 shadow-inner">
            DCC
          </div>
          <div>
            <span className="text-xl md:text-2xl font-black text-white tracking-tight uppercase block leading-none">
              {COMPANY_NAME}
            </span>
            <span className="text-[10px] font-bold text-sky-400 tracking-widest uppercase block mt-1">
              Data Care Corporation Group
            </span>
          </div>
        </div>
        <div className="text-center md:text-right">
          <h1 className="text-xs md:text-sm font-bold text-slate-300 tracking-widest uppercase">
            Credit Assessment & Risk Evaluation System
          </h1>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
            Internal Evaluation & Credit Control Portal
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
