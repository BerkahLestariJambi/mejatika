"use client"
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Import bahasa Indonesia (opsional, agar blok lebih mudah dimengerti siswa)
import * as Id from 'blockly/msg/id';

interface BlocklyProps {
  onCodeChange: (code: string) => void;
  onJsonChange: (json: string) => void;
}

export default function BlocklyEditor({ onCodeChange, onJsonChange }: BlocklyProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  // Definisi Toolbox yang lebih lengkap untuk Algoritma Dasar
  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      { 
        kind: 'category', 
        name: 'Logika', 
        colour: '#f1c40f', 
        contents: [
          { kind: 'block', type: 'controls_if' }, 
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_boolean' }
        ] 
      },
      { 
        kind: 'category', 
        name: 'Perulangan', 
        colour: '#2ecc71', 
        contents: [
          { kind: 'block', type: 'controls_repeat_ext' },
          { kind: 'block', type: 'controls_whileUntil' }
        ] 
      },
      { 
        kind: 'category', 
        name: 'Matematika', 
        colour: '#3498db', 
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' }
        ] 
      },
      { 
        kind: 'category', 
        name: 'Teks', 
        colour: '#e67e22', 
        contents: [
          { kind: 'block', type: 'text' }, 
          { kind: 'block', type: 'text_print' }
        ] 
      },
      { kind: 'sep' }, // Garis pemisah
      { 
        kind: 'category', 
        name: 'Variabel', 
        colour: '#9b59b6', 
        custom: 'VARIABLE' 
      },
    ]
  };

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      // Set pesan ke Bahasa Indonesia
      Blockly.setLocale(Id);

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        trashcan: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        move: {
          scrollbars: true,
          drag: true,
          wheel: false,
        },
      });

      // Listener untuk perubahan kode
      workspace.current.addChangeListener((event) => {
        // Abaikan event UI (seperti klik/zoom) agar tidak berat
        if (event.type === Blockly.Events.BLOCK_MOVE || 
            event.type === Blockly.Events.BLOCK_CHANGE || 
            event.type === Blockly.Events.BLOCK_DELETE || 
            event.type === Blockly.Events.VAR_CREATE) {
          
          const code = javascriptGenerator.workspaceToCode(workspace.current!);
          const state = Blockly.serialization.workspaces.save(workspace.current!);
          const json = JSON.stringify(state);
          
          onCodeChange(code);
          onJsonChange(json);
        }
      });

      // Handler agar ukuran workspace otomatis menyesuaikan layar
      const handleResize = () => {
        if (workspace.current) {
          Blockly.svgResize(workspace.current);
        }
      };
      window.addEventListener('resize', handleResize);

      // Cleanup saat komponen dilepas (unmount)
      return () => {
        window.removeEventListener('resize', handleResize);
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
        }
      };
    }
  }, []);

  return (
    <div className="w-full h-full relative group">
      {/* Container utama Blockly */}
      <div 
        ref={blocklyDiv} 
        className="absolute inset-0 border-none shadow-inner bg-slate-50"
      />
      
      {/* Label kecil di pojok sebagai watermark */}
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-300 font-bold pointer-events-none uppercase tracking-tighter">
        Mejatika Engine v1.0
      </div>
    </div>
  );
}
