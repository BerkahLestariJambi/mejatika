"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Registrasi Blok Kustom Mejatika
const registerMejatikaBlocks = () => {
  // Cegah error jika blok sudah terdaftar (HMR)
  if (Blockly.Blocks['event_button_click']) return;

  // 1. EVENT: Saat Tombol Diklik
  Blockly.Blocks['event_button_click'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Saat Tombol ID:")
          .appendField(new Blockly.FieldTextInput("btn_hitung"), "ID")
          .appendField("diklik");
      this.appendStatementInput("DO").setCheck(null).appendField("lakukan");
      this.setColour(20);
      this.setTooltip("Menjalankan perintah ketika tombol tertentu ditekan");
    }
  };

  // 2. ACTION: Ubah Teks Komponen
  Blockly.Blocks['set_ui_text'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck(null).appendField("Atur Teks Komponen ID:");
      this.appendDummyInput().appendField(new Blockly.FieldTextInput("label_hasil"), "ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };

  // 3. ACTION: Ubah Warna
  Blockly.Blocks['set_ui_color'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Ubah Warna BG ID:")
          .appendField(new Blockly.FieldTextInput("button_1"), "ID")
          .appendField("menjadi")
          .appendField(new Blockly.FieldColour("#ff0000"), "COL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };

  // --- GENERATORS (Blok ke JavaScript) ---
  javascriptGenerator.forBlock['event_button_click'] = function(block) {
    const id = block.getFieldValue('ID');
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    return `registerEvent('${id}', function() {\n${branch}});\n`;
  };

  javascriptGenerator.forBlock['set_ui_text'] = function(block) {
    const id = block.getFieldValue('ID');
    const val = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC) || "''";
    return `updateUI('${id}', { text: ${val} });\n`;
  };

  javascriptGenerator.forBlock['set_ui_color'] = function(block) {
    const id = block.getFieldValue('ID');
    const col = block.getFieldValue('COL');
    return `updateUI('${id}', { bgColor: '${col}' });\n`;
  };
};

export default function BlocklyEditor({ onCodeChange, onJsonChange, initialData }: any) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      registerMejatikaBlocks();

      // Konfigurasi Toolbox
      const toolbox = {
        kind: 'categoryToolbox',
        contents: [
          { kind: 'category', name: 'Events', colour: '20', contents: [{kind:'block', type:'event_button_click'}] },
          { kind: 'category', name: 'Aksi UI', colour: '230', contents: [{kind:'block', type:'set_ui_text'}, {kind:'block', type:'set_ui_color'}] },
          { kind: 'sep' },
          { kind: 'category', name: 'Logika', colour: '210', contents: [{kind:'block', type:'controls_if'}, {kind:'block', type:'logic_compare'}, {kind:'block', type:'logic_boolean'}] },
          { kind: 'category', name: 'Matematika', colour: '230', contents: [{kind:'block', type:'math_number'}, {kind:'block', type:'math_arithmetic'}] },
          { kind: 'category', name: 'Teks', colour: '160', contents: [{kind:'block', type:'text'}] },
          { kind: 'category', name: 'Variabel', colour: '330', custom: 'VARIABLE' },
        ]
      };

      // Injeksi Blockly dengan konfigurasi "Mulus"
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        renderer: 'zelos', // Gaya modern, area klik lebih luas
        grid: { spacing: 25, length: 3, colour: '#f1f5f9', snap: true },
        zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3 },
        move: {
          scrollbars: { horizontal: true, vertical: true },
          drag: true,
          wheel: true
        },
        trashcan: true
      });

      // Listener perubahan
      workspace.current.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_MOVE || 
            event.type === Blockly.Events.BLOCK_CHANGE || 
            event.type === Blockly.Events.BLOCK_DELETE) {
          
          const code = javascriptGenerator.workspaceToCode(workspace.current!);
          onCodeChange(code);
          
          const json = Blockly.serialization.workspaces.save(workspace.current!);
          onJsonChange(JSON.stringify(json));
        }
      });
    }

    // Resize handler
    const handleResize = () => Blockly.svgResize(workspace.current!);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data awal (Materi)
  useEffect(() => {
    if (workspace.current && initialData) {
      try {
        const json = JSON.parse(initialData);
        // Jika data dari DEMO_SAMPLES berbentuk {blocks: {...}}, ambil isi blocks-nya
        const dataToLoad = json.blocks ? json.blocks : json;
        
        Blockly.serialization.workspaces.load(dataToLoad, workspace.current);
      } catch (e) {
        console.error("Gagal load workspace:", e);
      }
    }
  }, [initialData]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div 
        ref={blocklyDiv} 
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }} // Penting: Mencegah scroll browser saat geser blok
      />
    </div>
  );
}
