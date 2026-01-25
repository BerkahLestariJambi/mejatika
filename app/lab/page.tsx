"use client";
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Code, Plus, Trash2, Play, Smartphone, Tablet, Pointer } from 'lucide-react';

const BlocklyEditor = dynamic(() => import('../../components/BlocklyEditor'), { ssr: false });

export default function LabPage() {
  const [tab, setTab] = useState<'designer' | 'blocks'>('designer');
  const [components, setComponents] = useState<any[]>([]); 
  const [currentCode, setCurrentCode] = useState("");
  const [currentJson, setCurrentJson] = useState("");
  const eventHandlers = useRef<any>({});

  // 1. DESIGNER LOGIC
  const addComponent = (type: string) => {
    const id = `${type}_${components.length + 1}`;
    const newComp = {
      id, type,
      props: { text: type === 'input' ? '' : `Komponen ${id}`, bgColor: type === 'button' ? '#2563eb' : 'transparent', placeholder: 'Ketik...' }
    };
    setComponents([...components, newComp]);
  };

  // 2. ENGINE LOGIC (Menghubungkan Blok ke UI)
  const compileAndRun = () => {
    eventHandlers.current = {}; // Reset events
    
    const updateUI = (id: string, newProps: any) => {
      setComponents(prev => prev.map(c => c.id === id ? { ...c, props: { ...c.props, ...newProps } } : c));
    };

    const registerEvent = (id: string, fn: Function) => {
      eventHandlers.current[id] = fn;
    };

    try {
      // Jalankan kode untuk mendaftarkan event dan aksi awal
      const script = `(function(updateUI, registerEvent){ ${currentCode} })(updateUI, registerEvent)`;
      eval(script);
      alert("Program Berhasil Diaktifkan! Silakan berinteraksi dengan simulator.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleButtonClick = (id: string) => {
    if (eventHandlers.current[id]) {
      eventHandlers.current[id]();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* HEADER */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="font-black text-xl tracking-tighter text-indigo-600">MEJATIKA<span className="text-slate-400 font-light text-sm ml-1">v2.0</span></h1>
          <nav className="flex bg-slate-100 p-1 rounded-xl border">
            <button onClick={() => setTab('designer')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'designer' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
              <Layout size={14}/> 1. Designer
            </button>
            <button onClick={() => setTab('blocks')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'blocks' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
              <Code size={14}/> 2. Blocks Logika
            </button>
          </nav>
        </div>
        <button onClick={compileAndRun} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
          <Play size={16} fill="currentColor"/> Aktifkan Program
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* PANEL KIRI: EDITOR */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex transition-all">
          {tab === 'designer' ? (
            <div className="flex-1 flex animate-in fade-in duration-500">
              <aside className="w-64 border-r p-6 space-y-4 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Komponen UI</p>
                <button onClick={() => addComponent('label')} className="w-full flex items-center gap-3 p-4 bg-white border rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-sm font-bold"><Plus size={16} className="text-indigo-500"/> Teks / Label</button>
                <button onClick={() => addComponent('button')} className="w-full flex items-center gap-3 p-4 bg-white border rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-sm font-bold"><Plus size={16} className="text-indigo-500"/> Tombol Aksi</button>
                <button onClick={() => addComponent('input')} className="w-full flex items-center gap-3 p-4 bg-white border rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-sm font-bold"><Plus size={16} className="text-indigo-500"/> Kotak Input</button>
              </aside>
              <div className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Struktur Aplikasi <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-1 rounded-full">{components.length} Item</span></h2>
                <div className="grid grid-cols-1 gap-3">
                  {components.map((c) => (
                    <div key={c.id} className="p-4 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-between group hover:border-indigo-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 font-bold text-xs">{c.id.split('_')[1]}</div>
                        <div>
                          <p className="font-bold text-sm text-slate-700 uppercase tracking-tighter">{c.id}</p>
                          <p className="text-[10px] text-slate-400">Tipe: {c.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <button onClick={() => setComponents(components.filter(x => x.id !== c.id))} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 animate-in slide-in-from-right-4 duration-500">
              <BlocklyEditor onCodeChange={setCurrentCode} onJsonChange={setCurrentJson} initialData={currentJson} />
            </div>
          )}
        </div>

        {/* PANEL KANAN: SIMULATOR */}
        <aside className="w-[400px] shrink-0 flex flex-col items-center justify-center relative">
          <div className="bg-slate-900 w-[300px] h-[620px] rounded-[3.5rem] border-[12px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col transition-all">
            <div className="h-6 w-full flex justify-center items-end pb-1">
               <div className="w-16 h-1 bg-slate-800 rounded-full"></div>
            </div>
            
            <div className="flex-1 bg-white m-2 rounded-[2.5rem] p-8 space-y-5 overflow-y-auto scrollbar-hide">
              {components.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <Pointer size={48} className="mb-4" />
                  <p className="text-xs font-bold">Belum ada komponen.<br/>Tambahkan di Designer!</p>
                </div>
              ) : (
                components.map((c) => (
                  <div key={c.id} className="animate-in fade-in zoom-in-95">
                    {c.type === 'label' && <p style={{color: c.props.color}} className="text-center text-lg font-bold tracking-tight">{c.props.text}</p>}
                    {c.type === 'button' && (
                      <button 
                        onClick={() => handleButtonClick(c.id)}
                        style={{backgroundColor: c.props.bgColor}} 
                        className="w-full py-4 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider"
                      >
                        {c.props.text}
                      </button>
                    )}
                    {c.type === 'input' && <input placeholder={c.props.placeholder} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 text-sm focus:border-indigo-500 outline-none transition-all" />}
                  </div>
                ))
              )}
            </div>
            
            <div className="h-10 w-full flex justify-center items-start pt-2">
               <div className="w-24 h-1.5 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <div className="absolute -bottom-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">Mejatika Live Simulator</div>
        </aside>
      </main>
    </div>
  );
}
