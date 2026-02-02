"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    int angka;\n    cout << "Masukan angka = ";\n    cin >> angka;\n\n    bool hasil = angka > 10;\n    cout << hasil << endl;\n\n    return 0;\n}`);
  
  const [userInput, setUserInput] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<{type: 'out' | 'in' | 'sys', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setTerminalHistory([{ type: 'sys', text: "Terminal Mejatika siap. Tulis kode lalu tekan 'Run'." }]);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const runCode = async () => {
    if (!userInput && code.includes("cin")) {
      // Jika kode butuh cin tapi input kosong, beri instruksi ke siswa
      setTerminalHistory(prev => [...prev, { type: 'sys', text: "Program butuh input. Ketik angka di bawah lalu tekan Enter." }]);
      return;
    }

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
      
      if (data.run) {
        // Gabungkan output dan error
        const output = data.run.output || data.run.stderr || "Program selesai.";
        
        // Simulasikan tampilan terminal interaktif
        setTerminalHistory(prev => [
          ...prev, 
          { type: 'sys', text: "--- Running Program ---" },
          { type: 'out', text: output }
        ]);
      }
    } catch (error) {
      setTerminalHistory(prev => [...prev, { type: 'sys', text: "Koneksi terputus. Coba lagi." }]);
    } finally {
      setIsLoading(false);
      setUserInput(""); // Reset kotak input
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-2xl">
      {/* Action Bar */}
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
        {/* Editor */}
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

        {/* Terminal Interaktif */}
        <div className="flex flex-col bg-[#0c0c0c]">
          <div className="px-4 py-2 bg-[#1a1a1a] flex justify-between items-center border-b border-zinc-800">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <TerminalIcon size={12} /> Terminal
            </div>
            <button onClick={() => setTerminalHistory([])} className="text-zinc-600 hover:text-zinc-400"><Trash2 size={12}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
            {terminalHistory.map((line, i) => (
              <div key={i} className={`mb-1 ${
                line.type === 'out' ? 'text-emerald-500' : 
                line.type === 'sys' ? 'text-zinc-600 italic' : 'text-blue-400'
              }`}>
                <pre className="whitespace-pre-wrap inline leading-relaxed">{line.text}</pre>
              </div>
            ))}
            
            {/* Input Prompt yang menyatu dengan Terminal */}
            <div className="flex items-center gap-2 mt-4 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
              <ChevronRight size={16} className="text-emerald-500 shrink-0" />
              <input 
                type="text"
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-zinc-700"
                placeholder="Masukan angka/teks di sini lalu ENTER..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && runCode()}
              />
              <span className="text-[9px] text-zinc-600 font-bold border border-zinc-800 px-1 rounded">ENTER</span>
            </div>
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
