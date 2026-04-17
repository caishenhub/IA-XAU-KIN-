import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const TechnicalLogo = () => (
  <div className="relative group">
    <div className="absolute -inset-16 bg-brand-lime/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    <motion.img 
      whileHover={{ scale: 1.05 }}
      src="https://i.ibb.co/ZDmC99g/BLANCO-removebg-preview.png" 
      alt="IA XAU KIN" 
      className="h-52 w-auto relative z-10 transition-transform duration-500"
      referrerPolicy="no-referrer"
    />
  </div>
);

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulated Auth Logic
    setTimeout(() => {
      const VALID_USER = "administrador";
      const VALID_PASS = "sistem@xauusd";

      if (email === VALID_USER && password === VALID_PASS) {
        onLogin();
      } else {
        setError("Credenciales Inválidas. Ingrese usuario y contraseña.");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden">
      {/* Background Circuit Overlay (Subtle for white theme) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale invert"
        style={{
          backgroundImage: 'url("https://storage.googleapis.com/test-media-human-eval/temp/ais/63a1441b-a910-438d-80bb-698f24b216ce.png")',
          backgroundSize: '800px',
          backgroundRepeat: 'repeat',
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md px-10 py-16 bg-white border border-slate-100 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]"
      >
        <div className="flex flex-col items-center mb-12">
          <TechnicalLogo />
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.4em] mt-8 font-bold">
            Portal de Acceso Cuantitativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block ml-1">
              Usuario Autorizado
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <User size={16} className="text-slate-300 group-focus-within:text-brand-lime transition-colors" />
              </div>
              <input 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-4 text-slate-900 text-sm focus:outline-none focus:border-brand-lime/50 focus:bg-white focus:ring-4 focus:ring-brand-lime/10 transition-all placeholder:text-slate-300"
                placeholder="Id de Operador"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block ml-1">
              Llave Digital
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-300 group-focus-within:text-brand-lime transition-colors" />
              </div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-4 text-slate-900 text-sm focus:outline-none focus:border-brand-lime/50 focus:bg-white focus:ring-4 focus:ring-brand-lime/10 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center bg-red-50 py-3 rounded-xl border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-brand-navy text-white font-bold py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-slate-200 overflow-hidden relative"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span className="uppercase tracking-[0.2em] text-xs">Ingresar al Sistema</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-brand-lime" />
              </>
            )}
          </button>
        </form>

        <div className="mt-14 pt-8 border-t border-slate-50 flex items-center justify-between text-[9px] text-slate-300 font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-slate-200" />
            V4.0.2 Stable
          </div>
          <div className="flex items-center gap-2">
            Protocolo 256-BIT
          </div>
        </div>
      </motion.div>
    </div>
  );
};
