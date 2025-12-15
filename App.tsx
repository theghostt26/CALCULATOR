import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Calculator, 
  Percent, 
  DollarSign, 
  Ruler, 
  Activity, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Menu,
  X,
  CreditCard,
  PieChart as PieChartIcon,
  Sparkles,
  Clock,
  Trash2,
  History,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  Image as ImageIcon,
  BookOpen,
  Coins,
  Wallet,
  RefreshCw,
  Globe,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  LayoutDashboard,
  Footprints,
  Droplets,
  BedDouble,
  BarChart3,
  Banknote
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell, 
  PieChart as RPieChart, 
  Pie
} from 'recharts';

// --- Types ---
interface CalculatorProps {
  onCalculate: (tool: string, expression: string, result: string) => void;
  transactions?: Transaction[];
  onAddTransaction?: (t: Transaction) => void;
  onDeleteTransaction?: (id: number) => void;
  cardClass?: string;
}

interface HistoryItem {
  tool: string;
  expression: string;
  result: string;
  timestamp: Date;
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
}

interface DiscountResult {
  saved: number;
  price: number;
}

interface Transaction {
  id: number;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  date: Date;
}

interface HealthData {
  date: string;
  steps: number;
  sleep: number;
  water: number;
}

// --- Global Styles ---
const glassCardBase = "backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-[2.5rem] w-full transition-all duration-300 border border-white/20 dark:border-white/10";
const glassInputClass = "w-full p-4 md:p-5 bg-white/95 dark:bg-[#121212]/60 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-bold text-lg shadow-inner";
const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-300";
const labelClass = "text-[11px] font-black text-gray-600 dark:text-gray-400 ml-2 mb-1.5 uppercase tracking-widest";

