"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    int angka;\n    cout << "Masukan angka = ";\n    cin >> angka;\n\n    bool hasil = angka > 10;\n    cout << "Hasilnya adalah = " << hasil << endl;\n\n    return 0;\n}`);
  
  const [userInput, setUserInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<{content: string}[]>([]);
  const [isWaitingInput, setIsWaitingInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setMounted(true); 
    setTerminalLines([{ content: "Terminal Mejatika Aktif. Klik Run." }]);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  useEffect(() => {
    if (isWaitingInput) {
      // Memberi sedikit delay agar input render sempurna sebelum difokuskan
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isWaitingInput]);

  const handleRun = () => {
    setIsLoading(true);
    setTerminalLines([{ content: "Compiling..." }]);
    
    // Simulasi inisialisasi program
    setTimeout(() => {
      setTerminalLines([{ content: "Masukan angka = " }]);
      setIsWaitingInput(true);
      setIsLoading(false);
    }, 600);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = userInput;
      if (!val) return;

      setIsWaitingInput(false);
      setIsLoading(true);
      setUserInput(""); 

      // 1. Tambahkan angka yang diketik ke baris prompt di terminal
      setTerminalLines(prev => {
        const last = [...prev];
        last[last.length - 1].content += val;
        return last;
      });

      try {
        const res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "cpp",
            version: "10.2.0",
            files: [{ content: code }],
            stdin: val, 
          }),
        });

        const data = await res.json();
        const output = data.run.output || data.run.stderr || "";
        
        // 2. Logika Pemisahan Output
        // Memisahkan berdasarkan baris baru dan mengambil baris terakhir (hasil cout)
        const lines = output.split('\n').filter(l => l.trim() !== "");
        const finalResult = lines.length > 1 ? lines[lines.length - 1] : "";

        if (finalResult) {
          setTerminalLines(prev => [...prev, { content: finalResult }]);
        }
      } catch (err) {
        setTerminalLines(prev => [...prev, { content: "Error: Gagal memproses data." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-lg">
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-300">
          <Code2 size={16} className="text-blue-400" />
          <span className="text-xs font-mono">main.cpp</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTerminalLines([])} variant="ghost" size="sm" className="h-7 text-zinc-500 hover:text-white">
            <Trash2 size={14} />
          </Button>
          <Button onClick={handleRun} size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[500px]">
        <div className="border-r border-zinc-800">
          <Editor 
            height="100%" 
            defaultLanguage="cpp" 
            theme="vs-dark" 
            value={code} 
            onChange={(v) => setCode(v || "")} 
            options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }} 
          />
        </div>

        <div className="bg-[#0c0c0c] p-5 font-mono text-sm overflow-y-auto flex flex-col">
          <div className="flex items-center gap-2 text-zinc-700 text-[10px] mb-4 uppercase font-bold border-b border-zinc-900 pb-2 tracking-widest">
            <TerminalIcon size={12} /> Terminal Output
          </div>
          
          <div className="flex-1 text-emerald-500">
            {terminalLines.map((line, i) => (
              <div key={i} className="flex flex-wrap items-center">
                <pre className="whitespace-pre-wrap">{line.content}</pre>
                
                {isWaitingInput && i === terminalLines.length - 1 && (
                  <input
                    ref={inputRef}
                    type="text"
                    className="bg-transparent border-none outline-none text-white flex-1 font-mono ml-1 caret-emerald-500"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
