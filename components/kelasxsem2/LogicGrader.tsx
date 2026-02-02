"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Play, Star } from 'lucide-react';
import Swal from 'sweetalert2';

interface Mission {
  id: number;
  title: string;
  goal: string;
  check: () => boolean;
  hint: string;
}

export default function LogicGrader({ currentVars }: { currentVars: any }) {
  const [done, setDone] = useState<number[]>([]);

  // Daftar Misi berdasarkan Elemen Generik (Variabel, Ekspresi, Keputusan)
  const missions: Mission[] = [
    { 
      id: 1, 
      title: "1. Elemen Keputusan", 
      goal: "Set suhu > 35°C", 
      check: () => currentVars.suhu > 35,
      hint: "Geser slider suhu pada tab 'Keputusan' hingga melewati angka 35."
    },
    { 
      id: 2, 
      title: "2. Elemen Variabel", 
      goal: "Nama: 'Mejatika-Bot'", 
      check: () => currentVars.nama === "Mejatika-Bot",
      hint: "Ketik 'Mejatika-Bot' (perhatikan besar kecil huruf) pada tab 'Variabel' dan klik Update."
    },
    { 
      id: 3, 
      title: "3. Elemen Ekspresi & Keputusan", 
      goal: "Power x 2 > 150", 
      check: () => (currentVars.power * 2) > 150,
      hint: "Geser slider power pada tab 'Ekspresi' hingga hasil perkaliannya di terminal melebihi 150."
    }
  ];

  const verify = (m: Mission) => {
    if (m.check()) {
      if (!done.includes(m.id)) {
        setDone([...done, m.id]);
        Swal.fire({ 
          title: 'Mantap!', 
          text: `Kamu berhasil menyelesaikan ${m.title}`, 
          icon: 'success', 
          timer: 2000, 
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        Swal.fire({
          title: 'Sudah Selesai',
          text: 'Misi ini sudah kamu taklukkan!',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } else {
      Swal.fire({
        title: 'Belum Tepat',
        html: `<div className="text-sm">${m.hint}</div>`,
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  return (
    <Card className="border-zinc-800 bg-card shadow-lg">
      <CardHeader className="py-3 border-b border-zinc-800 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold flex gap-2 items-center">
          <Trophy size={14} className="text-yellow-500"/> 
          MISI PRAKTIKUM
        </CardTitle>
        <div className="flex gap-1">
          {missions.map((_, i) => (
            <Star 
              key={i} 
              size={10} 
              className={done.includes(i + 1) ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"} 
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {missions.map(m => (
          <div 
            key={m.id} 
            className={`flex items-center justify-between p-2 rounded border transition-colors ${
              done.includes(m.id) 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className={`text-[10px] font-bold ${done.includes(m.id) ? 'text-emerald-400' : 'text-zinc-300'}`}>
                {m.title}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono italic">{m.goal}</span>
            </div>
            <Button 
              size="sm" 
              variant={done.includes(m.id) ? "ghost" : "outline"} 
              className={done.includes(m.id) ? "hover:bg-transparent" : "h-7 px-2"}
              onClick={() => verify(m)}
            >
              {done.includes(m.id) ? (
                <CheckCircle2 className="text-emerald-500" size={16}/>
              ) : (
                <Play size={10} className="fill-current text-blue-500"/>
              )}
            </Button>
          </div>
        ))}

        {done.length === missions.length && (
          <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-center">
            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
              🏆 Semua Elemen Dikuasai!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