// --- Theme Definitions ---
const themes = {
  midnight: {
    name: 'Midnight',
    type: 'dark',
    bg: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0f0c29] to-[#302b63]',
    card: 'bg-slate-900/80 border-white/10',
    accent: 'text-purple-400',
    icon: '🌙',
    panel: 'bg-slate-950/80 border-r border-white/5'
  },
  ocean: {
    name: 'Ocean',
    type: 'dark',
    bg: 'bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#0f172a] via-[#1e293b] to-[#0B486B]',
    card: 'bg-slate-900/80 border-cyan-500/20',
    accent: 'text-cyan-400',
    icon: '🌊',
    panel: 'bg-slate-950/80 border-r border-cyan-500/10'
  },
  forest: {
    name: 'Forest',
    type: 'dark',
    bg: 'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#000000] via-[#134E5E] to-[#71B280]',
    card: 'bg-gray-900/80 border-emerald-500/20',
    accent: 'text-emerald-400',
    icon: '🌲',
    panel: 'bg-gray-950/80 border-r border-emerald-500/10'
  },
  sunset: {
    name: 'Sunset',
    type: 'dark',
    bg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#23074d] via-[#cc5333] to-[#ffb88c]',
    card: 'bg-[#23074d]/90 border-orange-500/20',
    accent: 'text-orange-400',
    icon: '🌅',
    panel: 'bg-[#1a053a]/90 border-r border-orange-500/10'
  },
  nebula: {
    name: 'Nebula',
    type: 'dark',
    bg: 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-[#240b36] via-[#c31432] to-[#240b36]',
    card: 'bg-[#240b36]/90 border-fuchsia-500/20',
    accent: 'text-fuchsia-400',
    icon: '🌌',
    panel: 'bg-[#1a0826]/90 border-r border-fuchsia-500/10'
  }
};

// --- Helper Components ---

const SubMenu = ({ 
  options, 
  active, 
  onChange, 
  className = ""
}: { 
  options: { id: string; label: string; icon?: React.ReactNode; activeColor?: string }[], 
  active: string, 
  onChange: (id: any) => void,
  className?: string
}) => {
  return (
    <div className={`
      flex p-1.5 gap-1.5 rounded-2xl bg-gray-100/80 dark:bg-black/40 border border-gray-200 dark:border-white/10 backdrop-blur-md mb-8
      overflow-x-auto scrollbar-hide shadow-inner
      ${className}
    `}>
      {options.map((opt) => {
        const isActive = active === opt.id;
        const activeTextColor = opt.activeColor || 'text-purple-600 dark:text-purple-300';
        
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`
              relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex-1 whitespace-nowrap
              ${isActive 
                ? `bg-white dark:bg-white/10 shadow-sm scale-100 ${activeTextColor} ring-1 ring-gray-200 dark:ring-white/10` 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5'}
            `}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const SimpleDonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if (total === 0) return (
     <div className="flex flex-col items-center justify-center h-52 bg-gray-100/50 dark:bg-white/5 rounded-full aspect-square mx-auto border-4 border-dashed border-gray-200 dark:border-gray-700/50">
        <PieChartIcon className="text-gray-300 dark:text-gray-600 mb-2" size={32} />
        <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">No data</span>
     </div>
  );

  return (
    <div className="relative w-60 h-60 mx-auto my-8 group">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full relative z-10 drop-shadow-2xl">
        {data.map((slice, i) => {
          const startPercent = cumulativePercent;
          const slicePercent = slice.value / total;
          cumulativePercent += slicePercent;
          const endPercent = cumulativePercent;
          if (slicePercent >= 0.999) return <circle key={i} cx="0" cy="0" r="1" fill={slice.color} />;
          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(endPercent);
          const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
          const pathData = [`M ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `L 0 0`].join(' ');
          return <path key={i} d={pathData} fill={slice.color} stroke="white" strokeWidth="0.06" className="dark:stroke-slate-900 transition-all duration-300 hover:scale-105 hover:opacity-90 origin-center cursor-pointer"><title>{slice.label}: {Math.round(slicePercent * 100)}%</title></path>;
        })}
        <circle cx="0" cy="0" r="0.6" fill="currentColor" className="text-white dark:text-slate-900/90 shadow-inner" />
      </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total</span>
          <span className="text-2xl font-black text-gray-800 dark:text-white">
            {total >= 1000000 ? (total/1000000).toFixed(1) + 'M' : total >= 1000 ? (total/1000).toFixed(1) + 'k' : total.toFixed(0)}
          </span>
       </div>
    </div>
  );
};

const FormulaReveal = ({ formulas }: { formulas: { title: string, exp: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-6">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 transition-colors uppercase tracking-wider mb-2">
        <BookOpen size={14} />{isOpen ? 'Hide Formulas' : 'Show Formulas'}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-800/50 text-sm">
           {formulas.map((f, i) => (<div key={i} className="mb-1 last:mb-0"><span className="font-bold text-gray-700 dark:text-gray-300">{f.title}: </span><span className="font-mono text-gray-600 dark:text-gray-400">{f.exp}</span></div>))}
        </div>
      </div>
    </div>
  );
};

const HistoryEntry: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(`${item.expression} = ${item.result}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="bg-white/80 dark:bg-white/5 p-4 rounded-2xl border border-white/50 dark:border-white/10 hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md group relative backdrop-blur-md">
      <div className="flex justify-between items-start">
        <div className="flex flex-col flex-1 min-w-0 pr-2">
           <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-white/10 text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider">{item.tool}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">{item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
           </div>
           <div className="text-sm text-gray-900 dark:text-gray-200 mb-1 break-all font-semibold leading-relaxed">{item.expression}</div>
           <div className={`text-xl font-bold ${gradientText} truncate`}>{item.result}</div>
        </div>
        <button onClick={handleCopy} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0">{copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}</button>
      </div>
    </div>
  );
};

// --- Calculator Components ---

// 1. Standard Calculator
const StandardCalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const handlePress = (val: string) => {
    if (val === 'C') { setDisplay('0'); setEquation(''); } 
    else if (val === '=') { try { const safeEquation = equation.replace(/×/g, '*').replace(/÷/g, '/'); const result = new Function('return ' + safeEquation)(); const resultStr = String(result); if (equation && equation !== resultStr) onCalculate('Standard', equation, resultStr); setDisplay(resultStr); setEquation(resultStr); } catch (e) { setDisplay('Error'); } } 
    else if (['+', '-', '×', '÷', '%'].includes(val)) { setEquation(equation + (val === '×' ? '*' : val === '÷' ? '/' : val)); setDisplay(val); } 
    else { if (display === '0' || ['+', '-', '×', '÷', '%'].includes(display)) setDisplay(val); else setDisplay(display + val); setEquation(equation + val); }
  };
  const buttons = ['C', '%', '÷', '×', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'];
  return (
    <div className={`flex flex-col h-full w-full max-w-sm md:max-w-md mx-auto ${glassCardBase} ${cardClass} overflow-hidden shadow-2xl`}>
      <div className="p-6 md:p-8 text-right h-48 flex flex-col justify-end bg-gradient-to-b from-gray-50/80 to-gray-50/20 dark:from-[#050505]/60 dark:to-[#0a0a0a]/20 border-b border-white/10">
        <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 h-6 font-bold tracking-wide">{equation}</div>
        <div className="text-5xl md:text-6xl text-gray-900 dark:text-white font-bold tracking-tight truncate drop-shadow-sm">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-3 p-4 md:p-5 bg-white/40 dark:bg-black/40 backdrop-blur-md flex-1 border-t border-white/20 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {buttons.map((btn, idx) => (
          <button key={idx} onClick={() => handlePress(btn)} className={`text-2xl rounded-[1.2rem] font-bold transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm ${btn === '=' ? 'bg-blue-600 dark:bg-blue-600 text-white col-span-1 row-span-2 h-full shadow-blue-500/40 hover:bg-blue-500' : ''} ${btn === 'C' ? 'text-rose-600 bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30' : ''} ${['÷', '×', '-', '+'].includes(btn) ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30' : 'bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-gray-800 dark:text-white'} ${btn === '0' ? 'col-span-2' : ''}`}>{btn}</button>
        ))}
      </div>
    </div>
  );
};

// 2. AI Math Helper
const AIMathHelper: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [query, setQuery] = useState('');
  const [preferredUnit, setPreferredUnit] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing AI...');
  const [image, setImage] = useState<{ data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
        const messages = ["Parsing your request...", "Consulting Pythagoras...", "Crunching the numbers...", "Analyzing patterns...", "Deciphering matrix...", "Formulating solution...", "Double-checking logic...", "Almost there..."];
        let i = 0; setLoadingMessage(messages[0]);
        interval = setInterval(() => { i = (i + 1) % messages.length; setLoadingMessage(messages[i]); }, 1800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => { const matches = (reader.result as string).match(/^data:(.+);base64,(.+)$/); if (matches) setImage({ mimeType: matches[1], data: matches[2] }); }; reader.readAsDataURL(file); }
  };
  const removeImage = () => { setImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const handleClear = () => { setQuery(''); setPreferredUnit(''); setResponse(''); setImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSolve = async () => {
    if (!query.trim() && !image) return;
    setLoading(true); setResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const instructions = `You are an expert Math Tutor AI. CRITICAL: 1. Provide detailed step-by-step solution. 2. Show reasoning. 3. ${preferredUnit ? `Convert final answer to ${preferredUnit}.` : 'Use appropriate units.'} 4. No LaTeX/markdown math (no $$). Use plain text. 5. No currency symbols in steps.`;
      const contents = image ? { parts: [ { inlineData: { mimeType: image.mimeType, data: image.data } }, { text: query ? `${instructions} \n Analyze this image and solve: "${query}".` : `${instructions} \n Analyze and solve step-by-step.` } ] } : `${instructions} \n Solve: "${query}".`;
      const result = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: contents });
      const text = result.text?.replace(/\$\$/g, '').replace(/\\\[/g, '').replace(/\\\]/g, ''); 
      if (text) { setResponse(text); onCalculate('AI Math', query || (image ? 'Image Analysis' : 'Question'), 'Solved'); } else setResponse("Sorry, I couldn't generate a solution.");
    } catch (error) { console.error(error); setResponse("Connection error. Please check your API key."); } finally { setLoading(false); }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 md:p-10 ${glassCardBase} ${cardClass} h-full flex flex-col relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-40 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4 relative z-10">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-2xl shadow-inner border border-white/20"><Sparkles className="text-purple-600 dark:text-purple-400" size={24} /></div>AI Math Solver
      </h3>
      <div className="flex-1 flex flex-col gap-6 relative z-10">
        <div className="relative group">
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder={image ? "Add specific instructions about the image..." : "Type a problem (e.g., '5kg + 200g in g', 'Calculate area')..."} className={`${glassInputClass} h-40 resize-none pr-4 text-lg leading-relaxed`} />
          {image && <div className="absolute bottom-4 right-4 z-10"><div className="relative group"><img src={`data:${image.mimeType};base64,${image.data}`} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-purple-500 shadow-lg" /><button onClick={removeImage} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"><X size={14} /></button></div></div>}
        </div>
        <div><input type="text" value={preferredUnit} onChange={(e) => setPreferredUnit(e.target.value)} placeholder="Target Output Unit (Optional)" className={glassInputClass} /></div>
        <div className="flex flex-col md:flex-row gap-3">
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
            <div className="flex gap-3">
               <button onClick={() => fileInputRef.current?.click()} className={`flex-1 md:flex-none p-4 rounded-2xl font-bold transition-all shadow-lg border border-white/30 flex items-center justify-center bg-white/60 dark:bg-white/5 text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 px-6 ${image ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`} title="Upload Image"><ImageIcon size={24} className={image ? "text-purple-600 dark:text-purple-400" : ""} /></button>
               <button onClick={handleClear} disabled={!query && !image && !response} className={`flex-1 md:flex-none p-4 rounded-2xl font-bold transition-all shadow-lg border border-white/30 flex items-center justify-center bg-white/60 dark:bg-white/5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-6`} title="Clear"><Trash2 size={24} /></button>
            </div>
            <button onClick={handleSolve} disabled={loading || (!query && !image)} className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/25 active:scale-95 ${loading || (!query && !image) ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110'}`}>{loading ? <span className="animate-pulse">{loadingMessage}</span> : <><Sparkles size={20} /> {image ? 'Analyze & Solve' : 'Solve Magic'}</>}</button>
        </div>
        {response && <div className="flex-1 overflow-y-auto bg-white/80 dark:bg-black/40 border border-white/30 dark:border-white/10 rounded-3xl p-6 md:p-8 mt-4 shadow-inner animate-fade-in-up backdrop-blur-sm max-h-[500px]"><div className="text-gray-900 dark:text-gray-100 text-base md:text-lg whitespace-pre-wrap leading-relaxed font-semibold">{response}</div></div>}
      </div>
    </div>
  );
};

// 3. Percentage Calculator
const PercentageCalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [mode, setMode] = useState<'findValue' | 'findPercent'>('findValue'); 
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const handleCalculate = () => {
    const v1 = parseFloat(val1); const v2 = parseFloat(val2);
    if (isNaN(v1) || isNaN(v2)) return;
    let res = 0; let exp = '';
    if (mode === 'findValue') { res = (v1 / 100) * v2; exp = `${v1}% of ${v2}`; } else { res = (v1 / v2) * 100; exp = `${v1} is what % of ${v2}`; }
    setResult(res); onCalculate('Percentage', exp, mode === 'findValue' ? res.toFixed(2) : res.toFixed(2) + '%');
  };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl"><Percent className="text-cyan-600 dark:text-cyan-400" /></div>Percentage
      </h3>
      <SubMenu options={[{id: 'findValue', label: '% Value', activeColor: 'text-cyan-600 dark:text-cyan-300'},{id: 'findPercent', label: 'Find %', activeColor: 'text-cyan-600 dark:text-cyan-300'}]} active={mode} onChange={setMode} />
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-xl text-gray-900 dark:text-white font-bold flex-wrap">
          {mode === 'findValue' ? <span>What is</span> : null}
          <input type="number" placeholder="0" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-28 p-3 text-center bg-white/90 dark:bg-black/50 rounded-xl border border-cyan-500/30 outline-none font-bold text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-cyan-500/50" />
          {mode === 'findValue' ? <span>% of</span> : <span>is what % of</span>}
        </div>
        <div className="flex items-center gap-3">
            <input type="number" placeholder="0" value={val2} onChange={(e) => setVal2(e.target.value)} className={glassInputClass} />
        </div>
        <button onClick={handleCalculate} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-2xl mt-4 font-bold shadow-lg hover:shadow-cyan-500/40 transition-all">Calculate</button>
        {result !== null && (<div className="mt-6 p-6 bg-cyan-50/90 dark:bg-cyan-900/40 rounded-2xl text-center border border-cyan-200 dark:border-cyan-800"><p className="text-xs text-cyan-700 dark:text-cyan-300 font-bold uppercase tracking-widest">Result</p><p className="text-4xl font-black text-cyan-900 dark:text-white mt-2 drop-shadow-md">{mode === 'findValue' ? result.toFixed(2) : (result.toFixed(2) + '%')}</p></div>)}
      </div>
    </div>
  );
};

// 4. EMI Calculator
const EMICalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [amount, setAmount] = useState(100000); const [rate, setRate] = useState(10); const [tenure, setTenure] = useState(12); const [result, setResult] = useState<number | null>(null);
  const handleCalculate = () => { const r = rate / 12 / 100; const calcEmi = amount * r * (Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1)); const emiVal = isNaN(calcEmi) ? 0 : calcEmi; setResult(emiVal); onCalculate('EMI Loan', `₹${amount} @ ${rate}% for ${tenure}m`, `₹${emiVal.toFixed(2)}`); };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl"><CreditCard className="text-blue-600 dark:text-blue-400" /></div>EMI Calculator</h3><div className="space-y-4"><div><label className={labelClass}>LOAN AMOUNT</label><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={glassInputClass} /></div><div><label className={labelClass}>INTEREST RATE (%)</label><input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className={glassInputClass} /></div><div><label className={labelClass}>TENURE (MONTHS)</label><input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className={glassInputClass} /></div><button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-blue-600/40 transition-all mt-2">Calculate EMI</button>{result !== null && (<div className="mt-6 p-6 bg-blue-50/90 dark:bg-blue-900/40 rounded-2xl text-center border border-blue-200 dark:border-blue-800"><p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-widest">Monthly EMI</p><p className="text-4xl font-black text-blue-900 dark:text-white mt-2 drop-shadow-md">₹ {result.toFixed(2)}</p></div>)}</div></div>
  );
};

// New Tool: Loan Payment Calculator
const LoanPaymentCalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [amount, setAmount] = useState(250000);
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(30); // Years
  const [result, setResult] = useState<{monthly: number, total: number, interest: number} | null>(null);

  const calculate = () => {
    const r = rate / 100 / 12;
    const n = term * 12;
    // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    const monthly = amount * ( (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) );
    
    if (isFinite(monthly)) {
        const total = monthly * n;
        const interest = total - amount;
        setResult({ monthly, total, interest });
        onCalculate('Loan Payment', `$${amount} @ ${rate}% / ${term}yr`, `$${monthly.toFixed(2)}/mo`);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl"><Banknote className="text-indigo-600 dark:text-indigo-400" /></div>Loan Payment Calculator
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-4">
            <div><label className={labelClass}>LOAN AMOUNT</label><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={glassInputClass} /></div>
            <div><label className={labelClass}>INTEREST RATE (%)</label><input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className={glassInputClass} /></div>
            <div><label className={labelClass}>TERM (YEARS)</label><input type="number" value={term} onChange={(e) => setTerm(Number(e.target.value))} className={glassInputClass} /></div>
            <button onClick={calculate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg mt-4 transition-all hover:scale-[1.02]">Calculate Payment</button>
         </div>
         <div className="flex flex-col justify-center">
            {result ? (
               <div className="bg-indigo-50/90 dark:bg-indigo-900/40 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800 h-full flex flex-col justify-center gap-4">
                  <div>
                     <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-widest">Monthly Payment</p>
                     <p className="text-4xl font-black text-indigo-900 dark:text-white truncate drop-shadow-md">${result.monthly.toFixed(2)}</p>
                  </div>
                  <div className="w-full h-px bg-indigo-200 dark:bg-indigo-700"></div>
                  <div>
                     <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold uppercase">Total Interest</p>
                     <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">${result.interest.toFixed(2)}</p>
                  </div>
                  <div>
                     <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold uppercase">Total Cost</p>
                     <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">${result.total.toFixed(2)}</p>
                  </div>
               </div>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-400 bg-black/5 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                  <span className="text-sm font-medium">Enter details to calculate</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

// 5. Discount Calculator
const DiscountCalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [price, setPrice] = useState(''); const [discount, setDiscount] = useState(''); const [final, setFinal] = useState<DiscountResult | null>(null);
  const calculate = () => { const p = Number(price); const d = Number(discount); if (!p || !d) return; const savedAmount = (p * d) / 100; const finalPrice = p - savedAmount; setFinal({ saved: savedAmount, price: finalPrice }); onCalculate('Discount', `${d}% off on ₹${p}`, `₹${finalPrice.toFixed(2)}`); };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl"><Percent className="text-green-600 dark:text-green-400" /></div>Discount</h3><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>PRICE</label><input type="number" className={glassInputClass} onChange={(e) => setPrice(e.target.value)} /></div><div><label className={labelClass}>DISCOUNT %</label><input type="number" className={glassInputClass} onChange={(e) => setDiscount(e.target.value)} /></div></div><button onClick={calculate} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-green-600/40 transition-all">Calculate</button>{final && (<div className="grid grid-cols-2 gap-4 mt-4"><div className="bg-red-50/90 dark:bg-red-900/40 p-4 rounded-2xl text-center border border-red-200 dark:border-red-800"><p className="text-xs text-red-800 dark:text-red-300 font-bold">SAVED</p><p className="text-xl font-bold text-red-900 dark:text-red-100">₹{final.saved.toFixed(2)}</p></div><div className="bg-green-50/90 dark:bg-green-900/40 p-4 rounded-2xl text-center border border-green-200 dark:border-green-800"><p className="text-xs text-green-800 dark:text-green-300 font-bold">PAY</p><p className="text-2xl font-bold text-green-900 dark:text-white">₹{final.price.toFixed(2)}</p></div></div>)}</div></div>
  );
};

// 6. Currency Converter
const CurrencyConverter: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [amount, setAmount] = useState(1); const [from, setFrom] = useState('USD'); const [to, setTo] = useState('INR'); const [result, setResult] = useState<string | null>(null); const [rates, setRates] = useState<Record<string, number> | null>(null); const [loading, setLoading] = useState(false); const [lastUpdated, setLastUpdated] = useState<string>(''); const [error, setError] = useState(false);
  const fallbackRates: Record<string, number> = { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, JPY: 150.2, AUD: 1.52, CAD: 1.35, CHF: 0.91, CNY: 7.23, SGD: 1.35, NZD: 1.63 };
  const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "NZD", "AED", "ZAR", "BRL"];
  const fetchRates = async () => { setLoading(true); setError(false); try { const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD'); if (!res.ok) throw new Error('Network response was not ok'); const data = await res.json(); setRates(data.rates); const date = new Date(data.time_last_updated * 1000); setLastUpdated(date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})); } catch (err) { console.error("Currency fetch error:", err); setError(true); setRates(fallbackRates); setLastUpdated('Offline (Using Fallback Rates)'); } finally { setLoading(false); } };
  useEffect(() => { fetchRates(); }, []);
  const handleConvert = () => { if (!rates) return; const fromRate = rates[from] || 1; const toRate = rates[to] || 1; const res = ((amount / fromRate) * toRate).toFixed(2); setResult(res); onCalculate('Currency', `${amount} ${from} to ${to}`, `${res} ${to}`); };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><div className="flex justify-between items-start mb-6"><h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3"><div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl"><DollarSign className="text-amber-600 dark:text-amber-400" /></div>Currency</h3><button onClick={fetchRates} className={`p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-gray-500 hover:text-amber-600 transition-all ${loading ? 'animate-spin' : ''}`}><RefreshCw size={18} /></button></div><div className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-white/5 p-2 rounded-lg w-fit mx-auto">{error ? <WifiOff size={12} className="text-red-500" /> : <Globe size={12} className="text-green-500" />}<span>{error ? 'Offline Mode' : 'Live Rates'}</span>{lastUpdated && <span className="opacity-50 border-l border-gray-300 dark:border-gray-600 pl-2 ml-1">{lastUpdated}</span>}</div><div className="space-y-4"><div className="relative"><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={`${glassInputClass} text-2xl font-bold`} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Amount</span></div><div className="flex gap-4 items-center"><div className="flex-1 relative"><select value={from} onChange={(e) => setFrom(e.target.value)} className={`${glassInputClass} appearance-none font-bold`}>{currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></div><ArrowRight className="text-gray-400" /><div className="flex-1 relative"><select value={to} onChange={(e) => setTo(e.target.value)} className={`${glassInputClass} appearance-none font-bold`}>{currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div><button onClick={handleConvert} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-amber-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed">{loading ? 'Fetching Rates...' : 'Convert Now'}</button>{result && (<div className="bg-amber-50/90 dark:bg-amber-900/40 p-6 rounded-2xl text-center mt-4 border border-amber-200 dark:border-amber-800 animate-fade-in-up"><p className="text-xs text-amber-700 dark:text-amber-300 font-bold uppercase tracking-widest mb-1">Converted Amount</p><p className="text-4xl font-black text-amber-900 dark:text-white drop-shadow-md">{result} <span className="text-lg font-normal opacity-70">{to}</span></p><p className="text-[10px] text-gray-400 mt-2">1 {from} = {(rates && rates[from] && rates[to]) ? (rates[to]/rates[from]).toFixed(4) : '-'} {to}</p></div>)}</div></div>
  );
};

// 7. Unit Converter
const UnitConverter: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [val, setVal] = useState(0); const [type, setType] = useState('Length'); const [fromUnit, setFromUnit] = useState('m'); const [toUnit, setToUnit] = useState('ft'); const [result, setResult] = useState<number | null>(null);
  const unitTypes: Record<string, Record<string, number>> = { Length: { m: 1, km: 1000, cm: 0.01, ft: 0.3048, inch: 0.0254, mi: 1609.34 }, Weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 } };
  const handleConvert = () => { let res = 0; if (type === 'Temperature') { if (fromUnit === 'C' && toUnit === 'F') res = (val * 9/5) + 32; else if (fromUnit === 'F' && toUnit === 'C') res = (val - 32) * 5/9; else res = val; } else { if (!unitTypes[type][fromUnit] || !unitTypes[type][toUnit]) return; const inBase = val * unitTypes[type][fromUnit]; res = inBase / unitTypes[type][toUnit]; } setResult(res); onCalculate('Unit Convert', `${val} ${fromUnit} to ${toUnit}`, `${res.toFixed(4)}`); };
  const setPreset = (t: string, f: string, to: string) => { setType(t); setFromUnit(f); setToUnit(to); setVal(0); setResult(null); };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-xl"><Ruler className="text-pink-600 dark:text-pink-400" /></div>Unit Converter</h3><SubMenu options={['Length', 'Weight', 'Temperature'].map(t => ({id: t, label: t, activeColor: 'text-pink-600 dark:text-pink-300'}))} active={type} onChange={(id) => { setType(id); setVal(0); setResult(null); }} /><div className="grid grid-cols-2 gap-4"><input type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} className={glassInputClass} /><select className={glassInputClass} onChange={(e) => setFromUnit(e.target.value)} value={fromUnit}>{type === 'Temperature' ? <><option value="C">Celsius</option><option value="F">Fahrenheit</option></> : Object.keys(unitTypes[type]).map(u => <option key={u} value={u}>{u}</option>)}</select><div className="col-span-2 flex justify-center"><ArrowRight className="text-gray-400 rotate-90" /></div><div className={`col-span-1 flex items-center justify-center font-bold text-xl text-gray-900 dark:text-white bg-white/80 dark:bg-black/40 rounded-2xl border border-white/20 shadow-inner`}>{result !== null ? result.toFixed(4) : '-'}</div><select className={glassInputClass} onChange={(e) => setToUnit(e.target.value)} value={toUnit}>{type === 'Temperature' ? <><option value="F">Fahrenheit</option><option value="C">Celsius</option></> : Object.keys(unitTypes[type]).map(u => <option key={u} value={u}>{u}</option>)}</select></div><div className="grid grid-cols-4 gap-2 mt-4"><button onClick={() => setPreset('Length', 'm', 'ft')} className="px-2 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400 transition-colors">m → ft</button><button onClick={() => setPreset('Length', 'km', 'mi')} className="px-2 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400 transition-colors">km → mi</button><button onClick={() => setPreset('Weight', 'kg', 'lb')} className="px-2 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400 transition-colors">kg → lb</button><button onClick={() => setPreset('Temperature', 'C', 'F')} className="px-2 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400 transition-colors">°C → °F</button></div><button onClick={handleConvert} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl mt-4 font-bold shadow-lg">Convert</button></div>
  );
};

// 8. Interest Calculator
const InterestCalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [p, setP] = useState(10000); const [r, setR] = useState(5); const [t, setT] = useState(1); const [type, setType] = useState('Simple'); const [result, setResult] = useState<number | null>(null);
  const handleCalculate = () => { let res = 0; if (type === 'Simple') res = (p * r * t) / 100; else res = p * (Math.pow((1 + r / 100), t)) - p; setResult(res); onCalculate('Interest', `${type} Interest on ₹${p}`, `₹${res.toFixed(2)}`); };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl"><TrendingUp className="text-teal-600 dark:text-teal-400" /></div>Interest</h3><SubMenu options={[{id: 'Simple', label: 'Simple Interest', activeColor: 'text-teal-600 dark:text-teal-300'},{id: 'Compound', label: 'Compound Interest', activeColor: 'text-teal-600 dark:text-teal-300'}]} active={type} onChange={setType} /><div className="space-y-4"><div><label className={labelClass}>PRINCIPAL</label><input type="number" value={p} onChange={(e) => setP(Number(e.target.value))} className={glassInputClass} /></div><div><label className={labelClass}>RATE (%)</label><input type="number" value={r} onChange={(e) => setR(Number(e.target.value))} className={glassInputClass} /></div><div><label className={labelClass}>TIME (YEARS)</label><input type="number" value={t} onChange={(e) => setT(Number(e.target.value))} className={glassInputClass} /></div><button onClick={handleCalculate} className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg mt-2">Calculate</button></div>{result !== null && (<div className="mt-6 p-6 bg-teal-50/90 dark:bg-teal-900/40 rounded-2xl border border-teal-200 dark:border-teal-800"><div className="flex justify-between items-center mb-2"><span className="text-teal-700 dark:text-teal-300 font-bold text-sm">Interest</span><span className="text-xl font-black text-teal-900 dark:text-white">₹ {result.toFixed(2)}</span></div><div className="flex justify-between items-center border-t border-teal-200 dark:border-teal-700 pt-2 mt-2"><span className="text-teal-700 dark:text-teal-300 font-bold text-sm">Total</span><span className="text-xl font-black text-teal-900 dark:text-white">₹ {(p + result).toFixed(2)}</span></div></div>)}</div>
  );
};

// 9. Investment Calculator
const InvestmentCalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip'); const [initial, setInitial] = useState(10000); const [monthly, setMonthly] = useState(1000); const [rate, setRate] = useState(12); const [years, setYears] = useState(5); const [result, setResult] = useState<{total: number, invested: number} | null>(null);
  const calculate = () => { const r = rate / 100 / 12; const annualR = rate / 100; const n = years * 12; let fvInitial = 0; let fvSeries = 0; let investedVal = 0; if (mode === 'sip') { fvInitial = initial * Math.pow(1 + r, n); fvSeries = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r); investedVal = initial + (monthly * n); } else { fvInitial = initial * Math.pow(1 + annualR, years); fvSeries = 0; investedVal = initial; } const totalVal = fvInitial + fvSeries; setResult({ total: totalVal, invested: investedVal }); onCalculate('Investment', `${mode === 'sip' ? 'SIP' : 'Lumpsum'} ${years}y @ ${rate}%`, `₹${totalVal.toFixed(0)}`); };
  const chartData = result ? [ { label: 'Invested', value: result.invested, color: '#059669' }, { label: 'Returns', value: result.total - result.invested, color: '#3B82F6' } ] : [];
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl"><Coins className="text-emerald-600 dark:text-emerald-400" /></div>Investment</h3><SubMenu options={[{id: 'sip', label: 'SIP + Initial', activeColor: 'text-emerald-600 dark:text-emerald-300'},{id: 'lumpsum', label: 'Lumpsum Only', activeColor: 'text-emerald-600 dark:text-emerald-300'}]} active={mode} onChange={setMode} /><div className="space-y-4"><div><label className={labelClass}>INITIAL AMOUNT</label><input type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} className={glassInputClass} /></div>{mode === 'sip' && (<div className="animate-fade-in-up"><label className={labelClass}>MONTHLY SIP</label><input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className={glassInputClass} /></div>)}<div><label className={labelClass}>EXP. RETURN (% YR)</label><input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className={glassInputClass} /></div><div><label className={labelClass}>PERIOD (YEARS)</label><input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className={glassInputClass} /></div><button onClick={calculate} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg mt-2">Calculate Returns</button></div>{result && (<div className="mt-6 animate-fade-in-up"><SimpleDonutChart data={chartData} /><div className="p-6 bg-emerald-50/90 dark:bg-emerald-900/40 rounded-2xl border border-emerald-100 dark:border-emerald-800 mt-4"><div className="flex justify-between items-center mb-2"><span className="text-emerald-700 dark:text-emerald-300 font-medium text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-600"></div> Invested</span><span className="text-lg font-bold text-emerald-900 dark:text-white">₹ {result.invested.toLocaleString()}</span></div><div className="flex justify-between items-center mb-2"><span className="text-blue-600 dark:text-blue-300 font-medium text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Wealth Gain</span><span className="text-lg font-bold text-blue-700 dark:text-blue-200">+₹ {(result.total - result.invested).toLocaleString()}</span></div><div className="flex justify-between items-center border-t border-emerald-200 dark:border-emerald-700 pt-3 mt-2"><span className="text-emerald-800 dark:text-emerald-200 font-bold text-base">Total Value</span><span className="text-2xl font-black text-emerald-900 dark:text-white">₹ {Math.round(result.total).toLocaleString()}</span></div></div></div>)}</div>
  );
};

// 14. Financial Dashboard (New)
const FinancialDashboard: React.FC<CalculatorProps> = ({ transactions = [], cardClass }) => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Income', amount: totalIncome, fill: '#10b981' },
    { name: 'Expense', amount: totalExpense, fill: '#ef4444' },
  ];

  const recentTx = [...transactions].sort((a,b) => b.id - a.id).slice(0, 5);

  return (
    <div className={`w-full max-w-5xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl"><LayoutDashboard className="text-indigo-600 dark:text-indigo-400" /></div>
        Financial Dashboard
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
               <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
               <p className="text-4xl font-black">₹{balance.toLocaleString()}</p>
            </div>
            <div className="absolute right-0 bottom-0 p-8 bg-white/10 rounded-full blur-2xl -mr-6 -mb-6"></div>
         </div>
         
         <div className="p-6 rounded-3xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-sm flex flex-col justify-center">
             <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Total Income</span>
                <div className="p-1.5 bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><TrendingUp size={16}/></div>
             </div>
             <p className="text-2xl font-black text-gray-900 dark:text-white">₹{totalIncome.toLocaleString()}</p>
         </div>

         <div className="p-6 rounded-3xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-sm flex flex-col justify-center">
             <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Total Expenses</span>
                <div className="p-1.5 bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><TrendingDown size={16}/></div>
             </div>
             <p className="text-2xl font-black text-gray-900 dark:text-white">₹{totalExpense.toLocaleString()}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="p-6 rounded-3xl bg-white/40 dark:bg-black/20 border border-white/10 shadow-inner h-80 flex flex-col">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><BarChart3 size={18} className="opacity-70"/> Income vs Expense</h4>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#888" fontSize={12} dy={10} />
                     <RechartsTooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}}
                     />
                     <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="p-6 rounded-3xl bg-white/40 dark:bg-black/20 border border-white/10 shadow-inner h-80 flex flex-col">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><History size={18} className="opacity-70"/> Recent Transactions</h4>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
               {recentTx.length > 0 ? recentTx.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3.5 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/10">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                           {t.type === 'income' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{t.desc}</p>
                           <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t.category}</p>
                        </div>
                     </div>
                     <span className={`text-sm font-black ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount}
                     </span>
                  </div>
               )) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                     <Wallet size={32} className="mb-2 opacity-50"/>
                     <span className="text-xs font-bold uppercase tracking-widest opacity-70">No transactions</span>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

