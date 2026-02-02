"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    int angka;\n    cout << "Masukan angka = ";\n    cin >> angka;\n\n    bool hasil = angka > 10;\n    cout << hasil << endl;\n\n    return 0;\n}`);
  
  const [userInput, setUserInput] = useState<string>("");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isWaitingInput, setIsWaitingInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Fokus ke input saat program butuh input
  useEffect(() => {
    if (isWaitingInput) inputRef.current?.focus();
  }, [isWaitingInput]);

  const handleRun = () => {
    setTerminalLines(["Compiling..."]);
    setIsLoading(true);
    
    // Simulasi: Program berjalan dan berhenti di "Masukan angka ="
    setTimeout(() => {
      setTerminalLines(["Masukan angka = "]);
      setIsWaitingInput(true);
      setIsLoading(false);
    }, 800);
  };

  const submitInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput) return;

    setIsWaitingInput(false);
    setIsLoading(true);

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
      const output = data.run.output || data.run.stderr;
      
      // Tampilkan hasil akhir
      setTerminalLines(output.split('\n'));
    } catch (error) {
      setTerminalLines(["Error: Gagal koneksi compiler."]);
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e]">
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2"><Code2 size={14} className="text-blue-400" /><span className="text-xs text-zinc-300">main.cpp</span></div>
        <Button onClick={handleRun} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7" disabled={isLoading}>
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
          Run
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[500px]">
        <div className="border-r border-zinc-800">
          <Editor height="100%" defaultLanguage="cpp" theme="vs-dark" value={code} onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false }, fontSize: 13 }} />
        </div>

        <div className="bg-black p-4 font-mono text-sm overflow-y-auto flex flex-col">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] mb-4 uppercase border-b border-zinc-900 pb-2">
            <TerminalIcon size={12} /> Terminal Output
          </div>
          
          <div className="flex-1 text-emerald-500">
            {terminalLines.map((line, i) => (
              <div key={i}>
                {/* Jika baris terakhir dan sedang menunggu input, tampilkan inline input */}
                {isWaitingInput && i === terminalLines.length - 1 ? (
                  <form onSubmit={submitInput} className="flex inline-flex w-full">
                    <span>{line}</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="bg-transparent border-none outline-none text-white flex-1 ml-1 caret-emerald-500"
                      autoFocus
                    />
                  </form>
                ) : (
                  <pre className="whitespace-pre-wrap">{line}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
