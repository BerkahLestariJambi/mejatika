"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    float jari, luas;\n    const float phi = 3.14;\n\n    cout << "=== HITUNG LUAS LINGKARAN ===" << endl;\n    cout << "Masukkan jari-jari: ";\n    cin >> jari;\n\n    luas = phi * jari * jari;\n    cout << "Luas Lingkaran adalah: " << luas << endl;\n\n    return 0;\n}`);
  
  const [stdinValue, setStdinValue] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<{type: 'out' | 'in' | 'sys', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setTerminalHistory([{ type: 'sys', text: "Mejatika Compiler v1.0. Siap dijalankan..." }]);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const runCode = async () => {
    setIsLoading(true);
    // Tambahkan log sistem saat mulai
    setTerminalHistory(prev => [...prev, { type: 'sys', text: "Menjalankan program..." }]);

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "cpp",
          version: "10.2.0",
          files: [{ content: code }],
          stdin: stdinValue, 
        }),
      });

      const data = await response.json();
      
      if (data.run) {
        // Jika ada input dari user, tampilkan dulu inputnya di terminal agar terlihat interaktif
        if (stdinValue) {
          setTerminalHistory(prev => [...prev, { type: 'in', text: stdinValue }]);
        }
        
        const output = data.run.output || data.run.stderr || "Program selesai.";
        setTerminalHistory(prev => [...prev, { type: 'out', text: output }]);
      }
    } catch (error) {
      setTerminalHistory(prev => [...prev, { type: 'sys', text: "Error: Gagal menghubungi server compiler." }]);
    } finally {
      setIsLoading(false);
      setStdinValue(""); // Bersihkan input setelah run
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-2xl">
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Code2 size={16} className="text-blue-400" />
          <span className="text-xs font-mono text-zinc-300">main.cpp</span>
        </div>
        <Button onClick={runCode} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-2" disabled={isLoading}>
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          Run
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[550px]">
        <div className="border-r border-zinc-800">
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        <div className="flex flex-col bg-[#0c0c0c]">
          <div className="px-4 py-2 bg-[#1a1a1a] flex justify-between items-center border-b border-zinc-800">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <TerminalIcon size={12} /> Interactive Terminal
            </div>
            <button onClick={() => setTerminalHistory([])} className="text-zinc-600 hover:text-zinc-400"><Trash2 size={12}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm custom-scrollbar bg-black/50">
            {terminalHistory.map((line, i) => (
              <div key={i} className={`mb-1 ${
                line.type === 'out' ? 'text-emerald-500' : 
                line.type === 'in' ? 'text-blue-400 font-bold' : 'text-zinc-600 italic'
              }`}>
                {line.type === 'in' && <span className="mr-2 text-zinc-700">{'>'}</span>}
                <pre className="whitespace-pre-wrap inline">{line.text}</pre>
              </div>
            ))}
            
            {/* Input Prompt di bagian bawah terminal */}
            <div className="flex items-center gap-2 text-white mt-4 bg-zinc-900/50 p-2 rounded">
              <ChevronRight size={16} className="text-blue-500 shrink-0" />
              <input 
                type="text"
                className="bg-transparent border-none outline-none w-full placeholder:text-zinc-700"
                placeholder="Masukkan angka/teks di sini..."
                value={stdinValue}
                onChange={(e) => setStdinValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && runCode()}
              />
              <span className="text-[9px] text-zinc-600 bg-black px-1 rounded border border-zinc-800">ENTER</span>
            </div>
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
