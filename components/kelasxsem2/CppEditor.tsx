"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code2, Terminal as TerminalIcon, Copy, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CppEditor() {
  const [code, setCode] = useState<string>(`#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Welcome to Mejatika IDE!" << endl;\n    return 0;\n}`);
  const [output, setOutput] = useState<string>("Run the code to see the output here...");

  const handleRun = () => {
    setOutput("Simulasi: Program sedang berjalan...\nOutput: Welcome to Mejatika IDE!");
  };

  return (
    <Card className="overflow-hidden border-zinc-800 bg-[#1e1e1e] shadow-2xl">
      {/* Toolbar Atas */}
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <Code2 size={14} className="text-blue-400" />
            <span>main.cpp</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRun}
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-8 px-4"
          >
            <Play size={14} fill="currentColor" /> Run
          </Button>
        </div>
      </div>

      {/* Editor & Terminal Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[450px]">
        {/* Editor (Kiri) */}
        <div className="border-r border-zinc-800">
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Terminal (Kanan) */}
        <div className="flex flex-col bg-[#0f0f0f]">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <TerminalIcon size={12} /> Terminal
          </div>
          <div className="p-4 font-mono text-sm text-emerald-500 overflow-y-auto flex-1 leading-relaxed">
            <div className="opacity-50 mb-2">Welcome to Mejatika IDE Terminal!</div>
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </div>
    </Card>
  );
}
