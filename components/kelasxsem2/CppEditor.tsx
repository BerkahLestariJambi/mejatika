"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    int angka;\n    cout << "Masukan angka = ";\n    cin >> angka;\n\n    bool hasil = angka > 10;\n    cout << hasil << endl;\n\n    return 0;\n}`);
  
  const [userInput, setUserInput] = useState<string>("");
  const [terminalLines, setTerminalLines] = useState<{type: 'text' | 'input', content: string}[]>([]);
  const [isWaitingInput, setIsWaitingInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setMounted(true); 
    setTerminalLines([{ type: 'text', content: "Mejatika IDE v1.0. Silakan klik Run." }]);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  useEffect(() => {
    if (isWaitingInput) inputRef.current?.focus();
  }, [isWaitingInput]);

  const handleRun = () => {
    setIsLoading(true);
    setTerminalLines([{ type: 'text', content: "Compiling..." }]);
    
    setTimeout(() => {
      // Prompt pertama muncul
      setTerminalLines([{ type: 'text', content: "Masukan angka = " }]);
      setIsWaitingInput(true);
      setIsLoading(false);
    }, 600);
  };

  const handleAutoRun = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!userInput) return;

      const savedInput = userInput;
      setUserInput(""); 
      setIsWaitingInput(false);
      setIsLoading(true);

      // 1. Tampilkan angka yang diketik user di baris yang sama
      setTerminalLines(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content += savedInput;
        return updated;
      });

      try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "cpp",
            version: "10.2.0",
            files: [{ content: code }],
            stdin: savedInput, 
          }),
        });

        const data = await response.json();
        const fullOutput = data.run.output || data.run.stderr;

        // 2. Logika Pemisahan: Kita hanya ambil baris SETELAH prompt
        // Jika output adalah "Masukan angka = 1\n0\n", kita ambil "0"
        const lines = fullOutput.split('\n');
        const onlyResult = lines.length > 1 ? lines.slice(1).join('\n') : "";

        // 3. Tambahkan hasil di baris baru bawahnya
        if (onlyResult.trim() !== "") {
          setTerminalLines(prev => [...prev, { type: 'text', content: onlyResult }]);
        } else if (data.run.output) {
            // Fallback jika format berbeda
            setTerminalLines(prev => [...prev, { type: 'text', content: data.run.output.replace("Masukan angka = ", "") }]);
        }
        
      } catch (error) {
        setTerminalLines(prev => [...prev, { type: 'text', content: "\n[Error koneksi]" }]);
      } finally {
        setIsLoading(false);
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
        <Button onClick={handleRun} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-w-[80px]" disabled={isLoading}>
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          Run
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[550px]">
        <div className="border-r border-zinc-800">
          <Editor height="100%" defaultLanguage="cpp" theme="vs-dark" value={code} onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false }, fontSize: 14 }} />
        </div>

        <div className="bg-black p-6 font-mono text-sm overflow-y-auto flex flex-col">
          <div className="flex items-center gap-2 text-zinc-700 text-[10px] mb-4 uppercase font-bold border-b border-zinc-900 pb-2">
            <TerminalIcon size={12} /> Interactive Console
          </div>
          
          <div className="flex-1 text-emerald-500 space-y-1">
            {terminalLines.map((line, i) => (
              <div key={i} className="flex flex-wrap items-center">
                <pre className="whitespace-pre-wrap">{line.content}</pre>
                
                {/* Kursor Aktif */}
                {isWaitingInput && i === terminalLines.length - 1 && (
                  <input
                    ref={inputRef}
                    type="text"
                    className="bg-transparent border-none outline-none text-white flex-1 font-mono ml-1 caret-emerald-500"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleAutoRun}
                    autoFocus
                  />
                )}
              </div>
            ))}
            {isLoading && <div className="text-zinc-600 animate-pulse mt-2">Processing...</div>}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
