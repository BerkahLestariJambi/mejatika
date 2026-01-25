"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Fungsi registrasi blok dibuat di luar agar tidak duplikat saat refresh
const registerMejatikaBlocks = () => {
  if (Blockly.Blocks['event_button_click']) return; // Cegah registrasi ulang

  Blockly.Blocks['event_button_click'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Saat Tombol ID:")
          .appendField(new Blockly.FieldTextInput("btn_hitung"), "ID")
          .appendField("diklik");
      this.appendStatementInput("DO").setCheck(null).appendField("lakukan");
      this.setColour(20);
    }
  };

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
          .appendField(new Blockly.FieldColour("#ff0000"), "COL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };

  // Generators
  javascriptGenerator.forBlock['event_button_click'] = function(block: any) {
    const id = block.getFieldValue('ID');
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    return `registerEvent('${id}', function() {\n${branch}});\n`;
  };

  javascriptGenerator.forBlock['set_ui_text'] = function(block: any) {
    const id = block.getFieldValue('ID');
    const val = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC) || "''";
    return `updateUI('${id}', { text: ${val} });\n`;
  };

  javascriptGenerator.forBlock['set_ui_color'] = function(block: any) {
    const id = block.getFieldValue('ID');
    const col = block.getFieldValue('COL');
    return `updateUI('${id}', { bgColor: '${col}' });\n`;
  };
};

export default function BlocklyEditor({ onCodeChange, onJsonChange, initialData }: any) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && blocklyDiv.current && !workspace.current) {
      registerMejatikaBlocks();

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents: [
            { kind: 'category', name: 'Events', colour: '20', contents: [{kind:'block', type:'event_button_click'}] },
            { kind: 'category', name: 'Aksi UI', colour: '230', contents: [{kind:'block', type:'set_ui_text'}, {kind:'block', type:'set_ui_color'}] },
            { kind: 'sep' },
            { kind: 'category', name: 'Logika', colour: '210', contents: [{kind:'block', type:'controls_if'}, {kind:'block', type:'logic_compare'}] },
            { kind: 'category', name: 'Matematika', colour: '230', contents: [{kind:'block', type:'math_number'}, {kind:'block', type:'math_arithmetic'}] },
          ]
        },
        renderer: 'zelos',
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        move: { scrollbars: true, drag: true, wheel: true }
      });

      workspace.current.addChangeListener(() => {
        if (!workspace.current) return;
        const code = javascriptGenerator.workspaceToCode(workspace.current);
        onCodeChange(code);
        const json = Blockly.serialization.workspaces.save(workspace.current);
        onJsonChange(JSON.stringify(json));
      });
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, []);

  // Memuat data awal dengan aman
  useEffect(() => {
    if (workspace.current && initialData) {
      try {
        const json = JSON.parse(initialData);
        // Cek jika JSON memiliki properti blocks (format baru) atau langsung (format lama)
        const cleanJson = json.blocks ? json : { blocks: json };
        Blockly.serialization.workspaces.load(cleanJson, workspace.current);
      } catch (e) {
        console.error("Gagal memuat blok:", e);
      }
    }
  }, [initialData]);

  return <div ref={blocklyDiv} className="w-full h-full min-h-[500px]" />;
}
