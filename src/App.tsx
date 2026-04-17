/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Check,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Login } from './components/Login';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const Logo = ({ className = "" }: { className?: string }) => (
  <img 
    src="https://i.ibb.co/ZDmC99g/BLANCO-removebg-preview.png" 
    alt="IA XAU KIN" 
    className={`${className} hover:scale-105 transition-transform duration-500`}
    referrerPolicy="no-referrer"
  />
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
- **FORMATO HORARIO:** Debes utilizar EXCLUSIVAMENTE el formato de 12 horas (AM/PM). Queda terminantemente prohibido el uso de formato de 24 horas (ej: prohibido 14:00, usar 02:00 PM).
- **RESTRICCIÓN DE EXTENSIÓN:** El reporte completo debe ser altamente denso en información técnica y NO exceder las 500 palabras en total.

---

Tu output debe reflejar la precisión y el rigor de un terminal de trading institucional.`;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 2048;
        const MAX_HEIGHT = 2048;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Usamos JPEG a 0.85 para el equilibrio perfecto entre peso de archivo y nitidez de velas/texto
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setMimeType("image/jpeg");
          setImage(optimizedDataUrl);
          setAnalysis(null);
          setError(null);
          setCopied(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

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
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
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
      } else if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        setError("CRÉDITOS AGOTADOS: Tu saldo de Google AI Studio se ha terminado o has superado el límite de cuota. Por favor, recarga tus créditos en https://aistudio.google.com/app/billing");
      } else if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key not found")) {
        setError("La clave de API proporcionada no es válida. Por favor, verifícala en tu panel de control.");
      } else {
        setError(`Error en el análisis: ${errorMessage}. Asegúrate de que la imagen sea clara y que la API KEY esté configurada correctamente en el entorno.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-brand-lime/20 relative">
      {/* Dynamic Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] grayscale invert"
        style={{
          backgroundImage: 'url("https://storage.googleapis.com/test-media-human-eval/temp/ais/63a1441b-a910-438d-80bb-698f24b216ce.png")',
          backgroundSize: '800px',
          backgroundRepeat: 'repeat',
          zIndex: -1
        }}
      />
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-32 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="h-32 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2 hover:text-brand-navy transition-colors cursor-pointer group">
              <TrendingUp size={14} className="group-hover:text-brand-lime transition-colors" /> XAUUSD Expert
            </span>
            <span className="flex items-center gap-2 hover:text-brand-navy transition-colors cursor-pointer group">
              <ShieldCheck size={14} className="group-hover:text-brand-lime transition-colors" /> Smart Money
            </span>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer group ml-4"
            >
              <LogOut size={14} /> Salir
            </button>
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
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden aspect-[4/3] flex items-center justify-center
                ${image 
                  ? 'border-brand-lime/30 bg-white' 
                  : isDragging
                    ? 'border-brand-lime bg-slate-50 scale-[1.02] shadow-2xl shadow-brand-lime/10'
                    : 'border-slate-200 hover:border-brand-lime/50 bg-white hover:bg-slate-50'}`}
            >
              <AnimatePresence>
                {isDragging && !image && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center border-4 border-brand-lime pointer-events-none"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Upload className="text-brand-lime mb-4" size={56} />
                    </motion.div>
                    <p className="text-brand-navy font-black uppercase tracking-[0.2em] text-sm italic">Soltar para Escaneo</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Protocolo Cuantitativo XAU KIN</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {image ? (
                <img 
                  src={image} 
                  alt="Market Telemetry" 
                  className="w-full h-full object-contain p-4"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`text-center p-10 transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <Upload className="text-slate-300 group-hover:text-brand-lime" size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Ingresar Datos Visuales</p>
                  <p className="text-xs text-slate-400 mt-2">Pegar (Ctrl+V) o Clic para Cargar</p>
                  <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-widest font-bold">Telemetría (PNG/JPG)</p>
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
