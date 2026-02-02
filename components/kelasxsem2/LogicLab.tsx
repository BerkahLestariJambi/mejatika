"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Variable, Zap, GitBranch, Repeat, Terminal as TerminalIcon, Code2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import TheoryCard from "./TheoryCard";
import LogicGrader from "./LogicGrader";

export default function LogicLab() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [vars, setVars] = useState({ nama: "Robot1", suhu: 25, power: 100 });

  useEffect(() => {
    setMounted(true);
    setLogs(["Sistem Mejatika Siap..."]);
  }, []);

  const addLog = (msg: string) => {
    if (!mounted) return;
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  if (!mounted) return <div className="p-10 text-center font-mono">Inisialisasi Lab...</div>;

  const CodeBlock = ({ code }: { code: string }) => (
    <div className="mt-4 p-3 bg-zinc-950 rounded-md border border-zinc-800 font-mono text-[11px] text-blue-400">
      <div className="flex items-center gap-2 mb-2 text-[9px] text-zinc-500 font-bold uppercase">
        <Code2 size={12} /> C++ Snippet
      </div>
      <pre>{code}</pre>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="variabel" className="border rounded-xl p-4 bg-card shadow-sm">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="variabel">Variabel</TabsTrigger>
              <TabsTrigger value="ekspresi">Ekspresi</TabsTrigger>
              <TabsTrigger value="keputusan">Keputusan</TabsTrigger>
              <TabsTrigger value="perulangan">Perulangan</TabsTrigger>
            </TabsList>

            <TabsContent value="variabel" className="space-y-4">
              <label className="text-xs font-bold uppercase text-zinc-500">Nama Robot</label>
              <div className="flex gap-2">
                <Input value={vars.nama} onChange={(e) => setVars({...vars, nama: e.target.value})} />
                <Button size="sm" onClick={() => addLog(`Variabel nama: ${vars.nama}`)}>Update</Button>
              </div>
              <CodeBlock code={`string nama = "${vars.nama}";`} />
            </TabsContent>

            <TabsContent value="ekspresi" className="space-y-4">
              <label className="text-xs font-bold uppercase text-zinc-500">Power: {vars.power}</label>
              <Slider value={[vars.power]} max={100} onValueChange={(v) => setVars({...vars, power: v[0]})} />
              <Button className="w-full" onClick={() => addLog(`Ekspresi (Power*2): ${vars.power * 2}`)}>Hitung</Button>
              <CodeBlock code={`int final_power = power * 2; // ${vars.power * 2}`} />
            </TabsContent>

            <TabsContent value="keputusan" className="space-y-4">
              <label className="text-xs font-bold uppercase text-zinc-500">Suhu: {vars.suhu}°C</label>
              <Slider value={[vars.suhu]} max={100} onValueChange={(v) => setVars({...vars, suhu: v[0]})} />
              <Button variant="destructive" className="w-full" onClick={() => addLog(`Keputusan: ${vars.suhu > 35 ? 'PANAS' : 'NORMAL'}`)}>Cek Kondisi</Button>
              <CodeBlock code={`if (suhu > 35) cout << "PANAS";\nelse cout << "NORMAL";`} />
            </TabsContent>

            <TabsContent value="perulangan" className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => {
                for(let i=1; i<=3; i++) setTimeout(() => addLog(`Loop ke-${i}`), i * 300);
              }}>Jalankan Loop 3x</Button>
              <CodeBlock code={`for(int i=1; i<=3; i++) {\n  cout << i;\n}`} />
            </TabsContent>
          </Tabs>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className={`w-10 h-10 rounded-full ${vars.suhu > 35 ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-blue-500 shadow-[0_0_15px_blue]'} transition-all`} />
            <span className="text-[10px] font-mono text-zinc-500">SYSTEM_STATUS: {vars.nama.toUpperCase()}</span>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <TheoryCard />
          <LogicGrader currentVars={vars} />
          <div className="bg-black rounded-xl p-4 font-mono text-[11px] text-emerald-500 border border-zinc-800 h-48 overflow-y-auto">
            <div className="flex items-center gap-2 text-zinc-600 mb-2 border-b border-zinc-900 pb-1"><TerminalIcon size={12}/> CONSOLE</div>
            {logs && logs.map((l, i) => <div key={i} className={i === 0 ? "text-emerald-300" : "opacity-40"}>{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
