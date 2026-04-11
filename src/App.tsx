/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { 
  Upload, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Target, 
  BrainCircuit,
  FileImage,
  Loader2,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const Logo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 400 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Decorative Line Above */}
    <path d="M20 45 L40 25 H180" stroke="#CCFF00" strokeWidth="3" strokeLinecap="round" />
    <circle cx="185" cy="25" r="3" fill="#CCFF00" />
    
    {/* Main Text */}
    <text x="35" y="85" fill="#1A1A2E" fontSize="52" fontWeight="800" fontFamily="Inter, sans-serif">IA XAU KIN</text>
    
    {/* Circuit Pattern on Right */}
    <g transform="translate(310, 70)">
      <path d="M0 -50 A50 50 0 0 1 0 50" stroke="#CCFF00" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M15 -40 A40 40 0 0 1 15 40" stroke="#CCFF00" strokeWidth="2.5" />
      <circle cx="15" cy="-40" r="2.5" fill="#CCFF00" />
      <circle cx="15" cy="40" r="2.5" fill="#CCFF00" />
      <path d="M30 -30 A30 30 0 0 1 30 30" stroke="#CCFF00" strokeWidth="2" />
      <circle cx="30" cy="-30" r="2" fill="#CCFF00" />
      <circle cx="30" cy="30" r="2" fill="#CCFF00" />
      {/* Small connecting lines */}
      <path d="M15 0 H35" stroke="#CCFF00" strokeWidth="1" />
      <circle cx="38" cy="0" r="1.5" fill="#CCFF00" />
    </g>
  </svg>
);

