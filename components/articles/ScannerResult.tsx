"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface ScannerProps {
  aiScore: number;
  plagiarizedScore: number;
}

export function ScannerResult({ aiScore, plagiarizedScore }: ScannerProps) {
  // Data untuk Grafik AI
  const dataAI = [
    { name: 'AI', value: aiScore },
    { name: 'Human', value: 100 - aiScore },
  ];

  // Data untuk Grafik Plagiat
  const dataPlag = [
    { name: 'Plagiarized', value: plagiarizedScore },
    { name: 'Original', value: 100 - plagiarizedScore },
  ];

  const COLORS_AI = ['#f59e0b', '#f4f4f5']; // Amber (AI) & Zinc (Latar)
  const COLORS_PLAG = ['#ef4444', '#f4f4f5']; // Red (Plagiat) & Zinc (Latar)

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-inner">
      
      {/* KOTAK AI */}
      <div className="flex flex-col items-center">
        <div className="h-28 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataAI}
                innerRadius={30}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                <Cell fill={COLORS_AI[0]} stroke="none" />
                <Cell fill={COLORS_AI[1]} stroke="none" />
                <Label 
                  value={`${aiScore}%`} 
                  position="center" 
                  className="font-black text-xs fill-zinc-800 dark:fill-white" 
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">AI DETECTED</p>
      </div>

      {/* KOTAK PLAGIAT */}
      <div className="flex flex-col items-center border-l border-zinc-50 dark:border-zinc-800">
        <div className="h-28 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataPlag}
                innerRadius={30}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                <Cell fill={COLORS_PLAG[0]} stroke="none" />
                <Cell fill={COLORS_PLAG[1]} stroke="none" />
                <Label 
                  value={`${plagiarizedScore}%`} 
                  position="center" 
                  className="font-black text-xs fill-zinc-800 dark:fill-white" 
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">PLAGIARISM</p>
      </div>

    </div>
  );
}
