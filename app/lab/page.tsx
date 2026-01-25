"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, Trash2, Download, Layout, BookOpen } from 'lucide-react';

const BlocklyEditor = dynamic(() => import('../../components/BlocklyEditor'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50">Loading Lab...</div>
});

export default function LabPage() {
  const [currentCode, setCurrentCode] = useState("");
  const [currentJson, setCurrentJson] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const runCode = (code: string) => {
    setLogs(["🚀 Program dimulai..."]);
    try {
      const originalAlert = window.alert;
      const originalPrompt = window.prompt;

      window.alert = (msg) => setLogs(prev => [...prev, `[Output]: ${msg}`]);
      window.prompt = (msg) => {
        const res = originalPrompt(msg);
        setLogs(prev => [...prev, `[Input Request]: ${msg} -> ${res}`]);
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
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white"><Layout size={18}/></div>
          <span className="font-bold tracking-tight text-lg">Mejatika Lab</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => runCode(currentCode)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95">
            <Play size={16} fill="currentColor"/> Jalankan
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* MODUL MATERI */}
        <aside className="w-72 border-r bg-slate-50 p-5 overflow-y-auto shrink-0">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <BookOpen size={18}/>
            <span className="font-bold text-sm uppercase tracking-wider">Kurikulum Dasar</span>
          </div>
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-slate-800 text-sm">1. Tipe Data & Variabel</h3>
              <p className="text-xs text-slate-500 mt-1">Belajar menyimpan teks, angka, dan nilai benar/salah.</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-800 text-sm">2. Kontrol Keputusan</h3>
              <p className="text-xs text-slate-500 mt-1">Gunakan If-Else untuk membuat program yang bisa memilih.</p>
            </section>
            <section>
              <h3 className="font-bold text-slate-800 text-sm">3. Perulangan (Loops)</h3>
              <p className="text-xs text-slate-500 mt-1">Mengulang perintah otomatis tanpa lelah.</p>
            </section>
          </div>
        </aside>

        {/* WORKSPACE */}
        <div className="flex-1 relative min-w-0 bg-slate-100">
          <BlocklyEditor onCodeChange={setCurrentCode} onJsonChange={setCurrentJson} />
        </div>

        {/* TERMINAL */}
        <aside className="w-80 bg-slate-950 flex flex-col shrink-0 border-l border-slate-800">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Terminal</span>
            <button onClick={() => setLogs([])} className="text-slate-500 hover:text-white"><Trash2 size={14}/></button>
          </div>
          <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.includes('❌') ? 'text-red-400' : 'text-emerald-400'}`}>{log}</div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
