"use client";
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Code, Plus, Trash2, Play, Smartphone, Tablet, Pointer, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

const BlocklyEditor = dynamic(() => import('../../components/BlocklyEditor'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-white italic text-slate-400">Menyiapkan Mejatika Engine...</div>
});

// DATA DEMO MATERI & PROYEK
const DEMO_SAMPLES: any = {
  kalkulator: {
    title: "Proyek: Kalkulator Pintar",
    desc: "Gabungkan input angka & logika aritmatika.",
    components: [
      { id: "label_1", type: "label", props: { text: "KALKULATOR MEJATIKA", color: "#4f46e5" } },
      { id: "input_1", type: "input", props: { placeholder: "Angka Pertama" } },
      { id: "input_2", type: "input", props: { placeholder: "Angka Kedua" } },
      { id: "btn_hitung", type: "button", props: { text: "HITUNG SEKARANG", bgColor: "#4f46e5" } },
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
                      A: { block: { type: "math_number", fields: { NUM: 10 } } },
                      B: { block: { type: "math_number", fields: { NUM: 5 } } }
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
    const newComp = { id, type, props: { text: type === 'button' ? 'Tombol Baru' : 'Teks Baru', bgColor: '#2563eb', placeholder: 'Ketik...' } };
    setComponents([...components, newComp]);
  };

  const loadDemo = (key: string) => {
    const demo = DEMO_SAMPLES[key];
    setComponents(demo.components);
    setCurrentJson(demo.json);
    setTab('blocks');
  };

  const compileAndRun = () => {
    eventHandlers.current = {};
    const updateUI = (id: string, newProps: any) => {
      setComponents(prev => prev.map(c => c.id === id ? { ...c, props: { ...c.props, ...newProps } } : c));
    };
    const registerEvent = (id: string, fn: Function) => { eventHandlers.current[id] = fn; };

    try {
      const script = `(function(updateUI, registerEvent){ ${currentCode} })(updateUI, registerEvent)`;
      eval(script);
      alert("🚀 Program Mejatika Berhasil Aktif!");
    } catch (err) { alert("Cek kembali susunan blokmu!"); }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900">
      <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <h1 className="font-black text-xl tracking-tighter text-indigo-600">MEJATIKA</h1>
          <nav className="flex bg-slate-100 p-1 rounded-xl border">
            <button onClick={() => setTab('designer')} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'designer' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>1. Designer</button>
            <button onClick={() => setTab('blocks')} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'blocks' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>2. Blocks</button>
          </nav>
        </div>
        <button onClick={compileAndRun} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all">
          <Play size={16} fill="currentColor"/> Aktifkan
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* SIDEBAR MATERI */}
        <aside className="w-64 flex flex-col shrink-0 gap-4">
          <div className="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-2 mb-2 opacity-80"><Sparkles size={16}/><span className="text-[10px] font-bold uppercase tracking-widest">Kurikulum</span></div>
            <h2 className="font-bold text-sm leading-tight">Pilih Modul Belajar Kamu</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {Object.entries(DEMO_SAMPLES).map(([key, data]: any) => (
              <button key={key} onClick={() => loadDemo(key)} className="w-full text-left p-4 rounded-3xl bg-white border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm group">
                <h3 className="font-bold text-xs text-slate-700 group-hover:text-indigo-600">{data.title}</h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{data.desc}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* WORKSPACE */}
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden flex relative">
          {tab === 'designer' ? (
            <div className="flex-1 flex">
              <div className="w-20 border-r flex flex-col items-center py-6 gap-6 bg-slate-50/50">
                <button onClick={() => addComponent('label')} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 hover:scale-110 transition-all border"><Layout size={20}/></button>
                <button onClick={() => addComponent('button')} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 hover:scale-110 transition-all border"><Pointer size={20}/></button>
                <button onClick={() => addComponent('input')} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 hover:scale-110 transition-all border"><Code size={20}/></button>
              </div>
              <div className="flex-1 p-8">
                <h2 className="font-bold mb-4">Komponen Terpasang</h2>
                <div className="space-y-2">
                  {components.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <span className="text-xs font-mono font-bold text-indigo-600">{c.id}</span>
                      <button onClick={() => setComponents(components.filter(x => x.id !== c.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 h-full w-full overflow-hidden" style={{ touchAction: 'none' }}>
              <BlocklyEditor onCodeChange={setCurrentCode} onJsonChange={setCurrentJson} initialData={currentJson} />
            </div>
          )}
        </div>

        {/* SIMULATOR */}
        <aside className="w-[320px] shrink-0 flex items-center justify-center">
          <div className="bg-slate-900 w-full h-[600px] rounded-[3rem] border-[10px] border-slate-800 shadow-2xl relative flex flex-col">
            <div className="flex-1 bg-white m-2 rounded-[2.2rem] p-6 space-y-4 overflow-y-auto">
              {components.map((c) => (
                <div key={c.id}>
                  {c.type === 'label' && <p style={{color: c.props.color}} className="text-center text-sm font-bold">{c.props.text}</p>}
                  {c.type === 'button' && <button onClick={() => eventHandlers.current[c.id]?.()} style={{backgroundColor: c.props.bgColor}} className="w-full py-3 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all">{c.props.text}</button>}
                  {c.type === 'input' && <input placeholder={c.props.placeholder} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-xs outline-none focus:border-indigo-400 transition-all" />}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
