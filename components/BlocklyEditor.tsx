"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

const registerMejatikaBlocks = () => {
  if (Blockly.Blocks['event_button_click']) return;

  // --- 1. EVENT BLOCKS ---
  Blockly.Blocks['event_button_click'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Saat Tombol ID:")
          .appendField(new Blockly.FieldTextInput("btn_hitung"), "ID")
          .appendField("diklik");
      this.appendStatementInput("DO").setCheck(null).appendField("lakukan");
      this.setColour(20);
      this.setTooltip("Eksekusi perintah saat tombol di simulator diklik");
    }
  };

  // --- 2. UI ACTION BLOCKS ---
  Blockly.Blocks['set_ui_text'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck(null).appendField("Atur Teks Komponen ID:");
      this.appendDummyInput().appendField(new Blockly.FieldTextInput("label_hasil"), "ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };

  Blockly.Blocks['set_ui_color'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Ubah Warna BG ID:")
          .appendField(new Blockly.FieldTextInput("button_1"), "ID")
          .appendField("menjadi")
          .appendField(new Blockly.FieldColour("#4f46e5"), "COL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };

  // --- 3. DATA INPUT BLOCKS (Kunci Kalkulator Dinamis) ---
  Blockly.Blocks['get_ui_value'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Ambil angka dari ID:")
          .appendField(new Blockly.FieldTextInput("input_1"), "ID");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Mengambil nilai teks dari input dan mengubahnya menjadi angka");
    }
  };

  // --- GENERATORS ---
  javascriptGenerator.forBlock['event_button_click'] = function(block: any) {
    const id = block.getFieldValue('ID');
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    return `registerEvent('${id}', function() {\n${branch}});\n`;
  };

  javascriptGenerator.forBlock['set_ui_text'] = function(block: any) {
    const id = block.getFieldValue('ID');
    const val = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC) || "''";
    return `updateUI('${id}', { text: String(${val}) });\n`;
  };

  javascriptGenerator.forBlock['set_ui_color'] = function(block: any) {
    const id = block.getFieldValue('ID');
    const col = block.getFieldValue('COL');
    return `updateUI('${id}', { bgColor: '${col}' });\n`;
  };

  javascriptGenerator.forBlock['get_ui_value'] = function(block: any) {
    const id = block.getFieldValue('ID');
    // Fungsi getUIValue() harus ada di context eval page.tsx
    return [`Number(getUIValue('${id}'))`, javascriptGenerator.ORDER_ATOMIC];
  };
};

export default function BlocklyEditor({ onCodeChange, onJsonChange, initialData }: any) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && blocklyDiv.current && !workspace.current) {
      registerMejatikaBlocks();

      const toolbox = {
        kind: 'categoryToolbox',
        contents: [
          { kind: 'category', name: 'Events', colour: '20', contents: [{kind:'block', type:'event_button_click'}] },
          { kind: 'category', name: 'Aksi UI', colour: '230', contents: [
            {kind:'block', type:'set_ui_text'}, 
            {kind:'block', type:'set_ui_color'}
          ]},
          { kind: 'category', name: 'Input Data', colour: '160', contents: [{kind:'block', type:'get_ui_value'}] },
          { kind: 'sep' },
          { kind: 'category', name: 'Logika', colour: '210', contents: [
            {kind:'block', type:'controls_if'}, 
            {kind:'block', type:'logic_compare'}, 
            {kind:'block', type:'logic_boolean'}
          ]},
          { kind: 'category', name: 'Math', colour: '230', contents: [
            {kind:'block', type:'math_number'}, 
            {kind:'block', type:'math_arithmetic'}
          ]},
          { kind: 'category', name: 'Variabel', colour: '330', custom: 'VARIABLE' },
          { kind: 'category', name: 'Teks', colour: '160', contents: [{kind:'block', type:'text'}] },
        ]
      };

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        renderer: 'zelos',
        grid: { spacing: 25, length: 3, colour: '#f1f5f9', snap: true },
        zoom: { controls: true, wheel: true, startScale: 0.8 },
        move: { scrollbars: true, drag: true, wheel: true },
        trashcan: true
      });

      const handleResize = () => {
        if (workspace.current) Blockly.svgResize(workspace.current);
      };
      window.addEventListener('resize', handleResize);
      
      workspace.current.addChangeListener((e) => {
        if (!workspace.current || e.isUiEvent) return;
        const code = javascriptGenerator.workspaceToCode(workspace.current);
        onCodeChange(code);
        const json = Blockly.serialization.workspaces.save(workspace.current);
        onJsonChange(JSON.stringify(json));
      });

      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (workspace.current && initialData) {
      try {
        const json = JSON.parse(initialData);
        workspace.current.clear();
        Blockly.serialization.workspaces.load(json, workspace.current);
        setTimeout(() => workspace.current?.scrollCenter(), 100);
      } catch (e) { console.error("Error loading workspace:", e); }
    }
  }, [initialData]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <div 
        ref={blocklyDiv} 
        className="absolute inset-0 w-full h-full" 
        style={{ touchAction: 'none' }} 
      />
    </div>
  );
}
