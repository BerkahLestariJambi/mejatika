"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Play } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LogicGrader({ currentVars }: { currentVars: any }) {
  const [done, setDone] = useState<number[]>([]);
  const missions = [
    { id: 1, title: "Suhu Overheat", goal: "Set suhu > 35", check: () => currentVars.suhu > 35 },
    { id: 2, title: "Rename Robot", goal: "Nama: 'Mejatika-Bot'", check: () => currentVars.nama === "Mejatika-Bot" }
  ];

  const verify = (m: any) => {
    if (m.check()) {
      if (!done.includes(m.id)) {
        setDone([...done, m.id]);
        Swal.fire({ title: 'Mantap!', text: 'Misi Selesai', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } else {
      Swal.fire('Belum Selesai', m.goal, 'warning');
    }
  };

  return (
    <Card className="border-zinc-800 bg-card">
      <CardHeader className="py-3 border-b border-zinc-800">
        <CardTitle className="text-xs font-bold flex gap-2"><Trophy size={14} className="text-yellow-500"/> MISI PRAKTIKUM</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {missions.map(m => (
          <div key={m.id} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-300">{m.title}</span>
              <span className="text-[9px] text-zinc-500">{m.goal}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => verify(m)}>
              {done.includes(m.id) ? <CheckCircle2 className="text-emerald-500" size={16}/> : <Play size={10}/>}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
