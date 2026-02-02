"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Variable, Zap, GitBranch, Repeat, Terminal as TerminalIcon, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function LogicLab() {
  const [logs, setLogs] = useState<string[]>(["Sistem Mejatika Siap..."]);
  const [vars, setVars] = useState({ nama: "Robot1", suhu: 25, power: 100 });

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-background text-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Laboratorium Pemrograman Prosedural</h1>
        <p className="text-muted-foreground text-sm">Implementasi Gambar 7.2 - Elemen Generik Pemrograman</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL KONTROL (Elemen Dasar) */}
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
                <label className="text-sm font-medium">Deklarasi & Inisialisasi Nama (String)</label>
                <div className="flex gap-2">
                  <Input 
                    value={vars.nama} 
                    onChange={(e) => setVars({...vars, nama: e.target.value})} 
                    placeholder="Contoh: Robot-01"
                  />
                  <Button onClick={() => addLog(`Variabel 'nama' diubah jadi: ${vars.nama}`)}>Simpan</Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded italic">
                C++: std::string nama = "{vars.nama}";
              </p>
            </TabsContent>

            {/* 2. ELEMEN EKSPRESI */}
            <TabsContent value="ekspresi" className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Operasi Aritmatika: Power x 2</label>
                <div className="flex items-center gap-4">
                  <Slider 
                    value={[vars.power]} 
                    max={200} 
                    onValueChange={(v) => setVars({...vars, power: v[0]})} 
                  />
                  <span className="font-mono w-12">{vars.power}</span>
                </div>
                <Button variant="outline" className="w-full" onClick={() => addLog(`Ekspresi: ${vars.power} * 2 = ${vars.power * 2}`)}>
                  Hitung Ekspresi (x2)
                </Button>
              </div>
            </TabsContent>

            {/* 3. ELEMEN KEPUTUSAN */}
            <TabsContent value="keputusan" className="space-y-4">
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/5 rounded">
                <p className="text-sm mb-4">Jika Suhu &gt; 35°C maka Aktifkan Pendingin.</p>
                <Slider 
                  value={[vars.suhu]} 
                  max={60} 
                  onValueChange={(v) => setVars({...vars, suhu: v[0]})} 
                  className="mb-4"
                />
                <Button 
                  className="w-full" 
                  onClick={() => {
                    const status = vars.suhu > 35 ? "AKTIF (PANAS!)" : "MATI (NORMAL)";
                    addLog(`IF (suhu > 35) : ${status}`);
                  }}
                >
                  Cek Logika IF (Suhu: {vars.suhu}°C)
                </Button>
              </div>
            </TabsContent>

            {/* 4. ELEMEN PERULANGAN */}
            <TabsContent value="perulangan" className="space-y-4">
              <p className="text-sm">Looping: Cetak pesan sebanyak 3 kali.</p>
              <Button variant="secondary" className="w-full" onClick={() => {
                for(let i=1; i<=3; i++) {
                  setTimeout(() => addLog(`FOR: Pengulangan ke-${i}`), i * 300);
                }
              }}>
                Jalankan for (i=1; i&lt;=3; i++)
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* OUTPUT TERMINAL (Visualisasi Logika) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-zinc-950 border-zinc-800 text-zinc-300 h-full min-h-[400px]">
            <CardHeader className="border-b border-zinc-800 py-3">
              <CardTitle className="text-xs flex items-center gap-2 text-zinc-500 uppercase">
                <TerminalIcon size={14}/> Terminal Mejatika Output
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-mono text-xs leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className={i === 0 ? "text-emerald-400" : "opacity-60"}>
                  <span className="text-zinc-600 mr-2">#</span> {log}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
