"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Variable, Zap, GitBranch, Repeat, Terminal as TerminalIcon, Code2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// Import komponen pendukung
import TheoryCard from "./TheoryCard";
import LogicGrader from "./LogicGrader";

export default function LogicLab() {
  const [logs, setLogs] = useState<string[]>(["Sistem Mejatika Siap..."]);
  const [vars, setVars] = useState({ nama: "Robot1", suhu: 25, power: 100 });

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  // Komponen Reusable untuk menampilkan referensi kode C++
  const CodeBlock = ({ code }: { code: string }) => (
    <div className="mt-4 p-3 bg-zinc-950 rounded-md border border-zinc-800 font-mono text-[12px]">
      <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
        <Code2 size={12} /> C++ Snippet
      </div>
      <pre className="text-blue-400 whitespace-pre-wrap">{code}</pre>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-bold">Lab Pemrograman Prosedural X-2</h1>
        <p className="text-sm text-muted-foreground italic">Materi: Variabel, Ekspresi, Keputusan, dan Perulangan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI: EDITOR LOGIKA */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="variabel" className="border rounded-xl p-4 bg-card shadow-sm">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="variabel">Variabel</TabsTrigger>
              <TabsTrigger value="ekspresi">Ekspresi</TabsTrigger>
              <TabsTrigger value="keputusan">Keputusan</TabsTrigger>
              <TabsTrigger value="perulangan">Perulangan</TabsTrigger>
            </TabsList>

            {/* ELEMEN 1: VARIABEL */}
            <TabsContent value="variabel" className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500">Input Nama Robot</label>
                <div className="flex gap-2">
                  <Input 
                    value={vars.nama} 
                    onChange={(e) => setVars({...vars, nama: e.target.value})} 
                  />
                  <Button size="sm" onClick={() => addLog(`Variabel 'nama' disimpan: ${vars.nama}`)}>Update</Button>
                </div>
              </div>
              <CodeBlock code={`string nama = "${vars.nama}";`} />
            </TabsContent>

            {/* ELEMEN 2: EKSPRESI */}
            <TabsContent value="ekspresi" className="space-y-4">
              <label className="text-xs font-bold uppercase text-zinc-500">Power Motor: {vars.power}</label>
              <Slider 
                value={[vars.power]} 
                max={100} 
                onValueChange={(v) => setVars({...vars, power: v[0]})} 
              />
              <Button className="w-full" onClick={() => addLog(`Ekspresi (Power * 2): ${vars.power * 2}`)}>
                Hitung Output Power
              </Button>
              <CodeBlock code={`int final_power = power * 2; // Hasil: ${vars.power * 2}`} />
            </TabsContent>

            {/* ELEMEN 3: KEPUTUSAN */}
            <TabsContent value="keputusan" className="space-y-4">
              <label className="text-xs font-bold uppercase text-zinc-500">Monitor Suhu: {vars.suhu}°C</label>
              <Slider 
                value={[vars.suhu]} 
                max={100} 
                onValueChange={(v) => setVars({...vars, suhu: v[0]})} 
              />
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                    const status = vars.suhu > 35 ? "OVERHEAT!" : "NORMAL";
                    addLog(`Keputusan (Suhu > 35): ${status}`);
                }}
              >
                Cek Logika Keputusan
              </Button>
              <CodeBlock code={`if (suhu > 35) {\n  cout << "OVERHEAT!";\n} else {\n  cout << "NORMAL";\n}`} />
            </TabsContent>

            {/* ELEMEN 4: PERULANGAN */}
            <TabsContent value="perulangan" className="space-y-4">
              <p className="text-sm text-muted-foreground italic">Menjalankan iterasi otomatis sebanyak 3 kali.</p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  for(let i=1; i<=3; i++) {
                    setTimeout(() => addLog(`Looping: Iterasi ke-${i}`), i * 400);
                  }
                }}
              >
                Jalankan for-loop
              </Button>
              <CodeBlock code={`for (int i = 1; i <= 3; i++) {\n  cout << "Iterasi ke-" << i;\n}`} />
            </TabsContent>
          </Tabs>

          {/* VISUALISASI STATUS SISTEM */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center gap-4">
              <div className={`w-12 h-12 rounded-full animate-pulse transition-colors ${vars.suhu > 35 ? 'bg-red-500 shadow-[0_0_20px_red]' : 'bg-blue-500 shadow-[0_0_20px_blue]'}`} />
              <div className="text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                System Visualization: {vars.nama} | Status: {vars.suhu > 35 ? 'Warning' : 'Stable'}
              </div>
          </div>
        </div>

        {/* KOLOM KANAN: TEORI, GRADER, TERMINAL */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <TheoryCard />
          <LogicGrader currentVars={vars} />

          {/* CONSOLE TERMINAL */}
          <div className="bg-black rounded-xl p-4 font-mono text-xs text-emerald-500 border border-zinc-800 h-64 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2 text-zinc-500">
              <TerminalIcon size={14}/> <span>MEJATIKA_CONSOLE_V1</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {logs.map((l, i) => (
                <div key={i} className={i === 0 ? "text-emerald-300" : "opacity-50"}>
                  <span className="text-zinc-700 mr-2">$</span>{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
