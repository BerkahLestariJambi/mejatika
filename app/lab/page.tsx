"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Play, Trash2, Layout, BookOpen, ChevronRight, 
  Smartphone, Tablet, Eye, Code, SmartphoneNfc 
} from 'lucide-react';

// Data Demo Materi & Desain GUI
const DEMO_SAMPLES = {
  desain_login: {
    blocks: {
      languageVersion: 0,
      blocks: [
        { type: "gui_image", x: 20, y: 20, fields: { URL: "https://cdn-icons-png.flaticon.com/512/295/295128.png" }, next: {
          block: { type: "gui_label", inputs: { TEXT: { block: { type: "text", fields: { TEXT: "Selamat Datang" } } } }, fields: { COLOR: "#1e293b" }, next: {
            block: { type: "gui_input", fields: { HINT: "Email atau Username" }, next: {
              block: { type: "gui_input", fields: { HINT: "Kata Sandi" }, next: {
                block: { type: "gui_button", inputs: { TEXT: { block: { type: "text", fields: { TEXT: "Masuk Sekarang" } } } }, fields: { BG_COLOR: "#2563eb" } }
              }}
            }}
          }}
        }}
      ]
    }
  },
  tipe_data: {
    blocks: {
      languageVersion: 0,
      blocks: [
        { type: "text_print", x: 20, y: 20, inputs: { TEXT: { block: { type: "text", fields: { TEXT: "Belajar Tipe Data" } } } } }
      ]
    }
  }
};

const BlocklyEditor = dynamic(() => import('../../components/BlocklyEditor'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 font-mono text-slate-400 animate-pulse">Menghubungkan ke Mejatika Engine...</div>
});