// 10. Budget Tracker
const BudgetTracker: React.FC<CalculatorProps> = ({ onCalculate, transactions = [], onAddTransaction, onDeleteTransaction, cardClass }) => {
  const [amount, setAmount] = useState(''); 
  const [desc, setDesc] = useState(''); 
  const [type, setType] = useState<'income' | 'expense'>('expense'); 
  const [category, setCategory] = useState('Food');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const categories = { income: ['Salary', 'Freelance', 'Investment', 'Other'], expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other'] };
  
  const handleAdd = () => { if(!amount || !desc) return; const val = parseFloat(amount); if(isNaN(val) || val <= 0) return; const newTx: Transaction = { id: Date.now(), desc, amount: val, type, category, recurrence: 'none', date: new Date() }; if (onAddTransaction) onAddTransaction(newTx); setAmount(''); setDesc(''); };
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0); 
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0); 
  const balance = totalIncome - totalExpense;

  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(i => i.name === t.category);
      if (existing) { existing.value += t.amount; }
      else { acc.push({ name: t.category, value: t.amount }); }
      return acc;
    }, [] as { name: string, value: number }[]);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

  return (
    <div className={`w-full max-w-4xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl"><Wallet className="text-emerald-600 dark:text-emerald-400" /></div>Budget Tracker
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-900/30 text-center shadow-inner border border-blue-100 dark:border-blue-800">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">Balance</span>
          <p className="text-xl md:text-2xl font-black text-blue-800 dark:text-white truncate">₹{balance.toFixed(0)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-green-50/80 dark:bg-green-900/30 text-center shadow-inner border border-green-100 dark:border-green-800">
          <span className="text-xs font-bold text-green-600 dark:text-green-300 uppercase">Income</span>
          <p className="text-xl md:text-2xl font-black text-green-800 dark:text-white truncate">+₹{totalIncome.toFixed(0)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-900/30 text-center shadow-inner border border-red-100 dark:border-red-800">
          <span className="text-xs font-bold text-red-600 dark:text-red-300 uppercase">Expense</span>
          <p className="text-xl md:text-2xl font-black text-red-800 dark:text-white truncate">-₹{totalExpense.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4 bg-white/40 dark:bg-white/5 p-6 rounded-3xl shadow-sm border border-white/20">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">New Transaction</h4>
          <SubMenu options={[{id: 'expense', label: 'Expense', icon: <TrendingDown size={16}/>, activeColor: 'text-red-600 dark:text-red-400'},{id: 'income', label: 'Income', icon: <TrendingUp size={16}/>, activeColor: 'text-green-600 dark:text-green-400'}]} active={type} onChange={(id) => { setType(id); setCategory(categories[id as 'income'|'expense'][0]); }} className="w-full mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className={glassInputClass} />
            <select value={category} onChange={e => setCategory(e.target.value)} className={glassInputClass}>
              {categories[type].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input type="text" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} className={glassInputClass} />
          <button onClick={handleAdd} className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold shadow-lg hover:scale-[1.02] transition-transform">Add Transaction</button>
        </div>

        <div className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h4 className="font-bold text-gray-700 dark:text-gray-300">Spending Analysis</h4>
             <div className="flex bg-gray-200 dark:bg-white/10 p-1 rounded-lg">
                <button onClick={() => setChartType('pie')} className={`p-1.5 rounded-md transition-all ${chartType === 'pie' ? 'bg-white dark:bg-white/20 shadow-sm' : 'text-gray-400'}`}><PieChartIcon size={16}/></button>
                <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-white/20 shadow-sm' : 'text-gray-400'}`}><BarChart3 size={16}/></button>
             </div>
          </div>
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                {chartType === 'pie' ? (
                   <RPieChart>
                      <Pie data={expenseData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff'}} itemStyle={{color: '#fff'}} />
                   </RPieChart>
                ) : (
                   <BarChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888840" />
                      <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff'}} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                   </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">No expenses yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {transactions.map(t => (
          <div key={t.id} className="flex justify-between items-center p-4 bg-white/60 dark:bg-white/5 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors border border-white/20">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {t.type === 'income' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white">{t.desc}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-black text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount}
              </span>
              <button onClick={() => onDeleteTransaction && onDeleteTransaction(t.id)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 11. BMI Calculator (Restored)
const BMICalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [weight, setWeight] = useState(''); const [height, setHeight] = useState(''); const [bmi, setBmi] = useState<string | null>(null);
  const calculateBMI = () => { const w = parseFloat(weight); const h = parseFloat(height); if (w && h) { const hInMeters = h / 100; const bmiVal = (w / (hInMeters * hInMeters)).toFixed(1); setBmi(bmiVal); onCalculate('BMI', `${w}kg, ${h}cm`, `BMI: ${bmiVal}`); } };
  const getStatus = (bVal: string) => { const b = parseFloat(bVal); if (b < 18.5) return { text: 'Underweight', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/40' }; if (b < 24.9) return { text: 'Normal', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/40' }; if (b < 29.9) return { text: 'Overweight', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/40' }; return { text: 'Obese', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40' }; };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl"><Activity className="text-orange-600 dark:text-orange-400" /></div>BMI</h3><div className="grid grid-cols-2 gap-4 mb-4"><input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className={glassInputClass} /><input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} className={glassInputClass} /></div><button onClick={calculateBMI} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg">Check BMI</button>{bmi && (<div className={`mt-6 p-8 rounded-2xl text-center ${getStatus(bmi).bg}`}><p className="text-sm font-bold opacity-70 mb-2">YOUR SCORE</p><p className="text-5xl font-black mb-4">{bmi}</p><span className={`px-6 py-2 rounded-full text-sm font-bold bg-white/60 dark:bg-black/30 backdrop-blur-sm ${getStatus(bmi).color}`}>{getStatus(bmi).text}</span></div>)}</div>
  );
};

// 12. Age Calculator (Restored)
const AgeCalculator: React.FC<CalculatorProps> = ({ onCalculate, cardClass }) => {
  const [dob, setDob] = useState(''); const [age, setAge] = useState<AgeResult | null>(null);
  const calculateAge = () => { if(!dob) return; const birthDate = new Date(dob); const today = new Date(); let years = today.getFullYear() - birthDate.getFullYear(); let months = today.getMonth() - birthDate.getMonth(); let days = today.getDate() - birthDate.getDate(); if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); } if (months < 0) { years--; months += 12; } setAge({ years, months, days }); onCalculate('Age Calc', `Born: ${dob}`, `${years}y ${months}m ${days}d`); };
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl"><Calendar className="text-indigo-600 dark:text-indigo-400" /></div>Age</h3><input type="date" onChange={(e) => setDob(e.target.value)} className={`${glassInputClass} mb-6 cursor-pointer`} /><button onClick={calculateAge} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg">Calculate</button>{age && (<div className="mt-8 grid grid-cols-3 gap-3 text-center"><div className="bg-indigo-50/80 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800"><p className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">{age.years}</p><p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase mt-1">YEARS</p></div><div className="bg-indigo-50/80 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800"><p className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">{age.months}</p><p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase mt-1">MONTHS</p></div><div className="bg-indigo-50/80 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800"><p className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">{age.days}</p><p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase mt-1">DAYS</p></div></div>)}</div>
  );
};

// 13. Health Metrics (New Tool)
const HealthMetrics: React.FC<CalculatorProps> = ({ cardClass }) => {
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [water, setWater] = useState('');
  const [history, setHistory] = useState<HealthData[]>(() => {
     const saved = localStorage.getItem('calc_health_metrics');
     return saved ? JSON.parse(saved) : [];
  });

  const handleAdd = () => {
     if(!steps && !sleep && !water) return;
     const today = new Date().toISOString().split('T')[0];
     const newItem: HealthData = {
         date: today,
         steps: Number(steps) || 0,
         sleep: Number(sleep) || 0,
         water: Number(water) || 0
     };
     // Replace today's entry if exists, else add
     const newHistory = [...history.filter(h => h.date !== today), newItem].sort((a,b) => a.date.localeCompare(b.date)).slice(-7); // Keep last 7 days
     setHistory(newHistory);
     localStorage.setItem('calc_health_metrics', JSON.stringify(newHistory));
     setSteps(''); setSleep(''); setWater('');
  };

  // Get today's values for display or last entry
  const todayEntry = history.find(h => h.date === new Date().toISOString().split('T')[0]);

  return (
    <div className={`w-full max-w-3xl mx-auto p-8 md:p-10 ${glassCardBase} ${cardClass}`}>
       <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
         <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl"><Activity className="text-rose-600 dark:text-rose-400" /></div>
         Health Metrics
       </h3>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="p-4 bg-orange-50/80 dark:bg-orange-900/30 rounded-2xl border border-orange-100 dark:border-orange-800">
               <div className="flex items-center gap-2 mb-2 text-orange-700 dark:text-orange-300 font-bold"><Footprints size={18}/> Steps</div>
               <input type="number" placeholder="0" value={steps} onChange={e => setSteps(e.target.value)} className="w-full bg-transparent text-2xl font-black outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white" />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-bold">Today: {todayEntry?.steps || 0}</p>
           </div>
           <div className="p-4 bg-indigo-50/80 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
               <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold"><BedDouble size={18}/> Sleep (h)</div>
               <input type="number" placeholder="0" value={sleep} onChange={e => setSleep(e.target.value)} className="w-full bg-transparent text-2xl font-black outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white" />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-bold">Today: {todayEntry?.sleep || 0}</p>
           </div>
           <div className="p-4 bg-cyan-50/80 dark:bg-cyan-900/30 rounded-2xl border border-cyan-100 dark:border-cyan-800">
               <div className="flex items-center gap-2 mb-2 text-cyan-700 dark:text-cyan-300 font-bold"><Droplets size={18}/> Water (L)</div>
               <input type="number" placeholder="0" value={water} onChange={e => setWater(e.target.value)} className="w-full bg-transparent text-2xl font-black outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white" />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-bold">Today: {todayEntry?.water || 0}</p>
           </div>
       </div>
       <button onClick={handleAdd} className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg mb-8">Log Metrics</button>
       
       {history.length > 0 && (
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888840" />
                  <XAxis dataKey="date" tickFormatter={(val) => val.slice(5)} stroke="#888888" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Legend />
                  <Bar dataKey="steps" fill="#f97316" radius={[4,4,0,0]} name="Steps" />
                  <Bar dataKey="sleep" fill="#6366f1" radius={[4,4,0,0]} name="Sleep" />
               </BarChart>
            </ResponsiveContainer>
         </div>
       )}
    </div>
  );
};

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState('Standard');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Left sidebar
  const [isHistoryOpen, setIsHistoryOpen] = useState(true); // Right sidebar
  const [themeKey, setThemeKey] = useState<keyof typeof themes>('midnight');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Automatically apply the correct theme class to the document root
  useEffect(() => {
    const root = window.document.documentElement;
    if (themes[themeKey].type === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeKey]);

  const addToHistory = (tool: string, expression: string, result: string) => {
    setHistory(prev => [{ tool, expression, result, timestamp: new Date() }, ...prev].slice(0, 50));
  };

  const handleAddTransaction = (t: Transaction) => {
      setTransactions(prev => [t, ...prev]);
  };

  const handleDeleteTransaction = (id: number) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Define components directly to be used in cloneElement
  const components: Record<string, React.ReactElement<CalculatorProps>> = {
    'Standard': <StandardCalculator onCalculate={addToHistory} />,
    'AI Math': <AIMathHelper onCalculate={addToHistory} />,
    'Percentage': <PercentageCalculator onCalculate={addToHistory} />,
    'Currency': <CurrencyConverter onCalculate={addToHistory} />,
    'Unit Convert': <UnitConverter onCalculate={addToHistory} />,
    'EMI Loan': <EMICalculator onCalculate={addToHistory} />,
    'Loan Pay': <LoanPaymentCalculator onCalculate={addToHistory} />,
    'Discount': <DiscountCalculator onCalculate={addToHistory} />,
    'Interest': <InterestCalculator onCalculate={addToHistory} />,
    'Investment': <InvestmentCalculator onCalculate={addToHistory} />,
    'Financial Dashboard': <FinancialDashboard onCalculate={addToHistory} transactions={transactions} />,
    'Budget': <BudgetTracker onCalculate={addToHistory} transactions={transactions} onAddTransaction={handleAddTransaction} onDeleteTransaction={handleDeleteTransaction} />,
    'BMI': <BMICalculator onCalculate={addToHistory} />,
    'Age Calc': <AgeCalculator onCalculate={addToHistory} />,
    'Health': <HealthMetrics onCalculate={addToHistory} />,
  };

  const menuItems = [
    { id: 'Standard', icon: <Calculator size={20} />, label: 'Calculator' },
    { id: 'AI Math', icon: <Sparkles size={20} />, label: 'AI Math Solver' },
    { id: 'Percentage', icon: <Percent size={20} />, label: 'Percentage' },
    { id: 'Currency', icon: <DollarSign size={20} />, label: 'Currency' },
    { id: 'Unit Convert', icon: <Ruler size={20} />, label: 'Unit Converter' },
    { id: 'EMI Loan', icon: <CreditCard size={20} />, label: 'EMI Loan' },
    { id: 'Loan Pay', icon: <Banknote size={20} />, label: 'Loan Payment' },
    { id: 'Discount', icon: <Percent size={20} />, label: 'Discount' },
    { id: 'Interest', icon: <TrendingUp size={20} />, label: 'Interest' },
    { id: 'Investment', icon: <Coins size={20} />, label: 'Investment' },
    { id: 'Financial Dashboard', icon: <LayoutDashboard size={20} />, label: 'Financial Dashboard' },
    { id: 'Budget', icon: <Wallet size={20} />, label: 'Budget Tracker' },
    { id: 'BMI', icon: <Activity size={20} />, label: 'BMI' },
    { id: 'Age Calc', icon: <Calendar size={20} />, label: 'Age Calculator' },
    { id: 'Health', icon: <Activity size={20} />, label: 'Health Metrics' },
  ];

  const currentTheme = themes[themeKey];
  const ActiveComponent = components[activeTool];

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${currentTheme.bg} text-gray-800 dark:text-gray-100 font-sans overflow-hidden`}>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 xl:hidden backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Sidebar (Left) */}
      <aside className={`
        fixed xl:relative z-40 h-screen w-72 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col border-r border-white/10
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0 xl:w-0 xl:overflow-hidden xl:border-none'}
        backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.4)] bg-gradient-to-br
        ${currentTheme.panel}
      `}>
        <div className="p-6 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white ring-1 ring-white/20">
                <LayoutDashboard size={22} />
             </div>
             <div>
               <h1 className="text-xl font-black text-white tracking-tight drop-shadow-md">CalcFlow</h1>
               <p className="text-xs text-gray-300/80 font-bold uppercase tracking-wide">Premium Suite</p>
             </div>
           </div>
           <button onClick={() => setIsMenuOpen(false)} className="xl:hidden p-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><PanelLeftClose size={20} /></button>
        </div>

        <div className="px-4 pb-4 shrink-0">
           <div className="bg-black/40 rounded-xl p-1 flex gap-1 mb-6 border border-white/10 shadow-inner">
              {Object.keys(themes).map((t) => (
                 <button 
                   key={t}
                   onClick={() => setThemeKey(t as any)}
                   className={`flex-1 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${themeKey === t ? 'bg-white/20 text-white shadow-lg scale-105 ring-1 ring-white/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                   title={themes[t as keyof typeof themes].name}
                 >
                    {themes[t as keyof typeof themes].icon}
                 </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar pb-6">
           <p className="px-4 text-[10px] font-black text-gray-400/60 uppercase tracking-[0.2em] mb-3 mt-2">Tools Library</p>
           {menuItems.map((item) => (
             <button
               key={item.id}
               onClick={() => { setActiveTool(item.id); if(window.innerWidth < 1280) setIsMenuOpen(false); }}
               className={`
                 w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden
                 ${activeTool === item.id 
                   ? `bg-gradient-to-r from-white/15 to-white/5 text-white shadow-lg border border-white/10 ${currentTheme.accent}` 
                   : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:pl-5'}
               `}
             >
               <span className={`transition-transform duration-300 group-hover:scale-110 ${activeTool === item.id ? 'text-white' : 'opacity-70'}`}>{item.icon}</span>
               <span className="relative z-10">{item.label}</span>
               {activeTool === item.id && (
                 <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-l-full"></div>
               )}
             </button>
           ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 z-10 shrink-0">
           <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 shadow-lg border border-white/5"
                title={isMenuOpen ? "Close Menu" : "Open Menu"}
             >
               {isMenuOpen ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />}
             </button>
             <h2 className="text-3xl font-black text-white/90 drop-shadow-lg tracking-tight hidden md:block">{menuItems.find(i => i.id === activeTool)?.label}</h2>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
                className={`
                  p-2.5 rounded-xl text-white transition-all hover:scale-105 active:scale-95 shadow-lg border border-white/5 hidden xl:flex items-center gap-2 font-bold text-sm
                  ${isHistoryOpen ? 'bg-blue-600/80 hover:bg-blue-600' : 'bg-white/10 hover:bg-white/20'}
                `}
                title="Toggle History"
              >
                 {isHistoryOpen ? (
                   <> <PanelRightClose size={20} /> <span>History</span> </>
                 ) : (
                   <> <PanelRightOpen size={20} /> <span>Open History</span> </>
                 )}
              </button>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 md:pt-0 custom-scrollbar pb-24">
           <div className="max-w-7xl mx-auto h-full flex gap-6 relative">
              
              {/* Tool Area - Flexible Width */}
              <div className="flex-1 min-w-0 flex flex-col transition-all duration-500">
                 <div className="flex-1 flex flex-col items-center justify-start pt-4">
                   <h2 className="text-2xl font-black text-white/90 drop-shadow-lg tracking-tight mb-6 md:hidden w-full text-center">{menuItems.find(i => i.id === activeTool)?.label}</h2>
                   {ActiveComponent && React.cloneElement(ActiveComponent, { cardClass: currentTheme.card })}
                 </div>
              </div>

              {/* Sidebar: History - Right Side */}
              <div className={`
                 fixed xl:relative right-0 top-0 h-full xl:h-auto z-20 xl:z-0
                 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex-col gap-6 shrink-0
                 ${isHistoryOpen ? 'w-80 translate-x-0 opacity-100' : 'w-0 translate-x-20 xl:translate-x-0 xl:w-0 opacity-0 overflow-hidden pointer-events-none'}
              `}>
                 <div className={`
                    flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-8rem)] h-full
                    ${glassCardBase} bg-black/20 backdrop-blur-xl border-white/10
                 `}>
                    <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                       <h3 className="font-bold text-white flex items-center gap-2">
                         <History size={18} className="text-blue-400"/> Recent History
                       </h3>
                       {history.length > 0 && (
                         <button onClick={() => setHistory([])} className="text-[10px] font-bold px-2 py-1 bg-rose-500/20 text-rose-300 rounded-lg hover:bg-rose-500/40 transition-colors uppercase tracking-wider">Clear All</button>
                       )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                       {history.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <div className="p-4 rounded-full bg-white/5 mb-3">
                               <Clock size={24} className="opacity-50"/>
                            </div>
                            <p className="text-sm font-bold opacity-60">No calculations yet</p>
                         </div>
                       ) : (
                         history.map((item, idx) => (
                           <HistoryEntry key={idx} item={item} />
                         ))
                       )}
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </main>
    </div>
  );
};

export default App;