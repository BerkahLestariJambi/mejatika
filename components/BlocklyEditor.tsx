"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// ... (kode registrasi blok kustom Anda tetap sama)

export default function BlocklyEditor({ onCodeChange, onJsonChange, initialData }: any) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      registerMejatikaBlocks();

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: { /* konfigurasi toolbox Anda */ },
        renderer: 'zelos',
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true, startScale: 1.0 },
        move: { scrollbars: true, drag: true, wheel: true }
      });

      // PENTING: Menghindari blok hilang saat resize atau pindah tab
      const observer = new ResizeObserver(() => {
        if (workspace.current) {
          Blockly.svgResize(workspace.current);
        }
      });
      observer.observe(blocklyDiv.current);

      workspace.current.addChangeListener((e) => {
        if (e.isUiEvent) return;
        const code = javascriptGenerator.workspaceToCode(workspace.current!);
        onCodeChange(code);
        const json = Blockly.serialization.workspaces.save(workspace.current!);
        onJsonChange(JSON.stringify(json));
      });
    }
  }, []);

  // Sync data saat pindah tab atau load materi
  useEffect(() => {
    if (workspace.current && initialData) {
      try {
        const json = JSON.parse(initialData);
        // Gunakan try-catch dan clear sebelum load
        workspace.current.clear();
        Blockly.serialization.workspaces.load(json, workspace.current);
        // Taruh blok di tengah area pandang jika tidak terlihat
        workspace.current.scrollCenter(); 
      } catch (e) {
        console.error("Gagal sinkronisasi blok:", e);
      }
    }
  }, [initialData]);

  return (
    <div className="w-full h-full relative border-none">
      <div ref={blocklyDiv} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
