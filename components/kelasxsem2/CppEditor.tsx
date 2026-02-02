"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Code2, Trash2, Loader2, Keyboard } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CppEditor() {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>(`#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string nama;\n    int angka;\n\n    cout << "Masukkan nama Anda: ";\n    cin >> nama;\n    cout << "Masukkan angka favorit: ";\n    cin >> angka;\n\n    cout << "\\nHalo " << nama << "!" << endl;\n    cout << "Angka favorit Anda dikali 2 adalah: " << (angka * 2) << endl;\n\n    return 0;\n}`);
  const [stdin, setStdin] = useState<string>(""); // State untuk menampung input pengguna
  const [output, setOutput] = useState<string>("Hasil eksekusi akan muncul di sini...");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const runCode = async () => {
    setIsLoading(true);
    setOutput("Sedang menjalankan...");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "cpp",
          version: "10.2.0",
          files: [{ content: code }],
          stdin: stdin, // Mengirimkan teks input ke compiler
        }),
      });

      const data = await response.json();
      
      if (data.run) {
        const result = data.run.output || (data.run.stderr ? `Error:\n${data.run.stderr}` : "Program selesai.");
        setOutput(result);
      } else {
        setOutput("Gagal mendapatkan respon dari server.");
      }
    } catch (error) {
      setOutput("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-2xl">
      {/* Header / Action Bar */}
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Code2 size={16} className="text-blue-400" />
          <span className="text-xs font-mono text-zinc-300">main.cpp</span>
        </div>
        <Button 
          onClick={runCode} 
          size="sm" 
          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-w-[100px]"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          {isLoading ? "Running..." : "Run Code"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
        {/* SISI KIRI: Editor Kode */}
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
            }}
          />
        </div>

        {/* SISI KANAN: Input & Output */}
        <div className="flex flex-col bg-[#0f0f0f]">
          
          {/* Bagian Input (Stdin) */}
          <div className="flex-1 flex flex-col border-b border-zinc-800">
            <div className="px-4 py-2 bg-[#1a1a1a] flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
              <Keyboard size={12} /> Input (Masukkan data di sini)
            </div>
            <textarea
              className="flex-1 w-full bg-[#0f0f0f] p-4 font-mono text-sm text-blue-400 outline-none resize-none focus:bg-[#151515] transition-colors"
              placeholder="Contoh format input:&#10;Budi&#10;7"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          </div>

          {/* Bagian Output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                <TerminalIcon size={12} /> Console Output
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-[9px]" onClick={() => setOutput("")}>
                <Trash2 size={10} /> Clear
              </Button>
            </div>
            <div className="p-4 font-mono text-sm text-emerald-500 overflow-y-auto h-full">
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
