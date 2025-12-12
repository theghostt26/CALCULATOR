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
  PieChart,
  Sun,
  Moon,
  Sparkles,
  Clock,
  Trash2,
  History,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  ListFilter,
  Image as ImageIcon,
  Upload,
  BookOpen,
  Coins,
  Wallet,
  Landmark,
  RefreshCw,
  Globe,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

// --- Types ---
interface CalculatorProps {
  onCalculate: (tool: string, expression: string, result: string) => void;
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
  date: Date;
}

// --- Global Styles for Liquid/Glass Effect ---
// Refined for better dark mode contrast and tint
const glassCardClass = "bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl dark:shadow-black/50 rounded-3xl";
const glassInputClass = "w-full p-4 bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-white";
const glassButtonClass = "p-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg border border-white/20 dark:border-white/5";
const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400";

// --- Helper Components ---

// Enhanced SubMenu Component
interface SubMenuOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  activeColor?: string; // Optional custom text color class for active state
}

const SubMenu = ({ 
  options, 
  active, 
  onChange, 
  className = ""
}: { 
  options: SubMenuOption[], 
  active: string, 
  onChange: (id: any) => void,
  className?: string
}) => {
  return (
    <div className={`
      flex p-1.5 gap-1 rounded-2xl bg-gray-100/80 dark:bg-black/40 border border-white/20 dark:border-white/5 backdrop-blur-md mb-6
      overflow-x-auto scrollbar-hide
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
              relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 whitespace-nowrap
              ${isActive 
                ? `bg-white dark:bg-slate-800 shadow-md scale-100 ${activeTextColor}` 
                : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}
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

// Simple Donut Chart Component
const SimpleDonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if (total === 0) return (
     <div className="flex flex-col items-center justify-center h-48 bg-gray-100/50 dark:bg-white/5 rounded-full aspect-square mx-auto border-4 border-dashed border-gray-200 dark:border-gray-700">
        <PieChart className="text-gray-300 dark:text-gray-600 mb-2" size={32} />
        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">No expenses yet</span>
     </div>
  );

  return (
    <div className="relative w-52 h-52 mx-auto my-6 group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full relative z-10 drop-shadow-xl">
        {data.map((slice, i) => {
          const startPercent = cumulativePercent;
          const slicePercent = slice.value / total;
          cumulativePercent += slicePercent;
          const endPercent = cumulativePercent;

          // Handle single slice case (100%) specially to avoid rendering artifacts
          if (slicePercent === 1) {
            return (
              <circle key={i} cx="0" cy="0" r="1" fill={slice.color} />
            );
          }

          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(endPercent);

          const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');

          return (
            <path
              key={i}
              d={pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="0.05"
              className="dark:stroke-slate-900 transition-all duration-300 hover:scale-105 hover:opacity-90 origin-center cursor-pointer"
            >
              <title>{slice.label}: {Math.round(slicePercent * 100)}%</title>
            </path>
          );
        })}
        {/* Inner circle for donut chart effect */}
        <circle cx="0" cy="0" r="0.65" fill="currentColor" className="text-white dark:text-slate-900 shadow-inner" />
      </svg>
      {/* Center Text */}
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total</span>
          <span className="text-xl font-black text-gray-800 dark:text-white">₹{total.toLocaleString()}</span>
       </div>
    </div>
  );
};

// Formula Reveal Component
const FormulaReveal = ({ formulas }: { formulas: { title: string, exp: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 transition-colors uppercase tracking-wider mb-2"
      >
        <BookOpen size={14} />
        {isOpen ? 'Hide Formulas' : 'Show Formulas'}
      </button>
      
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-800/50 text-sm">
           {formulas.map((f, i) => (
             <div key={i} className="mb-1 last:mb-0">
               <span className="font-bold text-gray-700 dark:text-gray-300">{f.title}: </span>
               <span className="font-mono text-gray-600 dark:text-gray-400">{f.exp}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// History Entry Component with Copy and Timestamp
const HistoryEntry = ({ item }: { item: HistoryItem }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${item.expression} = ${item.result}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-white/50 dark:border-white/5 hover:scale-[1.02] transition-transform shadow-sm group relative">
      <div className="flex justify-between items-start">
        <div className="flex flex-col flex-1 min-w-0 pr-2">
           <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider opacity-70">{item.tool}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                 • {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
           </div>
           <div className="text-sm text-gray-800 dark:text-gray-200 mb-1 break-all font-medium">{item.expression}</div>
           <div className={`text-lg font-bold ${gradientText} truncate`}>{item.result}</div>
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
          title="Copy result"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};

// --- Calculator Components ---

// 1. Standard Calculator
const StandardCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handlePress = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === '=') {
      try {
        const safeEquation = equation.replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + safeEquation)(); 
        const resultStr = String(result);
        
        if (equation && equation !== resultStr) {
          onCalculate('Standard', equation, resultStr);
        }

        setDisplay(resultStr);
        setEquation(resultStr);
      } catch (e) {
        setDisplay('Error');
      }
    } else if (['+', '-', '×', '÷', '%'].includes(val)) {
      setEquation(equation + (val === '×' ? '*' : val === '÷' ? '/' : val));
      setDisplay(val);
    } else {
      if (display === '0' || ['+', '-', '×', '÷', '%'].includes(display)) {
        setDisplay(val);
      } else {
        setDisplay(display + val);
      }
      setEquation(equation + val);
    }
  };

  const buttons = [
    'C', '%', '÷', '×',
    '7', '8', '9', '-',
    '4', '5', '6', '+',
    '1', '2', '3', '=',
    '0', '.',
  ];

  return (
    <div className={`flex flex-col h-full max-w-sm mx-auto ${glassCardClass} overflow-hidden`}>
      <div className="p-8 text-right h-40 flex flex-col justify-end">
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-2 h-6 font-medium">{equation}</div>
        <div className="text-5xl text-gray-800 dark:text-white font-bold tracking-tight truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-3 p-4 bg-white/30 dark:bg-black/30 backdrop-blur-md flex-1 rounded-t-3xl border-t border-white/20">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handlePress(btn)}
            className={`
              ${glassButtonClass}
              text-xl flex items-center justify-center
              ${btn === '=' ? 'bg-blue-500 text-white col-span-1 row-span-2 h-full shadow-blue-500/30 dark:shadow-blue-900/50' : ''}
              ${btn === 'C' ? 'text-red-500 bg-red-100/50 dark:bg-red-900/20 dark:text-red-400' : ''}
              ${['÷', '×', '-', '+'].includes(btn) ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : 'bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-white'}
              ${btn === '0' ? 'col-span-2' : ''}
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

// 2. AI Math Helper
const AIMathHelper: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  const [image, setImage] = useState<{ data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced cycle loading messages with more engaging text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
        const messages = [
          "Consulting the AI oracle...", 
          "Crunching complex numbers...", 
          "Analyzing patterns...", 
          "Formulating a brilliant answer...", 
          "Double-checking calculations...", 
          "Almost there..."
        ];
        let i = 0;
        setLoadingMessage(messages[0]);
        interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingMessage(messages[i]);
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            setImage({
                mimeType: matches[1],
                data: matches[2]
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setQuery('');
    setResponse('');
    setImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSolve = async () => {
    if (!query.trim() && !image) return;
    setLoading(true);
    setResponse('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let model = 'gemini-3-pro-preview'; // Default to pro for math
      let contents: any;

      if (image) {
        model = 'gemini-3-pro-preview';
        contents = {
            parts: [
                {
                    inlineData: {
                        mimeType: image.mimeType,
                        data: image.data
                    }
                },
                {
                    text: query ? `Analyze this image and solve the math problem. ${query}. Handle units (like kg, m, s) correctly if visible. IMPORTANT: Do NOT use currency symbols like $ or ₹. Do NOT use LaTeX formatting like $$ or $. Just use plain text and numbers.` : "Analyze this image and solve the math problem shown step-by-step. IMPORTANT: Do NOT use currency symbols like $ or ₹ in the final numeric answer or intermediate steps. Do NOT use LaTeX formatting like $$ or $. Use plain text and numbers."
                }
            ]
        };
      } else {
        model = 'gemini-3-pro-preview';
        contents = `You are a friendly and smart AI math assistant. Solve this math problem or answer this question concisely: "${query}". 
        IMPORTANT RULES:
        1. Handle measurement units (e.g., 5kg, 10m/s) intelligently and provide results with appropriate units.
        2. Do NOT use any currency symbols (like $, ₹, €) in your answer. Use general accounting numbers.
        3. Do NOT use LaTeX formatting (no $$ or $ delimiters). Use plain text for math formulas.`;
      }

      const result = await ai.models.generateContent({
        model: model,
        contents: contents
      });

      let text = result.text;
      
      if (text) {
        // Post-process to aggressively remove LaTeX delimiters and solitary dollar signs if the model ignores instructions
        text = text.replace(/\$\$/g, '').replace(/\\\[/g, '').replace(/\\\]/g, ''); 
        
        setResponse(text);
        onCalculate('AI Math', query || (image ? 'Image Analysis' : 'Question'), 'Solved');
      } else {
        setResponse("Sorry, I couldn't generate a solution.");
      }
    } catch (error) {
      console.error(error);
      setResponse("Connection error. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 ${glassCardClass} h-full flex flex-col`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl"><Sparkles className="text-purple-600 dark:text-purple-400" /></div>
        AI Math Helper
      </h3>
      
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={image ? "Add specific instructions about the image..." : "Type a problem (e.g., '5kg + 200g in g', 'sqrt(144)')..."}
            className={`${glassInputClass} h-32 resize-none pr-4`}
          />
          {image && (
             <div className="absolute bottom-3 right-3 z-10">
                <div className="relative group">
                    <img src={`data:${image.mimeType};base64,${image.data}`} alt="Preview" className="w-12 h-12 object-cover rounded-lg border-2 border-purple-500 shadow-md" />
                    <button 
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform"
                    >
                        <X size={12} />
                    </button>
                </div>
             </div>
          )}
        </div>

        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden" 
                accept="image/*"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl font-bold transition-all shadow-lg border border-white/20 flex items-center justify-center bg-white/60 dark:bg-white/5 text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 ${image ? 'ring-2 ring-purple-500' : ''}`}
                title="Upload Image"
            >
                <ImageIcon size={20} className={image ? "text-purple-600 dark:text-purple-400" : ""} />
            </button>
            
            <button
                onClick={handleClear}
                disabled={!query && !image && !response}
                className={`p-4 rounded-2xl font-bold transition-all shadow-lg border border-white/20 flex items-center justify-center bg-white/60 dark:bg-white/5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Clear Conversation"
            >
                <Trash2 size={20} />
            </button>

            <button
              onClick={handleSolve}
              disabled={loading || (!query && !image)}
              className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xl ${loading || (!query && !image) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02]'}`}
            >
              {loading ? (
                  <div className="flex items-center gap-3">
                      <div className="relative w-6 h-6">
                         <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                         <Sparkles size={24} className="relative z-10 animate-spin" />
                      </div>
                      <span className="animate-pulse text-sm font-medium">{loadingMessage}</span>
                  </div>
              ) : <> <Sparkles size={20} /> {image ? 'Analyze & Solve' : 'Solve Magic'} </>}
            </button>
        </div>

        {response && (
          <div className="flex-1 overflow-y-auto bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl p-5 mt-2 shadow-inner animate-fade-in-up">
            <div className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{response}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Percentage Calculator
const PercentageCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [mode, setMode] = useState<'findValue' | 'findPercent'>('findValue'); 
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);
    if (isNaN(v1) || isNaN(v2)) return;

    let res = 0;
    let exp = '';
    if (mode === 'findValue') {
      res = (v1 / 100) * v2;
      exp = `${v1}% of ${v2}`;
    } else {
      res = (v1 / v2) * 100;
      exp = `${v1} is what % of ${v2}`;
    }
    setResult(res);
    onCalculate('Percentage', exp, mode === 'findValue' ? res.toFixed(2) : res.toFixed(2) + '%');
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl"><Percent className="text-cyan-600 dark:text-cyan-400" /></div>
        Percentage
      </h3>
      <FormulaReveal formulas={[
        { title: 'Value %', exp: '(Percent / 100) × Total' },
        { title: 'Find %', exp: '(Part / Total) × 100' }
      ]} />
      
      <SubMenu 
        options={[
          {id: 'findValue', label: '% Value', activeColor: 'text-cyan-600 dark:text-cyan-300'},
          {id: 'findPercent', label: 'Find %', activeColor: 'text-cyan-600 dark:text-cyan-300'}
        ]}
        active={mode}
        onChange={setMode}
      />

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-xl text-gray-600 dark:text-gray-300 font-medium flex-wrap">
          {mode === 'findValue' ? <span>What is</span> : null}
          <input type="number" placeholder="0" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-24 p-2 text-center bg-transparent border-b-2 border-cyan-500 outline-none font-bold text-gray-900 dark:text-white" />
          {mode === 'findValue' ? <span>% of</span> : <span>is what % of</span>}
        </div>
        <div className="flex items-center gap-3 text-xl text-gray-600 dark:text-gray-300 font-medium">
           <input type="number" placeholder="0" value={val2} onChange={(e) => setVal2(e.target.value)} className="w-full p-4 bg-white/50 dark:bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-cyan-400 dark:text-white" />
        </div>
        <button onClick={handleCalculate} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-2xl mt-4 font-bold shadow-lg hover:shadow-cyan-500/40 transition-all">
          Calculate
        </button>
        {result !== null && (
          <div className="mt-6 p-6 bg-cyan-50/50 dark:bg-cyan-900/20 rounded-2xl text-center border border-cyan-100 dark:border-cyan-800">
            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest">Result</p>
            <p className="text-4xl font-black text-cyan-800 dark:text-cyan-100 mt-2">
              {mode === 'findValue' ? result.toFixed(2) : (result.toFixed(2) + '%')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. EMI Calculator
const EMICalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(12);
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const r = rate / 12 / 100;
    const calcEmi = amount * r * (Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1));
    const emiVal = isNaN(calcEmi) ? 0 : calcEmi;
    setResult(emiVal);
    onCalculate('EMI Loan', `₹${amount} @ ${rate}% for ${tenure}m`, `₹${emiVal.toFixed(2)}`);
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl"><CreditCard className="text-blue-600 dark:text-blue-400" /></div>
        EMI Calculator
      </h3>
      <FormulaReveal formulas={[
        { title: 'EMI', exp: 'P × R × (1+R)^N / ((1+R)^N - 1)' },
        { title: 'Note', exp: 'R = Rate/12/100, N = Months' }
      ]} />
      <div className="space-y-4">
        <div><label className="text-xs font-bold text-gray-500 ml-2">LOAN AMOUNT</label><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={glassInputClass} /></div>
        <div><label className="text-xs font-bold text-gray-500 ml-2">INTEREST RATE (%)</label><input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className={glassInputClass} /></div>
        <div><label className="text-xs font-bold text-gray-500 ml-2">TENURE (MONTHS)</label><input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className={glassInputClass} /></div>
        
        <button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-blue-600/40 transition-all mt-2">Calculate EMI</button>

        {result !== null && (
          <div className="mt-6 p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl text-center border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">Monthly EMI</p>
            <p className="text-4xl font-black text-blue-800 dark:text-blue-100 mt-2">₹ {result.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Discount Calculator
const DiscountCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [final, setFinal] = useState<DiscountResult | null>(null);

  const calculate = () => {
    const p = Number(price);
    const d = Number(discount);
    if (!p || !d) return;
    const savedAmount = (p * d) / 100;
    const finalPrice = p - savedAmount;
    setFinal({ saved: savedAmount, price: finalPrice });
    onCalculate('Discount', `${d}% off on ₹${p}`, `₹${finalPrice.toFixed(2)}`);
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl"><Percent className="text-green-600 dark:text-green-400" /></div>
        Discount
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-bold text-gray-500 ml-2">PRICE</label><input type="number" className={glassInputClass} onChange={(e) => setPrice(e.target.value)} /></div>
          <div><label className="text-xs font-bold text-gray-500 ml-2">DISCOUNT %</label><input type="number" className={glassInputClass} onChange={(e) => setDiscount(e.target.value)} /></div>
        </div>
        <button onClick={calculate} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-green-600/40 transition-all">Calculate</button>
        {final && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-red-50/80 dark:bg-red-900/30 p-4 rounded-2xl text-center border border-red-100 dark:border-red-800/50">
              <p className="text-xs text-red-600 dark:text-red-400 font-bold">SAVED</p>
              <p className="text-xl font-bold text-red-800 dark:text-red-200">₹{final.saved.toFixed(2)}</p>
            </div>
            <div className="bg-green-50/80 dark:bg-green-900/30 p-4 rounded-2xl text-center border border-green-100 dark:border-green-800/50">
              <p className="text-xs text-green-600 dark:text-green-400 font-bold">PAY</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">₹{final.price.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 6. Currency Converter (Updated with Live API)
const CurrencyConverter: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [result, setResult] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState(false);

  // Fallback rates if API fails
  const fallbackRates: Record<string, number> = {
    USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, JPY: 150.2, AUD: 1.52, CAD: 1.35, CHF: 0.91, CNY: 7.23, SGD: 1.35, NZD: 1.63
  };
  
  // Supported currencies list (extended for the API)
  const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "NZD", "AED", "ZAR", "BRL"];

  const fetchRates = async () => {
    setLoading(true);
    setError(false);
    try {
        // Using open exchange rate API (free, no key required for basic base USD)
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        setRates(data.rates);
        const date = new Date(data.time_last_updated * 1000);
        setLastUpdated(date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    } catch (err) {
        console.error("Currency fetch error:", err);
        setError(true);
        setRates(fallbackRates);
        setLastUpdated('Offline (Using Fallback Rates)');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleConvert = () => {
    if (!rates) return;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    const res = ((amount / fromRate) * toRate).toFixed(2);
    setResult(res);
    onCalculate('Currency', `${amount} ${from} to ${to}`, `${res} ${to}`);
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl"><DollarSign className="text-amber-600 dark:text-amber-400" /></div>
            Currency
        </h3>
        <button 
            onClick={fetchRates} 
            className={`p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-gray-500 hover:text-amber-600 transition-all ${loading ? 'animate-spin' : ''}`}
            title="Refresh Rates"
        >
            <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-white/5 p-2 rounded-lg w-fit mx-auto">
         {error ? <WifiOff size={12} className="text-red-500" /> : <Globe size={12} className="text-green-500" />}
         <span>{error ? 'Offline Mode' : 'Live Rates'}</span>
         {lastUpdated && <span className="opacity-50 border-l border-gray-300 dark:border-gray-600 pl-2 ml-1">{lastUpdated}</span>}
      </div>

      <div className="space-y-4">
        <div className="relative">
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={`${glassInputClass} text-2xl font-bold`} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Amount</span>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
             <select value={from} onChange={(e) => setFrom(e.target.value)} className={`${glassInputClass} appearance-none font-bold`}>
                 {currencies.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">FROM</span>
          </div>
          <ArrowRight className="text-gray-400" />
          <div className="flex-1 relative">
             <select value={to} onChange={(e) => setTo(e.target.value)} className={`${glassInputClass} appearance-none font-bold`}>
                 {currencies.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">TO</span>
          </div>
        </div>

        <button 
            onClick={handleConvert} 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-amber-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {loading ? 'Fetching Rates...' : 'Convert Now'}
        </button>

        {result && (
          <div className="bg-amber-50/50 dark:bg-amber-900/20 p-6 rounded-2xl text-center mt-4 border border-amber-100 dark:border-amber-800/50 animate-fade-in-up">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest mb-1">Converted Amount</p>
            <p className="text-4xl font-black text-amber-800 dark:text-amber-100">{result} <span className="text-lg font-normal opacity-70">{to}</span></p>
            <p className="text-[10px] text-gray-400 mt-2">1 {from} = {(rates && rates[from] && rates[to]) ? (rates[to]/rates[from]).toFixed(4) : '-'} {to}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. Unit Converter
const UnitConverter: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [val, setVal] = useState(0);
  const [type, setType] = useState('Length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [result, setResult] = useState<number | null>(null);

  const unitTypes: Record<string, Record<string, number>> = {
    Length: { m: 1, km: 1000, cm: 0.01, ft: 0.3048, inch: 0.0254 },
    Weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 },
  };

  const handleConvert = () => {
    let res = 0;
    if (type === 'Temperature') {
      if (fromUnit === 'C' && toUnit === 'F') res = (val * 9/5) + 32;
      else if (fromUnit === 'F' && toUnit === 'C') res = (val - 32) * 5/9;
      else res = val;
    } else {
      if (!unitTypes[type][fromUnit] || !unitTypes[type][toUnit]) return;
      const inBase = val * unitTypes[type][fromUnit];
      res = inBase / unitTypes[type][toUnit];
    }
    setResult(res);
    onCalculate('Unit Convert', `${val} ${fromUnit} to ${toUnit}`, `${res.toFixed(4)}`);
  };

  const setPreset = (t: string, f: string, to: string) => {
      setType(t);
      setFromUnit(f);
      setToUnit(to);
      setVal(0);
      setResult(null);
  }

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-xl"><Ruler className="text-pink-600 dark:text-pink-400" /></div>
        Unit Converter
      </h3>
      
      <SubMenu 
        options={['Length', 'Weight', 'Temperature'].map(t => ({id: t, label: t, activeColor: 'text-pink-600 dark:text-pink-300'}))}
        active={type}
        onChange={(id) => { setType(id); setVal(0); setResult(null); }}
      />

      <div className="grid grid-cols-2 gap-4">
        <input type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} className={glassInputClass} />
        <select className={glassInputClass} onChange={(e) => setFromUnit(e.target.value)} value={fromUnit}>
           {type === 'Temperature' ? <><option value="C">Celsius</option><option value="F">Fahrenheit</option></> : Object.keys(unitTypes[type]).map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <div className="col-span-2 flex justify-center"><ArrowRight className="text-gray-400 rotate-90" /></div>
        <div className={`col-span-1 flex items-center justify-center font-bold text-xl text-gray-800 dark:text-white bg-white/30 dark:bg-black/30 rounded-2xl border border-white/20`}>{result !== null ? result.toFixed(4) : '-'}</div>
        <select className={glassInputClass} onChange={(e) => setToUnit(e.target.value)} value={toUnit}>
           {type === 'Temperature' ? <><option value="F">Fahrenheit</option><option value="C">Celsius</option></> : Object.keys(unitTypes[type]).map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      
      {/* Presets */}
      <div className="grid grid-cols-3 gap-2 mt-4">
          <button onClick={() => setPreset('Length', 'm', 'ft')} className="px-2 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400 transition-colors">m → ft</button>
          <button onClick={() => setPreset('Weight', 'kg', 'lb')} className="px-2 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400 transition-colors">kg → lb</button>
          <button onClick={() => setPreset('Temperature', 'C', 'F')} className="px-2 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400 transition-colors">°C → °F</button>
      </div>

      <button onClick={handleConvert} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl mt-4 font-bold shadow-lg">Convert</button>
    </div>
  );
};

// 8. Interest Calculator
const InterestCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [p, setP] = useState(10000);
  const [r, setR] = useState(5);
  const [t, setT] = useState(1);
  const [type, setType] = useState('Simple');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    let res = 0;
    if (type === 'Simple') res = (p * r * t) / 100;
    else res = p * (Math.pow((1 + r / 100), t)) - p;
    setResult(res);
    onCalculate('Interest', `${type} Interest on ₹${p}`, `₹${res.toFixed(2)}`);
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl"><TrendingUp className="text-teal-600 dark:text-teal-400" /></div>
        Interest
      </h3>
      <FormulaReveal formulas={[
        { title: 'Simple', exp: '(P × R × T) / 100' },
        { title: 'Compound', exp: 'P × (1 + R/100)^T - P' }
      ]} />
      
      <SubMenu 
        options={[
          {id: 'Simple', label: 'Simple Interest', activeColor: 'text-teal-600 dark:text-teal-300'},
          {id: 'Compound', label: 'Compound Interest', activeColor: 'text-teal-600 dark:text-teal-300'}
        ]}
        active={type}
        onChange={setType}
      />

      <div className="space-y-4">
        <div><label className="text-xs font-bold text-gray-500 ml-2">PRINCIPAL</label><input type="number" value={p} onChange={(e) => setP(Number(e.target.value))} className={glassInputClass} /></div>
        <div><label className="text-xs font-bold text-gray-500 ml-2">RATE (%)</label><input type="number" value={r} onChange={(e) => setR(Number(e.target.value))} className={glassInputClass} /></div>
        <div><label className="text-xs font-bold text-gray-500 ml-2">TIME (YEARS)</label><input type="number" value={t} onChange={(e) => setT(Number(e.target.value))} className={glassInputClass} /></div>
        <button onClick={handleCalculate} className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg mt-2">Calculate</button>
      </div>
      {result !== null && (
        <div className="mt-6 p-6 bg-teal-50/50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-teal-700 dark:text-teal-400 font-medium text-sm">Interest</span>
            <span className="text-xl font-bold text-teal-900 dark:text-teal-100">₹ {result.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-teal-200 dark:border-teal-700 pt-2 mt-2">
            <span className="text-teal-700 dark:text-teal-400 font-medium text-sm">Total</span>
            <span className="text-xl font-bold text-teal-900 dark:text-teal-100">₹ {(p + result).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 9. Investment Calculator (New)
const InvestmentCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip');
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(1000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(5);
  const [result, setResult] = useState<{total: number, invested: number} | null>(null);

  const calculate = () => {
     // Monthly rate
     const r = rate / 100 / 12; // monthly rate
     const annualR = rate / 100; // annual rate for lumpsum simple calc check
     const n = years * 12;

     let fvInitial = 0;
     let fvSeries = 0;
     let investedVal = 0;

     if (mode === 'sip') {
        // Initial investment compound
        fvInitial = initial * Math.pow(1 + r, n);
        // SIP compound
        fvSeries = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        investedVal = initial + (monthly * n);
     } else {
        // Lumpsum (Compound Interest)
        // A = P(1 + r/n)^(nt) where n=1 for annual compounding usually in these simple calculators, 
        // BUT standard mutual fund calculators often use annual compounding for lumpsum.
        // Let's use simple annual compounding for Lumpsum: A = P(1 + R)^T
        fvInitial = initial * Math.pow(1 + annualR, years);
        fvSeries = 0;
        investedVal = initial;
     }

     const totalVal = fvInitial + fvSeries;
     setResult({ total: totalVal, invested: investedVal });
     onCalculate('Investment', `${mode === 'sip' ? 'SIP' : 'Lumpsum'} ${years}y @ ${rate}%`, `₹${totalVal.toFixed(0)}`);
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl"><Coins className="text-emerald-600 dark:text-emerald-400" /></div>
        Investment
      </h3>
      <FormulaReveal formulas={[
        { title: 'SIP', exp: 'Initial + Monthly Annuity' },
        { title: 'Lumpsum', exp: 'P × (1 + R)^N' }
      ]} />
      
      <SubMenu 
        options={[
          {id: 'sip', label: 'SIP', activeColor: 'text-emerald-600 dark:text-emerald-300'},
          {id: 'lumpsum', label: 'Lumpsum', activeColor: 'text-emerald-600 dark:text-emerald-300'}
        ]}
        active={mode}
        onChange={setMode}
      />

      <div className="space-y-4">
         <div><label className="text-xs font-bold text-gray-500 ml-2">INITIAL AMOUNT</label><input type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} className={glassInputClass} /></div>
         
         {mode === 'sip' && (
            <div className="animate-fade-in-up">
              <label className="text-xs font-bold text-gray-500 ml-2">MONTHLY SIP</label>
              <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className={glassInputClass} />
            </div>
         )}
         
         <div><label className="text-xs font-bold text-gray-500 ml-2">EXP. RETURN (% YR)</label><input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className={glassInputClass} /></div>
         <div><label className="text-xs font-bold text-gray-500 ml-2">PERIOD (YEARS)</label><input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className={glassInputClass} /></div>
         
         <button onClick={calculate} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg mt-2">Calculate Returns</button>
      </div>

      {result && (
         <div className="mt-6 p-6 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 animate-fade-in-up">
            <div className="flex justify-between items-center mb-2">
               <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">Invested</span>
               <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">₹ {result.invested.toLocaleString()}</span>
            </div>
             <div className="flex justify-between items-center mb-2">
               <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">Wealth Gain</span>
               <span className="text-lg font-bold text-emerald-600 dark:text-emerald-300">+₹ {(result.total - result.invested).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-200 dark:border-emerald-700 pt-3 mt-2">
               <span className="text-emerald-800 dark:text-emerald-200 font-bold text-base">Total Value</span>
               <span className="text-2xl font-black text-emerald-900 dark:text-white">₹ {Math.round(result.total).toLocaleString()}</span>
            </div>
         </div>
      )}
    </div>
  );
};

// 10. BMI Calculator
const BMICalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<string | null>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w && h) {
      const hInMeters = h / 100;
      const bmiVal = (w / (hInMeters * hInMeters)).toFixed(1);
      setBmi(bmiVal);
      onCalculate('BMI', `${w}kg, ${h}cm`, `BMI: ${bmiVal}`);
    }
  };

  const getStatus = (bVal: string) => {
    const b = parseFloat(bVal);
    if (b < 18.5) return { text: 'Underweight', color: 'text-yellow-600 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/40' };
    if (b < 24.9) return { text: 'Normal', color: 'text-green-600 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/40' };
    if (b < 29.9) return { text: 'Overweight', color: 'text-orange-600 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/40' };
    return { text: 'Obese', color: 'text-red-600 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40' };
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl"><Activity className="text-orange-600 dark:text-orange-400" /></div>
        BMI
      </h3>
      <FormulaReveal formulas={[{ title: 'BMI', exp: 'Weight(kg) / Height(m)²' }]} />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className={glassInputClass} />
        <input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} className={glassInputClass} />
      </div>
      <button onClick={calculateBMI} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl transition font-bold shadow-lg">Check BMI</button>
      {bmi && (
        <div className={`mt-6 p-8 rounded-2xl text-center ${getStatus(bmi).bg}`}>
          <p className="text-sm font-bold opacity-70 mb-2">YOUR SCORE</p>
          <p className="text-5xl font-black mb-4">{bmi}</p>
          <span className={`px-6 py-2 rounded-full text-sm font-bold bg-white/60 dark:bg-black/30 backdrop-blur-sm ${getStatus(bmi).color}`}>{getStatus(bmi).text}</span>
        </div>
      )}
    </div>
  );
};

// 11. Age Calculator
const AgeCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<AgeResult | null>(null);

  const calculateAge = () => {
    if(!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    
    setAge({ years, months, days });
    onCalculate('Age Calc', `Born: ${dob}`, `${years}y ${months}m ${days}d`);
  };

  return (
    <div className={`max-w-md mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl"><Calendar className="text-indigo-600 dark:text-indigo-400" /></div>
        Age
      </h3>
      <input type="date" onChange={(e) => setDob(e.target.value)} className={`${glassInputClass} mb-6 cursor-pointer`} />
      <button onClick={calculateAge} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl transition font-bold shadow-lg">Calculate</button>
      {age && (
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800"><p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{age.years}</p><p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">YEARS</p></div>
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800"><p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{age.months}</p><p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">MONTHS</p></div>
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800"><p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{age.days}</p><p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">DAYS</p></div>
        </div>
      )}
    </div>
  );
};

// 12. Budget Tracker Component
const BudgetTracker: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');

  const categories = {
      income: ['Salary', 'Freelance', 'Investment', 'Other'],
      expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other']
  };

  const handleAdd = () => {
      if(!amount || !desc) return;
      const val = parseFloat(amount);
      if(isNaN(val) || val <= 0) return;

      const newTx: Transaction = {
          id: Date.now(),
          desc,
          amount: val,
          type,
          category,
          date: new Date()
      };

      const newTransactions = [newTx, ...transactions];
      setTransactions(newTransactions);
      setAmount('');
      setDesc('');
      
      // Calculate totals for history
      const income = newTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = newTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const balance = income - expense;
      
      onCalculate('Budget', `${type === 'income' ? '+' : '-'} ${val} (${category})`, `Bal: ${balance.toFixed(2)}`);
  };

  const deleteTx = (id: number) => {
      setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Group expenses by category for visualization
  const expenseBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

  const CHART_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'];

  // Prepare chart data
  const chartData = Object.entries(expenseBreakdown).map(([label, value], index) => ({
      label,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
  })).sort((a,b) => b.value - a.value);
    
  return (
    <div className={`max-w-2xl mx-auto p-8 ${glassCardClass}`}>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl"><Wallet className="text-emerald-600 dark:text-emerald-400" /></div>
        Budget Tracker
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
              <span className="text-xs font-bold text-blue-500 uppercase">Balance</span>
              <p className="text-xl font-black text-blue-700 dark:text-blue-300 truncate">₹{balance.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-center">
              <span className="text-xs font-bold text-green-500 uppercase">Income</span>
              <p className="text-xl font-black text-green-700 dark:text-green-300 truncate">+₹{totalIncome.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
              <span className="text-xs font-bold text-red-500 uppercase">Expense</span>
              <p className="text-xl font-black text-red-700 dark:text-red-300 truncate">-₹{totalExpense.toFixed(0)}</p>
          </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-8 bg-white/40 dark:bg-white/5 p-6 rounded-2xl border border-white/40 dark:border-white/10">
          
          <SubMenu 
             options={[
               {id: 'expense', label: 'Expense', icon: <TrendingDown size={16}/>, activeColor: 'text-red-600 dark:text-red-400'},
               {id: 'income', label: 'Income', icon: <TrendingUp size={16}/>, activeColor: 'text-green-600 dark:text-green-400'}
             ]}
             active={type}
             onChange={(id) => { setType(id); setCategory(categories[id as 'income' | 'expense'][0]); }}
             className="w-full"
          />

          <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className={glassInputClass} />
              <select value={category} onChange={e => setCategory(e.target.value)} className={glassInputClass}>
                  {categories[type].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
          <input type="text" placeholder="Description (e.g. Lunch)" value={desc} onChange={e => setDesc(e.target.value)} className={glassInputClass} />
          <button onClick={handleAdd} className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold shadow-lg hover:scale-[1.02] transition-transform">Add Transaction</button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
          {/* Spending Analysis */}
          <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><PieChart size={16}/> Spending Breakdown</h4>
              
              {/* Donut Chart Visualization */}
              <SimpleDonutChart data={chartData} />

              <div className="space-y-3 mt-4">
                  {Object.entries(expenseBreakdown).length === 0 ? null : 
                   Object.entries(expenseBreakdown).sort((a,b) => b[1] - a[1]).map(([cat, val], idx) => (
                      <div key={cat} className="bg-white/30 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                          <div className="flex-1">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                                  <span className="text-gray-900 dark:text-white">₹{val}</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{width: `${(val/totalExpense)*100}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Recent Transactions */}
          <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><ListFilter size={16}/> Recent</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                  {transactions.length === 0 ? <p className="text-sm text-gray-400 italic">No transactions added.</p> :
                   transactions.map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors group">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {t.type === 'income' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-gray-800 dark:text-white">{t.desc}</p>
                                  <p className="text-[10px] text-gray-500 uppercase">{t.category}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                  {t.type === 'income' ? '+' : '-'}₹{t.amount}
                              </span>
                              <button onClick={() => deleteTx(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-all"><Trash2 size={14}/></button>
                          </div>
                      </div>
                   ))}
              </div>
          </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [activeTool, setActiveTool] = useState('standard');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showHistory, setShowHistory] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addToHistory = (tool: string, expression: string, result: string) => {
    setHistory(prev => [{
      tool, expression, result, timestamp: new Date()
    }, ...prev]);
  };

  const tools = [
    { id: 'standard', icon: <Calculator size={20} />, label: 'Standard', component: <StandardCalculator onCalculate={addToHistory} /> },
    { id: 'ai-math', icon: <Sparkles size={20} />, label: 'AI Math', component: <AIMathHelper onCalculate={addToHistory} /> },
    { id: 'percentage', icon: <Percent size={20} />, label: 'Percentage', component: <PercentageCalculator onCalculate={addToHistory} /> },
    { id: 'currency', icon: <DollarSign size={20} />, label: 'Currency', component: <CurrencyConverter onCalculate={addToHistory} /> },
    { id: 'unit', icon: <Ruler size={20} />, label: 'Units', component: <UnitConverter onCalculate={addToHistory} /> },
    { id: 'emi', icon: <CreditCard size={20} />, label: 'EMI Loan', component: <EMICalculator onCalculate={addToHistory} /> },
    { id: 'discount', icon: <Percent size={20} />, label: 'Discount', component: <DiscountCalculator onCalculate={addToHistory} /> },
    { id: 'interest', icon: <TrendingUp size={20} />, label: 'Interest', component: <InterestCalculator onCalculate={addToHistory} /> },
    { id: 'investment', icon: <Coins size={20} />, label: 'Investment', component: <InvestmentCalculator onCalculate={addToHistory} /> },
    { id: 'budget', icon: <Wallet size={20} />, label: 'Budget', component: <BudgetTracker onCalculate={addToHistory} /> },
    { id: 'bmi', icon: <Activity size={20} />, label: 'BMI', component: <BMICalculator onCalculate={addToHistory} /> },
    { id: 'age', icon: <Calendar size={20} />, label: 'Age', component: <AgeCalculator onCalculate={addToHistory} /> },
  ];

  const ActiveComponent = tools.find(t => t.id === activeTool)?.component;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white' : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-900'}`}>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-white/20 dark:border-white/5 px-6 py-4 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-3">
             {/* Sidebar Toggle */}
            <button 
               onClick={() => setSidebarOpen(!isSidebarOpen)} 
               className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden lg:flex items-center justify-center text-gray-600 dark:text-gray-300"
               title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
               {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>

            <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
               <Calculator className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-600 dark:from-blue-400 dark:to-purple-400 hidden sm:block">
              SuperCalc
            </h1>
         </div>

         <div className="flex items-center gap-3">
             <button 
               onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
               className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
             >
               {theme === 'light' ? <Moon size={20} className="text-gray-600" /> : <Sun size={20} className="text-yellow-400" />}
             </button>
             <button 
               onClick={() => setShowHistory(true)} 
               className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
             >
               <History size={20} className="text-gray-600 dark:text-gray-300" />
               {history.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
         </div>
      </nav>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`
            hidden lg:flex flex-col 
            ${isSidebarOpen ? 'w-80' : 'w-24'} 
            transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            h-full 
            border-r border-white/40 dark:border-white/10 
            bg-white/60 dark:bg-slate-900/60
            backdrop-blur-2xl 
            shadow-[4px_0_24px_-2px_rgba(0,0,0,0.05)]
            p-4 z-20
            overflow-y-auto scrollbar-hide
        `}>
            <div className={`mb-6 px-2 flex items-center ${!isSidebarOpen && 'justify-center'}`}>
                <p className={`text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-opacity duration-300 ${!isSidebarOpen ? 'hidden' : 'opacity-100'}`}>
                    Tools
                </p>
                {!isSidebarOpen && <div className="h-1 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>}
            </div>

            <div className="space-y-3 flex flex-col items-center">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={`
                    flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative group
                    ${activeTool === t.id 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/20 dark:ring-blue-400/20' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10 hover:shadow-sm'}
                    ${isSidebarOpen ? 'w-full' : 'w-14 justify-center aspect-square px-0'}
                  `}
                >
                  <div className={`transition-transform duration-300 ${activeTool === t.id && !isSidebarOpen ? 'scale-110' : ''}`}>
                    {t.icon}
                  </div>
                  
                  {isSidebarOpen && (
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis animate-fade-in-up">
                          {t.label}
                      </span>
                  )}

                  {/* Floating Tooltip for Collapsed State */}
                  {!isSidebarOpen && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900/90 dark:bg-white/90 backdrop-blur text-white dark:text-gray-900 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                          {t.label}
                          {/* Triangle arrow */}
                          <div className="absolute top-1/2 right-full -mt-1 -mr-px border-4 border-transparent border-r-gray-900/90 dark:border-r-white/90"></div>
                      </div>
                  )}
                </button>
              ))}
            </div>
        </aside>

        {/* Mobile Nav */}
        <div className="lg:hidden overflow-x-auto whitespace-nowrap p-4 gap-2 flex bg-white/40 dark:bg-black/20 border-b border-white/20 dark:border-white/5 scrollbar-hide">
             {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTool === t.id ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900' : 'text-gray-600 dark:text-gray-400 bg-white/30 dark:bg-white/5 border border-transparent'}`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
        </div>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scrollbar-hide">
           <div className="max-w-4xl mx-auto">
              {ActiveComponent}
           </div>
        </main>
      
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] flex justify-end">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
           <div className="relative w-full max-w-sm h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl flex flex-col transition-transform">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><History /> History</h2>
                 <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                 {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                       <Clock size={48} className="mb-4 opacity-50" />
                       <p>No calculations yet</p>
                    </div>
                 ) : (
                    history.map((item, idx) => <HistoryEntry key={idx} item={item} />)
                 )}
              </div>

              {history.length > 0 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                   <button onClick={() => setHistory([])} className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                      <Trash2 size={18} /> Clear All
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};

export default App;