const SYSTEM_PROMPT = `Actúa como IA XAU KIN, un Analista Cuantitativo Senior y Estratega Institucional especializado en el mercado XAUUSD. Tu enfoque es puramente basado en datos, modelado de estructura de mercado de alta precisión y gestión de riesgos algorítmica.

Tu tarea es procesar telemetría visual de gráficos (TradingView) para generar matrices operativas estructuradas, coherentes y validadas por la arquitectura del mercado.

---

### 🔍 PROTOCOLO DE ANÁLISIS CUANTITATIVO

Antes de emitir cualquier vector operativo, debes ejecutar el siguiente diagnóstico:

1. **Sincronización Temporal:**
   - Calibrar la hora actual del activo según el feed visual (última vela/eje temporal).
   - **PARÁMETRO CRÍTICO:** El modelado debe proyectarse en una **ventana operativa de 60 minutos** (bloque de 1 hora) desde el punto de origen. Si el timestamp es 12:18 AM, la matriz debe cubrir hasta las 01:18 AM.

2. **Arquitectura de Mercado:**
   - Identificar BOS (Break of Structure) con validación de volumen.
   - Identificar CHoCH (Change of Character) para detección de reversión.
   - Clasificar el régimen de mercado: Tendencial (Alcista/Bajista) o Lateral (Rango).

3. **Zonas de Interés y Optimización de Probabilidad:**
   - Calcular vectores de entrada para capturar movimientos de **10 pips (1.0 punto en XAU)** con un ratio de acierto institucional.
   - Mapear zonas de Supply/Demand, Liquidez Interna/Externa y desequilibrios (FVG).

4. **Dinámica del Precio:**
   - Analizar rechazos en niveles psicológicos, impulsos de expansión y retrocesos de mitigación.

---

### 🧠 SESGO ALGORÍTMICO (BIAS)

- Estructura Alcista + Mitigación de Demanda → LONG (BUY) 🟢  
- Estructura Bajista + Mitigación de Oferta → SHORT (SELL) 🔴  
- Régimen Lateral → Operativa de Reversión en Extremos.

---

### ⏰ MATRIZ DE EJECUCIÓN (BLOQUE DE 60 MIN)

Los timestamps de ejecución no son aleatorios; deben responder a la probabilidad estadística dentro de la ventana de 60 minutos.

Directrices:
1. Identificar nodos de liquidez para entradas de 10 pips.
2. REGLAS DE FRECUENCIA:
   - Orden cronológico estricto.
   - Distribución no lineal (evitar secuencias uniformes).
   - Intervalos alternados basados en la volatilidad esperada (ej: 12:24, 12:32, 12:41, 12:55…).

---

### 📊 REPORTE ESTRATÉGICO (FORMATO OBLIGATORIO)

📊 XAUUSD — MATRIZ OPERATIVA INSTITUCIONAL

🕗 Ventana Temporal: (Rango de 60 min en formato 12h AM/PM, ej: 12:18 AM — 01:18 AM)

📉 Tesis de Mercado:
(Análisis técnico-cuantitativo detallado. Justificación de la probabilidad de captura de 10 pips en la ventana actual)

🔴 Sesgo Estratégico: (LONG 🟢 o SHORT 🔴)

(Generar entre 5 y 7 vectores de entrada con timestamps lógicos, SIEMPRE en formato 12h AM/PM)

Ejemplo:

12:24 AM — SHORT 🔴  
12:32 AM — SHORT 🔴  
12:41 AM — SHORT 🔴  
12:55 AM — SHORT 🔴  

🎯 Target Objetivo: +10 pips (1.0 pt)

---

⚠️ Advertencia de Riesgo:
(Identificar zonas de alta volatilidad, posibles "Stop Hunts" o periodos de baja liquidez)

---

📌 Protocolo de Gestión de Capital:
Texto profesional sobre:
- Selección de entradas de alta convicción (máximo 2-3 ejecuciones por bloque).
- Implementación estricta de Stop Loss.
- Exposición por operación (0.5% - 1.0% del AUM).
- Disciplina operativa y neutralidad emocional.

---

### 🚫 RESTRICCIONES DE PROCESAMIENTO

- Prohibido omitir el timestamp de origen del gráfico.
- Prohibido proyectar fuera de la ventana de 60 minutos.
- Prioridad absoluta a la tendencia de alta temporalidad para los 10 pips.

---

Tu output debe reflejar la precisión y el rigor de un terminal de trading institucional.`;

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAnalysis = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setCopied(false);
    setShowResetConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleButtonClick = () => {
    if (analysis) {
      setShowResetConfirm(true);
    } else {
      analyzeChart();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type || "image/png");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
        setCopied(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const analyzeChart = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("API_KEY_MISSING: La clave de API de Gemini no está configurada. Si estás en Vercel, asegúrate de añadir GEMINI_API_KEY en las variables de entorno del proyecto.");
      }

      const model = "gemini-3-flash-preview";
      const base64Data = image.split(',')[1];
      
      const result = await genAI.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              { text: "Ejecutar modelado cuantitativo inmediato sobre esta telemetría visual." }
            ]
          }
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = result.text;
      if (text) {
        setAnalysis(text);
      } else {
        throw new Error("No se pudo generar el análisis. La respuesta de la IA está vacía.");
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Error desconocido al analizar el gráfico.";
      
      if (errorMessage.includes("API_KEY_MISSING")) {
        setError(errorMessage);
      } else if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key not found")) {
        setError("La clave de API proporcionada no es válida. Por favor, verifícala en tu panel de control.");
      } else {
        setError(`Error en el análisis: ${errorMessage}. Asegúrate de que la imagen sea clara y que la API KEY esté configurada correctamente en el entorno.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-brand-lime/20">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="h-16 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2 hover:text-brand-navy transition-colors cursor-pointer group">
              <TrendingUp size={14} className="group-hover:text-brand-lime transition-colors" /> XAUUSD Expert
            </span>
            <span className="flex items-center gap-2 hover:text-brand-navy transition-colors cursor-pointer group">
              <ShieldCheck size={14} className="group-hover:text-brand-lime transition-colors" /> Smart Money
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-5 space-y-10">
            <section className="space-y-4">
              <h2 className="text-4xl font-serif italic text-slate-900 leading-tight">
                Modelado de <br />
                <span className="text-brand-lime">Estructura Cuantitativa</span>
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Cargue la telemetría visual de TradingView. IA XAU KIN ejecutará un escaneo de alta precisión para identificar desequilibrios de liquidez, BOS y CHoCH.
              </p>
            </section>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden aspect-[4/3] flex items-center justify-center
                ${image ? 'border-brand-lime/30 bg-white' : 'border-slate-200 hover:border-brand-lime/50 bg-white hover:bg-slate-50'}`}
            >
              {image ? (
                <img 
                  src={image} 
                  alt="Market Telemetry" 
                  className="w-full h-full object-contain p-4"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <Upload className="text-slate-300 group-hover:text-brand-lime" size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Ingresar Datos Visuales</p>
                  <p className="text-xs text-slate-400 mt-2">TradingView Telemetry (PNG/JPG)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden" 
                accept="image/*"
              />
            </div>

            <button
              onClick={handleButtonClick}
              disabled={(!image && !analysis) || isAnalyzing}
              className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300
                ${(!image && !analysis) || isAnalyzing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : analysis 
                    ? 'bg-brand-navy text-brand-lime border border-brand-lime/30 hover:bg-slate-800'
                    : 'bg-slate-900 text-white hover:bg-brand-navy hover:shadow-2xl hover:shadow-brand-lime/20 active:scale-[0.98]'}`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Procesando Algoritmos...
                </>
              ) : analysis ? (
                <>
                  <Check size={18} /> Modelado Ejecutado
                </>
              ) : (
                <>
                  Ejecutar Modelado <ChevronRight size={16} />
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-600 text-xs font-medium"
              >
                <AlertTriangle size={18} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-premium relative overflow-hidden"
                >
                  <div className="relative space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                      <div className="space-y-1">
                        <h3 className="text-slate-900 font-serif italic text-2xl">
                          Matriz Operativa Institucional
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IA XAU KIN Quantitative Strategy Report</p>
                      </div>
                      <div className="px-4 py-2 bg-brand-lime/10 text-brand-lime text-[10px] font-bold rounded-xl border border-brand-lime/20 uppercase tracking-widest">
                        High Conviction
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-sans text-sm">
                        {analysis}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300
                          ${copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-brand-navy text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
                      >
                        {copied ? (
                          <>
                            <Check size={14} /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copiar Análisis
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                        <Clock size={14} className="text-brand-lime" /> Actualizado: {new Date().toLocaleTimeString()}
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[500px] bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-16 shadow-sm"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
                    <BrainCircuit className="text-slate-200 w-12 h-12" />
                  </div>
                  <h3 className="text-slate-900 font-serif italic text-xl mb-3">Sistema en Standby</h3>
                  <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                    Cargue la telemetría visual del activo para iniciar el procesamiento de la matriz operativa institucional.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-brand-lime" />
            </div>
            <h4 className="text-slate-900 font-serif italic text-lg">
              Arquitectura de Mercado
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Modelado algorítmico de BOS y CHoCH para la identificación de flujos de órdenes institucionales.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-brand-lime" />
            </div>
            <h4 className="text-slate-900 font-serif italic text-lg">
              Optimización Cuantitativa
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Vectores operativos calibrados para capturar ineficiencias de 10 pips con alta precisión estadística.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-brand-navy" />
            </div>
            <h4 className="text-slate-900 font-serif italic text-lg">
              Gestión Profesional
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Protocolos de riesgo integrados para proteger el capital y fomentar la disciplina operativa.
            </p>
          </div>
        </div>
        <div className="mt-24 flex flex-col items-center gap-6">
          <Logo className="h-10 w-auto opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.5em] font-bold">
            © 2026 IA XAU KIN • Institutional Intelligence
          </p>
        </div>
      </footer>
      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center mb-6">
                <FileImage className="text-brand-lime" size={32} />
              </div>
              <h3 className="text-2xl font-serif italic text-slate-900 mb-3">
                Nuevo Modelado
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                ¿Desea descartar el análisis actual e ingresar nueva telemetría visual para un nuevo modelado cuantitativo?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={resetAnalysis}
                  className="flex-1 py-4 bg-brand-navy text-brand-lime rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
