"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Star, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Mission {
  id: number;
  title: string;
  description: string;
  check: () => boolean;
}

export default function LogicGrader({ currentVars }: { currentVars: any }) {
  const [completed, setCompleted] = useState<number[]>([]);

  const missions: Mission[] = [
    {
      id: 1,
      title: "Misi 1: Overheat!",
      description: "Atur variabel suhu di Lab hingga di atas 35 derajat.",
      check: () => currentVars.suhu > 35
    },
    {
      id: 2,
      title: "Misi 2: Identitas Robot",
      description: "Ganti nama variabel robot menjadi 'Mejatika-Bot'.",
      check: () => currentVars.nama === "Mejatika-Bot"
    }
  ];

  const verifyMission = (mission: Mission) => {
    if (mission.check()) {
      if (!completed.includes(mission.id)) {
        setCompleted([...completed, mission.id]);
        Swal.fire({
          title: 'Berhasil!',
          text: `Selamat, kamu menyelesaikan ${mission.title}`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } else {
      Swal.fire('Belum Tepat', mission.description, 'info');
    }
  };

  return (
    <Card className="bg-card border-zinc-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Trophy className="text-yellow-500" size={18} /> Tantangan Lab
        </CardTitle>
        <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded">
          {completed.length}/{missions.length} Selesai
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.map((m) => (
          <div key={m.id} className="p-3 border rounded-lg bg-zinc-900/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${completed.includes(m.id) ? 'text-emerald-500' : 'text-zinc-400'}`}>
                {m.title}
              </span>
              <span className="text-[10px] text-zinc-500">{m.description}</span>
            </div>
            <Button 
              size="sm" 
              variant={completed.includes(m.id) ? "ghost" : "outline"}
              onClick={() => verifyMission(m)}
            >
              {completed.includes(m.id) ? <CheckCircle2 className="text-emerald-500" /> : <Play size={12} />}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
