"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info } from 'lucide-react';

export default function TheoryCard() {
  const theories = [
    { tag: "Variabel", desc: "Wadah penyimpanan data di memori (int, string, bool)." },
    { tag: "Ekspresi", desc: "Kombinasi nilai dan operator untuk menghasilkan nilai baru." },
    { tag: "Keputusan", desc: "Percabangan logika menggunakan IF-ELSE." },
    { tag: "Perulangan", desc: "Eksekusi kode berulang menggunakan FOR atau WHILE." }
  ];

  return (
    <Card className="border-blue-900/50 bg-blue-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider">
          <BookOpen size={16} /> Ringkasan Materi X-2
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {theories.map((t, i) => (
            <div key={i} className="p-2 bg-zinc-900/50 rounded border border-zinc-800">
              <p className="text-[10px] font-bold text-blue-500 mb-1">{t.tag}</p>
              <p className="text-[11px] text-zinc-400 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-[10px] text-zinc-500 italic border-t border-zinc-800 pt-3">
          <Info size={12} className="shrink-0" />
          <span>Sesuai dengan Dokumen Kemendikbud 2021 tentang Elemen Generik Pemrograman Prosedural.</span>
        </div>
      </CardContent>
    </Card>
  );
}
