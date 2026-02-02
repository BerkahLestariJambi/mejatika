"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    int angka;\n    cout << "Masukan angka = ";\n    cin >> angka;\n\n    bool hasil = angka > 10;\n    cout << hasil << endl;\n\n    return 0;\n}`);
  
  const [userInput, setUserInput] = useState<string>("");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isWaitingInput, setIsWaitingInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    setMounted(true); 
    setTerminalLines(["Mejatika Compiler v1.0. Klik Run untuk memulai."]);
  }, []);

  // Memastikan kursor fokus ke terminal saat menunggu input
  useEffect(() => {
    if (isWaitingInput) {
      inputRef.current?.focus();
    }
  }, [isWaitingInput]);

  const handleRun = () => {
    setIsLoading(true);
    setTerminalLines(["Compiling..."]);
    
    // Simulasi jeda waktu compile agar terasa nyata
    setTimeout(() => {
      setTerminalLines(["Masukan angka = "]);
      setIsWaitingInput(true);
      setIsLoading(false);
    }, 600);
  };

  // FUNGSI AUTO-RUN SAAT TEKAN ENTER
  const handleAutoRun = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!userInput) return;

      setIsLoading(true);
      setIsWaitingInput(false);

      try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "cpp",
            version: "10.2.0",
            files: [{ content: code }],
            stdin: userInput, 
          }),
        });

        const data = await response.json();
        
        // Menggabungkan pertanyaan dan jawaban di terminal
        // Output dari C++ biasanya menyertakan "Masukan angka = " di awalnya jika menggunakan cout
        const output = data.run.output || data.run.stderr;
        
        // Tampilkan hasil akhir secara utuh
        setTerminalLines(output.split('\n'));
      } catch (error) {
        setTerminalLines(["Error: Masalah koneksi ke compiler."]);
      } finally {
        setIsLoading(false);
        setUserInput("");
      }
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
        <div className="flex gap-2">
          <Button onClick={() => setTerminalLines([])} variant="ghost" size="sm" className="h-8 text-zinc-500 hover:text-white">
            <Trash2 size={14} />
          </Button>
          <Button onClick={handleRun} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-w-[80px]" disabled={isLoading}>
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[550px]">
        {/* PANEL EDITOR */}
        <div className="border-r border-zinc-800">
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* PANEL TERMINAL (AUTO-RUN) */}
        <div className="bg-black p-6 font-mono text-sm overflow-y-auto flex flex-col group">
          <div className="flex items-center gap-2 text-zinc-700 text-[10px] mb-4 uppercase tracking-widest font-bold">
            <TerminalIcon size={12} /> Interactive Console
          </div>
          
          <div className="flex-1 text-emerald-500 leading-relaxed">
            {terminalLines.map((line, i) => (
              <div key={i} className="flex flex-wrap items-center">
                {/* Baris terakhir yang menunggu input */}
                {isWaitingInput && i === terminalLines.length - 1 ? (
                  <div className="flex items-center w-full">
                    <span className="whitespace-pre text-emerald-500">{line}</span>
                    <input
                      ref={inputRef}
                      type="text"
                      className="bg-transparent border-none outline-none text-white flex-1 ml-1 caret-emerald-500 font-mono"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleAutoRun}
                      autoFocus
                    />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap">{line}</pre>
                )}
              </div>
            ))}
            {isLoading && <span className="animate-pulse text-zinc-700">_</span>}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-900 text-[10px] text-zinc-600 italic">
            {isWaitingInput ? "Ketik angka lalu tekan ENTER" : "Tekan tombol Run untuk memulai sesi program"}
          </div>
        </div>
      </div>
    </div>
  );
}
