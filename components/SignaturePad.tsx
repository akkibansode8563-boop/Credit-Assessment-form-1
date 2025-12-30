
import React, { useRef, useEffect, useState } from 'react';
import SignaturePadBase from 'signature_pad';
import { RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  onSave: (data: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ label, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new (SignaturePadBase as any)(canvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(0, 0, 128)'
      });
      
      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const canvas = canvasRef.current!;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(ratio, ratio);
        signaturePadRef.current?.clear();
      };

      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsSaved(false);
    onSave('');
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const data = signaturePadRef.current.toDataURL();
      onSave(data);
      setIsSaved(true);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter block mb-1">{label}</label>
      <div className="relative border-b-2 border-slate-300 bg-slate-50 rounded-t-lg">
        <canvas 
          ref={canvasRef} 
          className="w-full h-32 cursor-crosshair block"
        />
        <div className="absolute top-2 right-2 flex gap-2 no-print">
          <button 
            type="button"
            onClick={handleClear}
            className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-md border border-slate-200 shadow-sm transition-colors"
            title="Clear"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {!isSaved && (
            <button 
              type="button"
              onClick={handleSave}
              className="p-1.5 bg-white text-slate-400 hover:text-green-600 rounded-md border border-slate-200 shadow-sm transition-colors"
              title="Confirm Signature"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
        {isSaved && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-50/50 pointer-events-none">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Captured</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