export default function LabPage() {
  const [currentCode, setCurrentCode] = useState("");
  const [currentJson, setCurrentJson] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet'>('mobile');
  const [guiElements, setGuiElements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'design' | 'logic'>('design');

  // Mesin Render GUI Mejatika
  const updateVisualPreview = () => {
    const elements: any[] = [];
    const renderElement = (type: string, props: any) => {
      elements.push({ type, props });
    };

    try {
      // Menjalankan kode yang dihasilkan oleh blok desain
      // Fungsi 'renderElement' disuntikkan ke dalam scope eval
      const script = `(function(renderElement){ ${currentCode} })(renderElement)`;
      eval(script);
      setGuiElements(elements);
      setLogs(prev => [...prev, "🎨 Preview Visual diperbarui."]);
    } catch (err: any) {
      setLogs(prev => [...prev, `❌ Render Error: ${err.message}`]);
    }
  };

  const loadMateri = (key: keyof typeof DEMO_SAMPLES) => {
    setCurrentJson(JSON.stringify(DEMO_SAMPLES[key]));
    setLogs([`📚 Materi ${key.replace('_', ' ')} dimuat.`]);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-slate-900">
      {/* HEADER NAV */}
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Layout size={20}/>
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg block leading-none">Mejatika Lab</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider text-xs">Visual App Designer</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border">
            <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Smartphone size={16}/></button>
            <button onClick={() => setViewMode('tablet')} className={`p-1.5 rounded-md transition-all ${viewMode === 'tablet' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Tablet size={16}/></button>
          </div>
          <button 
            onClick={updateVisualPreview} 
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Play size={16} fill="currentColor"/> Update Preview
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden bg-slate-50">
        {/* SIDEBAR MATERI */}
        <aside className="w-72 border-r bg-white flex flex-col shrink-0 overflow-y-auto">
          <div className="p-5">
            <div className="flex items-center gap-2 text-indigo-600 mb-4">
              <BookOpen size={16}/>
              <span className="font-bold text-[10px] uppercase tracking-widest">Kurikulum Desain</span>
            </div>
            <div className="space-y-2">
              <button onClick={() => loadMateri('desain_login')} className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                <h3 className="font-bold text-xs text-slate-700 group-hover:text-indigo-600">Demo Desain Login</h3>
                <p className="text-[10px] text-slate-400 mt-1">Belajar menyusun Logo, Input, dan Tombol.</p>
              </button>
              <button onClick={() => loadMateri('tipe_data')} className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                <h3 className="font-bold text-xs text-slate-700 group-hover:text-indigo-600">Demo Logic Dasar</h3>
                <p className="text-[10px] text-slate-400 mt-1">Mengenal tipe data teks dan angka.</p>
              </button>
            </div>
          </div>
          
          <div className="mt-auto p-5 border-t bg-slate-50/50">
             <div className="flex items-center gap-2 text-slate-500 mb-2">
               <Eye size={14}/>
               <span className="text-[10px] font-bold uppercase">Tips Desain</span>
             </div>
             <p className="text-[10px] text-slate-400 italic">Gunakan kategori 'Palet Desain' di editor untuk mulai membangun antarmuka HP Anda sendiri.</p>
          </div>
        </aside>

        {/* WORKSPACE EDITOR */}
        <div className="flex-1 relative min-w-0 border-r bg-white">
          <BlocklyEditor 
            onCodeChange={setCurrentCode} 
            onJsonChange={setCurrentJson} 
            initialData={currentJson}
          />
        </div>

        {/* SIMULATOR GUI */}
        <aside className="w-[450px] bg-slate-100 flex flex-col shrink-0 items-center justify-center p-6 relative">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">Mejatika Simulation Engine v1.0</span>
          </div>

          {/* DEVICE FRAME */}
          <div className={`bg-slate-900 rounded-[3.5rem] border-[10px] border-slate-800 shadow-2xl transition-all duration-500 relative flex flex-col overflow-hidden
            ${viewMode === 'mobile' ? 'w-[300px] h-[600px]' : 'w-[400px] h-[550px]'}`}>
            
            {/* SCREEN */}
            <div className="flex-1 bg-white m-2 rounded-[2.5rem] overflow-y-auto p-8 space-y-5 flex flex-col">
              {guiElements.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <SmartphoneNfc className="text-slate-200" size={32}/>
                  </div>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                    Workspace kosong.<br/>Tarik blok desain dan klik <span className="text-indigo-600 font-bold">Update Preview</span>
                  </p>
                </div>
              ) : (
                guiElements.map((el, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    {el.type === 'label' && (
                      <p style={{ color: el.props.color }} className="text-xl font-bold text-center tracking-tight leading-tight">
                        {el.props.text}
                      </p>
                    )}
                    {el.type === 'button' && (
                      <button style={{ backgroundColor: el.props.bgColor }} className="w-full text-white py-4 rounded-2xl shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm">
                        {el.props.text}
                      </button>
                    )}
                    {el.type === 'input' && (
                      <input type="text" placeholder={el.props.placeholder} className="w-full border-2 border-slate-100 bg-slate-50 px-5 py-4 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
                    )}
                    {el.type === 'image' && (
                      <img src={el.props.url} alt="UI" className="w-32 h-32 mx-auto object-contain mb-2 drop-shadow-xl" />
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* SPEAKER & CAMERA HOLE */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-slate-700 rounded-full mr-2"></div>
               <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>

          {/* TERMINAL MINI */}
          <div className="mt-8 w-full max-w-[300px] bg-slate-900 rounded-2xl p-4 font-mono text-[10px] shadow-xl border border-slate-700">
             <div className="flex justify-between mb-2 border-b border-slate-800 pb-2">
                <span className="text-slate-500 font-bold">LOGS</span>
                <button onClick={() => setLogs([])}><Trash2 size={12} className="text-slate-600 hover:text-red-400"/></button>
             </div>
             <div className="h-20 overflow-y-auto space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className={log.includes('❌') ? 'text-red-400' : 'text-indigo-400'}>{log}</div>
                ))}
             </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
