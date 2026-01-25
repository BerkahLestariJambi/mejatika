"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, Trash2, Download, Layout, BookOpen, ChevronRight } from 'lucide-react';

// Data Demo untuk setiap materi
const DEMO_SAMPLES = {
  tipe_data: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: "text_print",
          x: 40, y: 40,
          inputs: { TEXT: { block: { type: "text", fields: { TEXT: "Halo Mejatika! Ini Tipe Data String" } } } },
          next: {
            block: {
              type: "text_print",
              inputs: { TEXT: { block: { type: "math_number", fields: { NUM: 100 } } } }
            }
          }
        }
      ]
    }
  },
  variabel: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: "variables_set",
          x: 40, y: 40,
          fields: { VAR: { id: "v1" } },
          inputs: { VALUE: { block: { type: "math_number", fields: { NUM: 25 } } } },
          next: {
            block: {
              type: "text_print",
              inputs: { 
                TEXT: { 
                  block: { 
                    type: "math_arithmetic", 
                    fields: { OP: "ADD" },
                    inputs: {
                      A: { block: { type: "variables_get", fields: { VAR: { id: "v1" } } } },
                      B: { block: { type: "math_number", fields: { NUM: 5 } } }
                    }
                  } 
                } 
              }
            }
          }
        }
      ]
    },
    variables: [{ name: "angka_saya", id: "v1" }]
  },
  keputusan: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: "controls_if",
          x: 40, y: 40,
          extraState: { hasElse: true },
          inputs: {
            IF0: {
              block: {
                type: "logic_compare",
                fields: { OP: "GT" },
                inputs: {
                  A: { block: { type: "math_number", fields: { NUM: 90 } } },
                  B: { block: { type: "math_number", fields: { NUM: 75 } } }
                }
              }
            },
            DO0: { block: { type: "text_print", inputs: { TEXT: { block: { type: "text", fields: { TEXT: "Selamat, Kamu Lulus!" } } } } } },
            ELSE: { block: { type: "text_print", inputs: { TEXT: { block: { type: "text", fields: { TEXT: "Coba lagi ya!" } } } } } }
          }
        }
      ]
    }
  },
  perulangan: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: "controls_repeat_ext",
          x: 40, y: 40,
          inputs: {
            TIMES: { block: { type: "math_number", fields: { NUM: 3 } } },
            DO: {
              block: {
                type: "text_print",
                inputs: { TEXT: { block: { type: "text", fields: { TEXT: "Mejatika Pantang Menyerah!" } } } }
              }
            }
          }
        }
      ]
    }
  }
};

const BlocklyEditor = dynamic(() => import('../../components/BlocklyEditor'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 font-mono text-slate-400 animate-pulse">Memuat Lab Mejatika...</div>
});

export default function LabPage() {
  const [currentCode, setCurrentCode] = useState("");
  const [currentJson, setCurrentJson] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  // Fungsi memuat materi ke workspace
  const loadMateri = (key: keyof typeof DEMO_SAMPLES) => {
    setCurrentJson(JSON.stringify(DEMO_SAMPLES[key]));
    setLogs([`📚 Materi ${key.replace('_', ' ')} dimuat.`]);
  };

  const runCode = (code: string) => {
    setLogs(["🚀 Program dimulai..."]);
    try {
      const originalAlert = window.alert;
      const originalPrompt = window.prompt;

      window.alert = (msg) => setLogs(prev => [...prev, `[Output]: ${msg}`]);
      window.prompt = (msg) => {
        const res = originalPrompt(msg);
        setLogs(prev => [...prev, `[Input]: ${msg} -> ${res}`]);
        return res;
      };

      eval(code);

      window.alert = originalAlert;
      window.prompt = originalPrompt;
      setLogs(prev => [...prev, "✅ Selesai."]);
    } catch (err: any) {
      setLogs(prev => [...prev, `❌ Error: ${err.message}`]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-slate-900">
      {/* HEADER */}
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200"><Layout size={18}/></div>
          <span className="font-bold tracking-tight text-lg text-slate-800">Mejatika Lab</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => runCode(currentCode)} 
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Play size={16} fill="currentColor"/> Jalankan
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* SIDEBAR KURIKULUM */}
        <aside className="w-72 border-r bg-slate-50 flex flex-col shrink-0">
          <div className="p-5 border-b bg-white/50">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <BookOpen size={16}/>
              <span className="font-bold text-[10px] uppercase tracking-widest">Kurikulum Dasar</span>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Pilih Materi Demo:</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {[
              { id: 'tipe_data', title: '1. Tipe Data', desc: 'Mengenal String & Number' },
              { id: 'variabel', title: '2. Variabel', desc: 'Menyimpan nilai dalam wadah' },
              { id: 'keputusan', title: '3. Kontrol Keputusan', desc: 'Logika If-Else & Perbandingan' },
              { id: 'perulangan', title: '4. Perulangan (Loop)', desc: 'Mengulang kode otomatis' },
            ].map((materi) => (
              <button 
                key={materi.id}
                onClick={() => loadMateri(materi.id as keyof typeof DEMO_SAMPLES)}
                className="w-full text-left p-3 rounded-xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-xs text-slate-700 group-hover:text-blue-600">{materi.title}</h3>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400" />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{materi.desc}</p>
              </button>
            ))}
          </div>

          <div className="p-4 bg-blue-50 m-4 rounded-xl">
             <p className="text-[9px] text-blue-500 font-bold leading-tight">
               TIPS: Klik materi di atas untuk memunculkan contoh blok secara otomatis!
             </p>
          </div>
        </aside>

        {/* EDITOR WORKSPACE */}
        <div className="flex-1 relative min-w-0 bg-slate-100">
          <BlocklyEditor 
            onCodeChange={setCurrentCode} 
            onJsonChange={setCurrentJson} 
            initialData={currentJson}
          />
        </div>

        {/* TERMINAL OUTPUT */}
        <aside className="w-80 bg-slate-950 flex flex-col shrink-0 border-l border-slate-800">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center px-4 bg-slate-900/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Terminal Mejatika</span>
            <button onClick={() => setLogs([])} className="text-slate-500 hover:text-white transition-colors" title="Clear Console">
              <Trash2 size={14}/>
            </button>
          </div>
          <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-[10px] text-slate-400">
                 Menunggu perintah...
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`mb-1 break-words ${
                  log.includes('❌') ? 'text-red-400' : 
                  log.includes('🚀') ? 'text-blue-400' : 
                  log.includes('Output') ? 'text-white' : 'text-emerald-400'
                }`}>
                  {log}
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-slate-900 border-t border-slate-800">
             <div className="text-[9px] font-bold text-slate-600 uppercase mb-1">Generated Javascript:</div>
             <pre className="text-[10px] text-slate-500 truncate italic">
                {currentCode || "// Hubungkan beberapa blok..."}
             </pre>
          </div>
        </aside>
      </main>
    </div>
  );
}
