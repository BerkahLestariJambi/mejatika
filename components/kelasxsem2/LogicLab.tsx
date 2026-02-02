"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Variable, Zap, GitBranch, Repeat, Terminal as TerminalIcon, Code2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// Sesuai Gambar 7.2: Variabel, Ekspresi, Keputusan, Perulangan
export default function LogicLab() {
  const [logs, setLogs] = useState<string[]>(["Sistem Mejatika Siap..."]);
  const [vars, setVars] = useState({ nama: "Robot1", suhu: 25, power: 100 });

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Tabs defaultValue="variabel" className="border rounded-xl p-4 bg-card shadow-sm">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="variabel">Variabel</TabsTrigger>
              <TabsTrigger value="ekspresi">Ekspresi</TabsTrigger>
              <TabsTrigger value="keputusan">Keputusan</TabsTrigger>
              <TabsTrigger value="perulangan">Perulangan</TabsTrigger>
            </TabsList>

            <TabsContent value="variabel">
               <div className="p-2 bg-muted rounded mb-2 text-xs font-mono">
                 int suhu = {vars.suhu};
               </div>
               <Slider value={[vars.suhu]} max={100} onValueChange={(v) => setVars({...vars, suhu: v[0]})} />
               <p className="mt-2 text-sm text-muted-foreground">Variabel menyimpan nilai data.</p>
            </TabsContent>
            
            {/* Tab lainnya tetap mengikuti struktur yang sama */}
          </Tabs>
        </div>

        <div className="lg:col-span-5 bg-black rounded-xl p-4 font-mono text-xs text-emerald-500">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2">
            <TerminalIcon size={14}/> <span>CONSOLE_OUTPUT</span>
          </div>
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
