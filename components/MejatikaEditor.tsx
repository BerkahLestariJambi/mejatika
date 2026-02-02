"use client";

import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play, Terminal, Trash2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const DEFAULT_CODE = `#include <iostream>
#include <vector>

// API Mejatika (Simulasi)
void setPower(int level) {
    std::cout << "[SYSTEM] Power set to: " << level << "%" << std::endl;
}

int main() {
    std::cout << "--- Mejatika Simulation Started ---" << std::endl;
    
    std::vector<int> sensors = {10, 20, 30};
    std::cout << "Initializing " << sensors.size() << " sensors..." << std::endl;
    
    setPower(85);
    
    return 0;
}
`;

export default function MejatikaEditor() {
  const [logs, setLogs] = useState<{ type: 'info' | 'error' | 'sys', text: string }[]>([]);
  const editorRef = useRef(null);

  const handleRun = () => {
    setLogs([{ type: 'sys', text: "Compiling via Mejatika G++..." }]);
    
    // Simulasi eksekusi kode C++ iostream
    setTimeout(() => {
      const newLogs = [
        { type: 'info', text: "--- Mejatika Simulation Started ---" },
        { type: 'info', text: "Initializing 3 sensors..." },
        { type: 'info', text: "[SYSTEM] Power set to: 85%" },
        { type: 'sys', text: "Process exited with code 0" },
      ];
      setLogs(prev => [...prev, ...newLogs]);
    }, 800);
  };

  const clearConsole = () => setLogs([]);

  return (
    <Card className="flex flex-col h-[600px] w-full bg-[#1e1e1e] border-zinc-800 overflow-hidden shadow-2xl">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between p-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-400">
          <Cpu size={18} className="text-blue-500" />
          <span className="text-sm font-medium">mejatika_main.cpp</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearConsole} className="text-zinc-400 hover:text-white">
            <Trash2 size={16} />
          </Button>
          <Button size="sm" onClick={handleRun} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Play size={16} className="mr-2 fill-current" /> Run
          </Button>
        </div>
      </div>

      {/* Editor & Console Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-[2] border-r border-zinc-800">
          <Editor
            height="100%"
            defaultLanguage="cpp"
            defaultValue={DEFAULT_CODE}
            theme="vs-dark"
            onMount={(editor) => (editorRef.current = editor)}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 10 },
              smoothScrolling: true,
              cursorBlinking: "expand",
            }}
          />
        </div>

        {/* Console Output */}
        <div className="flex-1 flex flex-col bg-black/50">
          <div className="flex items-center gap-2 p-2 bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            <Terminal size={12} /> Console Output
          </div>
          <ScrollArea className="flex-1 p-4 font-monospace text-sm">
            {logs.length === 0 && <span className="text-zinc-700 italic text-xs">No output yet. Press Run...</span>}
            {logs.map((log, i) => (
              <div key={i} className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'sys' ? 'text-blue-400 font-bold' : 
                'text-zinc-300'
              }`}>
                <span className="opacity-50 mr-2 shrink-0 select-none">{">"}</span>
                {log.text}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
}
