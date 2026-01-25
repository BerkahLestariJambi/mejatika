import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Play, Trash2, Save, Download, ChevronRight, Layout } from 'lucide-react';

// Import Blockly secara dinamis agar tidak error SSR di Vercel
const BlocklyEditor = dynamic(() => import('../components/BlocklyEditor'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50">Memuat Editor...</div>
});

export default function LabPage() {
  const [currentCode, setCurrentCode] = useState("");
  const [currentJson, setCurrentJson] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // FUNGSI UTAMA: Menjalankan Kode dari Blok
  const runCode = (generatedCode: string) => {
    setLogs([]); // Reset console
    setLogs(prev => [...prev, "🚀 Memulai program..."]);

    try {
      // 1. Bajak window.alert agar masuk ke UI Console kita
      const originalAlert = window.alert;
      window.alert = (msg) => {
        setLogs(prev => [...prev, `[Output]: ${msg}`]);
      };

      // 2. Jalankan kode
      // Kita bungkus di try-catch untuk menangkap error runtime (misal: variabel belum didefinisikan)
      eval(generatedCode);

      // 3. Kembalikan alert asli
      window.alert = originalAlert;
      
      setLogs(prev => [...prev, "✅ Program selesai dijalankan."]);
    } catch (err: any) {
      setLogs(prev => [...prev, `❌ Error: ${err.message}`]);
    }
  };

  // FUNGSI: Simpan file .mjtka (JSON) ke Komputer
  const downloadProject = () => {
    const blob = new Blob([currentJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projek-mejatika-${new Date().getTime()}.mjtka`;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-slate-900">
      
      {/* HEADER / NAVBAR */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Layout size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none">Mejatika Lab</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Algoritma & Pemrograman</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={downloadProject}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Download size={18} /> Simpan
          </button>
          <button 
            onClick={() => runCode(currentCode)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Play size={18} fill="currentColor" /> Jalankan
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR MATERI (KIRI) */}
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r bg-slate-50 overflow-y-auto relative`}>
          <div className="p-6 w-80">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Modul 01</span>
            <h2 className="text-xl font-bold mt-3 mb-2">Logika Percabangan</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Gunakan blok <b>If-Else</b> untuk mengecek apakah sebuah angka genap atau ganjil.
            </p>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Tugas Praktik:</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex gap-2"> <ChevronRight size={14} className="text-blue-500 shrink-0 mt-1" /> Buat variabel <b>angka</b></li>
                <li className="flex gap-2"> <ChevronRight size={14} className="text-blue-500 shrink-0 mt-1" /> Beri nilai 10</li>
                <li className="flex gap-2"> <ChevronRight size={14} className="text-blue-500 shrink-0 mt-1" /> Print "Genap" jika habis dibagi 2</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* EDITOR AREA (TENGAH) */}
        <div className="flex-1 relative bg-[#F8FAFC]">
          <BlocklyEditor 
            onCodeChange={setCurrentCode} 
            onJsonChange={setCurrentJson} 
          />
        </div>

        {/* CONSOLE PANEL (KANAN) */}
        <aside className="w-80 bg-slate-900 flex flex-col border-l border-slate-800 shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Terminal</span>
            <button onClick={() => setLogs([])} className="text-slate-500 hover:text-white transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto scrollbar-hide">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                <Layout size={40} className="mb-2 text-white" />
                <p className="text-[10px] text-white font-bold uppercase tracking-widest text-center">Menunggu Input...</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`mb-1.5 break-words ${log.startsWith('❌') ? 'text-red-400' : log.startsWith('✅') ? 'text-blue-400' : 'text-emerald-400'}`}>
                  {log}
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800">
             <div className="text-[9px] font-bold text-slate-600 uppercase mb-2">Generated JS Code</div>
             <pre className="text-[10px] text-slate-500 truncate italic">
               {currentCode || "// Belum ada blok..."}
             </pre>
          </div>
        </aside>
      </main>
    </div>
  );
}
