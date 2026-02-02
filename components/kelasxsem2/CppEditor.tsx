"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Halo dari Mejatika Compiler!" << endl;\n    return 0;\n}`);
  const [output, setOutput] = useState<string>("Klik 'Run' untuk mengompilasi kode...");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const runCode = async () => {
    setIsLoading(true);
    setOutput("Sedang mengompilasi dan menjalankan...");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "cpp",
          version: "10.2.0",
          files: [{ content: code }],
        }),
      });

      const data = await response.json();
      
      if (data.run) {
        // Gabungkan stdout (output normal) dan stderr (jika ada error)
        const result = data.run.output || (data.run.stderr ? `Error:\n${data.run.stderr}` : "Program selesai tanpa output.");
        setOutput(result);
      } else {
        setOutput("Gagal mendapatkan respon dari server compiler.");
      }
    } catch (error) {
      setOutput("Terjadi kesalahan koneksi ke server compiler.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearTerminal = () => setOutput("");

  if (!mounted) return null;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-2xl">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Code2 size={16} className="text-blue-400" />
          <span className="text-xs font-mono text-zinc-300">main.cpp</span>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={clearTerminal} 
            variant="ghost" 
            size="sm" 
            className="h-8 text-zinc-400 hover:text-white"
            disabled={isLoading}
          >
            <Trash2 size={14} />
          </Button>
          <Button 
            onClick={runCode} 
            size="sm" 
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-w-[80px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
            {isLoading ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[500px]">
        {/* Panel Kode */}
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

        {/* Panel Terminal Real-Time */}
        <div className="flex flex-col bg-[#0f0f0f]">
          <div className="px-4 py-2 bg-[#1a1a1a] border-b border-zinc-800 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <TerminalIcon size={12} /> Console Output
          </div>
          <div className="p-4 font-mono text-sm overflow-y-auto h-full text-emerald-500">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
