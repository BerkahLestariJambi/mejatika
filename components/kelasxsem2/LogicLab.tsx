"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Variable, Zap, GitBranch, Repeat, Terminal as TerminalIcon, Code2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function LogicLab() {
  const [logs, setLogs] = useState<string[]>(["Sistem Mejatika Siap..."]);
  const [vars, setVars] = useState({ nama: "Robot1", suhu: 25, power: 100 });

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  // Helper untuk menampilkan box kode referensi
  const CodeReference = ({ code }: { code: string }) => (
    <div className="mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
        <Code2 size={12} /> Referensi C++
      </div>
      <pre className="text-[13px] font-mono text-blue-400 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 bg-background text-foreground max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Laboratorium Pemrograman Prosedural</h1>
        <p className="text-muted-foreground text-sm">Unit: Elemen Dasar Bahasa C/C++ (Variabel, Ekspresi, Keputusan, Perulangan)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL KONTROL */}
        <div className="lg:col-span-7">
          <Tabs defaultValue="variabel" className="border rounded-xl p-4 bg-card shadow-sm">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="variabel" className="gap-2"><Variable size={14}/> Variabel</TabsTrigger>
              <TabsTrigger value="ekspresi" className="gap-2"><Zap size={14}/> Ekspresi</TabsTrigger>
              <TabsTrigger value="keputusan" className="gap-2"><GitBranch size={14}/> Keputusan</TabsTrigger>
              <TabsTrigger value="perulangan" className="gap-2"><Repeat size={14}/> Perulangan</TabsTrigger>
            </TabsList>

            {/* 1. ELEMEN VARIABEL */}
            <TabsContent value="variabel" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deklarasi & Inisialisasi</label>
                <div className="flex gap-2">
                  <Input 
                    value={vars.nama} 
                    onChange={(e) => setVars({...vars, nama: e.target.value})} 
                  />
                  <Button onClick={() => addLog(`Variabel 'nama' disimpan.`)}>Simpan</Button>
                </div>
              </div>
              <CodeReference code={`string nama = "${vars.nama}";\nint suhu = ${vars.suhu};`} />
            </TabsContent>

            {/* 2. ELEMEN EKSPRESI */}
            <TabsContent value="ekspresi" className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Operasi Aritmatika (Power x 2)</label>
                <Slider value={[vars.power]} max={200} onValueChange={(v) => setVars({...vars, power: v[0]})} />
                <Button variant="outline" className="w-full" onClick={() => addLog(`Hasil Ekspresi: ${vars.power * 2}`)}>
                  Hitung Nilai Baru
                </Button>
              </div>
              <CodeReference code={`int hasil = power * 2; // Nilai: ${vars.power * 2}`} />
            </TabsContent>

            {/* 3. ELEMEN KEPUTUSAN */}
            <TabsContent value="keputusan" className="space-y-4">
              <div className="space-y-4">
                <label className="text-sm font-medium">Logika Percabangan (Suhu: {vars.suhu}°C)</label>
                <Slider value={[vars.suhu]} max={60} onValueChange={(v) => setVars({...vars, suhu: v[0]})} />
                <Button className="w-full" onClick={() => {
                  const msg = vars.suhu > 35 ? "Kipas Aktif" : "Kipas Mati";
                  addLog(`KEPUTUSAN: ${msg}`);
                }}>Cek Kondisi</Button>
              </div>
              <CodeReference code={`if (suhu > 35) {\n  cout << "Kipas Aktif";\n} else {\n  cout << "Kipas Mati";\n}`} />
            </TabsContent>

            {/* 4. ELEMEN PERULANGAN */}
            <TabsContent value="perulangan" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm">Simulasi pengulangan perintah cetak sebanyak 3 kali.</p>
                <Button variant="secondary" className="w-full" onClick={() => {
                  for(let i=1; i<=3; i++) {
                    setTimeout(() => addLog(`Iterasi ke-${i}`), i * 300);
                  }
                }}>Jalankan Loop</Button>
              </div>
              <CodeReference code={`for (int i = 1; i <= 3; i++) {\n  cout << "Iterasi ke-" << i;\n}`} />
            </TabsContent>
          </Tabs>
        </div>

        {/* OUTPUT TERMINAL */}
        <div className="lg:col-span-5">
          <Card className="bg-zinc-950 border-zinc-800 text-zinc-300 h-full min-h-[450px]">
            <CardHeader className="border-b border-zinc-800 py-3">
              <CardTitle className="text-xs flex items-center gap-2 text-zinc-500 uppercase">
                <TerminalIcon size={14}/> Console Output
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-mono text-xs space-y-2">
              {logs.map((log, i) => (
                <div key={i} className={i === 0 ? "text-emerald-400" : "opacity-50"}>
                  <span className="text-zinc-700 mr-2">>>></span> {log}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
