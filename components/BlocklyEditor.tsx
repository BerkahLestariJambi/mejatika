"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

interface BlocklyProps {
  onCodeChange: (code: string) => void;
  onJsonChange: (json: string) => void;
  initialData?: string; // Menampung JSON dari demo materi
}

export default function BlocklyEditor({ onCodeChange, onJsonChange, initialData }: BlocklyProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Tipe Data & Math',
        colour: '#4a90e2',
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'logic_boolean' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_single', fields: { OP: 'ROOT' } },
        ],
      },
      {
        kind: 'category',
        name: 'Variabel',
        colour: '#9b59b6',
        custom: 'VARIABLE',
      },
      {
        kind: 'category',
        name: 'Kontrol Keputusan',
        colour: '#f1c40f',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
        ],
      },
      {
        kind: 'category',
        name: 'Kontrol Perulangan',
        colour: '#2ecc71',
        contents: [
          { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: { block: { type: 'math_number', fields: { NUM: 10 } } } } },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_for' },
        ],
      },
      {
        kind: 'category',
        name: 'Input / Output',
        colour: '#e67e22',
        contents: [
          { kind: 'block', type: 'text_print' },
          { kind: 'block', type: 'text_prompt_ext' },
        ],
      },
    ]
  };

  // 1. Inisialisasi Workspace (Hanya sekali)
  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        trashcan: true,
        zoom: { controls: true, wheel: true, startScale: 1.0 }
      });

      workspace.current.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace.current!);
        const state = Blockly.serialization.workspaces.save(workspace.current!);
        onCodeChange(code);
        onJsonChange(JSON.stringify(state));
      });

      const handleResize = () => {
        if (workspace.current) Blockly.svgResize(workspace.current);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (workspace.current) workspace.current.dispose();
      };
    }
  }, []);

  // 2. Logic Auto-Load: Berjalan setiap kali menu materi diklik (initialData berubah)
  useEffect(() => {
    if (workspace.current && initialData) {
      try {
        const json = JSON.parse(initialData);
        // Hapus blok lama agar tidak bertumpuk
        workspace.current.clear(); 
        // Muat susunan blok baru ke workspace
        Blockly.serialization.workspaces.load(json, workspace.current);
      } catch (e) {
        console.error("Gagal memuat blok materi:", e);
      }
    }
  }, [initialData]);

  return <div ref={blocklyDiv} className="w-full h-full" />;
}
