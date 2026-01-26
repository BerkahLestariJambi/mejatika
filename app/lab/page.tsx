"use client";
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Code, Plus, Trash2, Play, Smartphone, Tablet, Pointer, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

const BlocklyEditor = dynamic(() => import('../../components/BlocklyEditor'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-white italic text-slate-400">Menyiapkan Mejatika Engine...</div>
});

// DATA DEMO MATERI & PROYEK LENGKAP
const DEMO_SAMPLES: any = {
  kalkulator: {
    title: "Proyek: Kalkulator Pintar",
    desc: "Gabungkan input angka & logika aritmatika dinamis.",
    components: [
      { id: "label_1", type: "label", props: { text: "KALKULATOR MEJATIKA", color: "#4f46e5" } },
      { id: "input_1", type: "input", props: { placeholder: "Angka Pertama", text: "" } },
      { id: "input_2", type: "input", props: { placeholder: "Angka Kedua", text: "" } },
      { id: "btn_hitung1", type: "button", props: { text: "+", bgColor: "#4f46e5" } },
      { id: "btn_hitung2", type: "button", props: { text: -", bgColor: "#4f46e5" } },      
      { id: "btn_hitung3", type: "button", props: { text: "*", bgColor: "#4f46e5" } },      
      { id: "btn_hitung4", type: "button", props: { text: "=", bgColor: "#4f46e5" } },
      { id: "label_hasil", type: "label", props: { text: "Hasil akan muncul di sini", color: "#10b981" } }
    ],
    json: JSON.stringify({
      blocks: {
        languageVersion: 0,
        blocks: [{
          type: "event_button_click", x: 40, y: 40,
          fields: { ID: "btn_hitung" },
          statement: {
            name: "DO",
            block: {
              type: "set_ui_text",
              fields: { ID: "label_hasil" },
              inputs: {
                VALUE: {
                  block: {
                    type: "math_arithmetic", fields: { OP: "ADD" },
                    inputs: {
                      A: { block: { type: "get_ui_value", fields: { ID: "input_1" } } },
                      B: { block: { type: "get_ui_value", fields: { ID: "input_2" } } }
                    }
                  }
                }
              }
            }
          }
        }]
      }
    })
  },
  materi_if: {
    title: "Materi: Kontrol Logika",
    desc: "Belajar kondisi IF untuk mengubah warna tombol.",
    components: [
      { id: "btn_cek", type: "button", props: { text: "CEK KONDISI", bgColor: "#6366f1" } }
    ],
    json: JSON.stringify({
      blocks: {
        languageVersion: 0,
        blocks: [{
          type: "event_button_click", x: 40, y: 40,
          fields: { ID: "btn_cek" },
          statement: {
            name: "DO",
            block: {
              type: "controls_if",
              extraState: { hasElse: true },
              inputs: {
                IF0: { block: { type: "logic_boolean", fields: { BOOL: "TRUE" } } },
                DO0: { block: { type: "set_ui_color", fields: { ID: "btn_cek", COL: "#10b981" } } },
                ELSE: { block: { type: "set_ui_color", fields: { ID: "btn_cek", COL: "#ef4444" } } }
              }
            }
          }
        }]
      }
    })
  }
};

export default function LabPage() {
  const [tab, setTab] = useState<'designer' | 'blocks'>('designer');
  const [components, setComponents] = useState<any[]>([]); 
  const [currentCode, setCurrentCode] = useState("");
  const [currentJson, setCurrentJson] = useState("");
  const eventHandlers = useRef<any>({});

  const addComponent = (type: string) => {
    const id = `${type}_${components.length + 1}`;
    const newComp = { 
      id, 
      type, 
      props: { 
        text: type === 'button' ? 'Klik Saya' : (type === 'label' ? 'Teks Baru' : ''), 
        bgColor: '#4f46e5', 
        placeholder: 'Ketik sesuatu...',
        color: '#1e293b' 
      } 
    };
    setComponents([...components, newComp]);
  };

  const updateComponentText = (id: string, text: string) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, props: { ...c.props, text } } : c));
  };

  const loadDemo = (key: string) => {
    const demo = DEMO_SAMPLES[key];
    setComponents(demo.components);
    setCurrentJson(demo.json);
    setTab('blocks');
  };

  const compileAndRun = () => {
    eventHandlers.current = {};
    
    // API untuk diakses oleh Blockly Code
    const updateUI = (id: string, newProps: any) => {
      setComponents(prev => prev.map(c => c.id === id ? { ...c, props: { ...c.props, ...newProps } } : c));
    };

    const registerEvent = (id: string, fn: Function) => { 
      eventHandlers.current[id] = fn; 
    };

    const getUIValue = (id: string) => {
      const comp = components.find(c => c.id === id);
      return comp ? comp.props.text : "0";
    };

    try {
      // Injeksi API ke dalam script yang dihasilkan Blockly
      const script = `(function(updateUI, registerEvent, getUIValue){ 
        ${currentCode} 
      })(updateUI, registerEvent, getUIValue)`;
      eval(script);
      alert("🚀 Program Mejatika Berhasil Aktif!");
    } catch (err) { 
      alert("Ups! Cek kembali susunan blokmu."); 
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* HEADER */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <h1 className="font-black text-xl tracking-tighter text-indigo-600 italic">MEJATIKA<span className="text-slate-400 not-italic">LAB</span></h1>
          <nav className="flex bg-slate-100 p-1 rounded-xl border">
            <button onClick={() => setTab('designer')} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'designer' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>1. Designer</button>
            <button onClick={() => setTab('blocks')} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'blocks' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>2. Blocks</button>
          </nav>
        </div>
        <button onClick={compileAndRun} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100">
          <Play size={16} fill="currentColor"/> Aktifkan
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* SIDEBAR MATERI */}
        <aside className="w-64 flex flex-col shrink-0 gap-4">
          <div className="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-xl shadow-indigo-200">
            <div className="flex items-center gap-2 mb-2 opacity-80"><Sparkles size={16}/><span className="text-[10px] font-bold uppercase tracking-widest">Kurikulum</span></div>
            <h2 className="font-bold text-sm leading-tight">Materi Pemrograman Visual</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {Object.entries(DEMO_SAMPLES).map(([key, data]: any) => (
              <button key={key} onClick={() => loadDemo(key)} className="w-full text-left p-4 rounded-3xl bg-white border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm group">
                <h3 className="font-bold text-xs text-slate-700 group-hover:text-indigo-600 uppercase tracking-tight">{data.title}</h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{data.desc}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex relative">
          {tab === 'designer' ? (
            <div className="flex-1 flex">
              <div className="w-20 border-r flex flex-col items-center py-6 gap-6 bg-slate-50/50">
                <button title="Tambah Label" onClick={() => addComponent('label')} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 hover:scale-110 transition-all border"><Layout size={20}/></button>
                <button title="Tambah Tombol" onClick={() => addComponent('button')} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 hover:scale-110 transition-all border"><Pointer size={20}/></button>
                <button title="Tambah Input" onClick={() => addComponent('input')} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 hover:scale-110 transition-all border"><Code size={20}/></button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Layout size={18} className="text-indigo-500"/> Komponen Antarmuka</h2>
                {components.length === 0 && (
                  <div className="h-40 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 text-xs italic">
                    Belum ada komponen. Klik ikon di kiri untuk menambah.
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {components.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors group">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{c.type}</span>
                        <span className="text-sm font-bold text-slate-700">{c.id}</span>
                      </div>
                      <button onClick={() => setComponents(components.filter(x => x.id !== c.id))} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 h-full w-full overflow-hidden">
              <BlocklyEditor onCodeChange={setCurrentCode} onJsonChange={setCurrentJson} initialData={currentJson} />
            </div>
          )}
        </div>

        {/* SIMULATOR (PHONE VIEW) */}
        <aside className="w-[340px] shrink-0 flex items-center justify-center">
          <div className="bg-slate-900 w-full h-[640px] rounded-[3.5rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col p-2">
            {/* Notch Area */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-full z-20"></div>
            
            <div className="flex-1 bg-white rounded-[2.8rem] p-6 pt-10 space-y-5 overflow-y-auto scrollbar-hide">
              {components.map((c) => (
                <div key={c.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {c.type === 'label' && (
                    <p style={{color: c.props.color}} className="text-center text-sm font-bold py-2 leading-relaxed">
                      {c.props.text}
                    </p>
                  )}
                  {c.type === 'button' && (
                    <button 
                      onClick={() => eventHandlers.current[c.id]?.()} 
                      style={{backgroundColor: c.props.bgColor}} 
                      className="w-full py-4 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-100 active:scale-90 transition-all"
                    >
                      {c.props.text}
                    </button>
                  )}
                  {c.type === 'input' && (
                    <input 
                      onChange={(e) => updateComponentText(c.id, e.target.value)}
                      placeholder={c.props.placeholder} 
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 text-xs font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all" 
                    />
                  )}
                </div>
              ))}
              {components.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Smartphone size={48} className="mb-4 text-slate-400"/>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Simulator Kosong</p>
                </div>
              )}
            </div>
            
            {/* Home Indicator */}
            <div className="h-1 w-24 bg-slate-200 mx-auto my-3 rounded-full"></div>
          </div>
        </aside>
      </main>
    </div>
  );
}
