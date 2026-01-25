"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

const registerMejatikaBlocks = () => {
  // 1. EVENT: Saat Tombol Diklik
  Blockly.Blocks['event_button_click'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Saat Tombol ID:")
          .appendField(new Blockly.FieldTextInput("button_1"), "ID")
          .appendField("diklik");
      this.appendStatementInput("DO").setCheck(null).appendField("lakukan");
      this.setColour(20);
    }
  };

  // 2. ACTION: Ubah Teks Komponen (Tipe Data & Variabel)
  Blockly.Blocks['set_ui_text'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck(null).appendField("Atur Teks Komponen ID:");
      this.appendDummyInput().appendField(new Blockly.FieldTextInput("label_1"), "ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };

  // 3. ACTION: Ubah Warna (Logika Keputusan)
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

  // GENERATORS
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
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents: [
            { kind: 'category', name: 'Kejadian (Event)', colour: '20', contents: [{kind:'block', type:'event_button_click'}] },
            { kind: 'category', name: 'Aksi UI', colour: '230', contents: [{kind:'block', type:'set_ui_text'}, {kind:'block', type:'set_ui_color'}] },
            { kind: 'category', name: 'Logika (IF)', colour: '210', contents: [{kind:'block', type:'controls_if'}, {kind:'block', type:'logic_compare'}, {kind:'block', type:'logic_boolean'}] },
            { kind: 'category', name: 'Perulangan', colour: '120', contents: [{kind:'block', type:'controls_repeat_ext'}] },
            { kind: 'category', name: 'Matematika', colour: '230', contents: [{kind:'block', type:'math_number'}, {kind:'block', type:'math_arithmetic'}] },
            { kind: 'category', name: 'Teks', colour: '160', contents: [{kind:'block', type:'text'}] },
            { kind: 'category', name: 'Variabel', colour: '330', custom: 'VARIABLE' },
          ]
        },
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true }
      });

      workspace.current.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace.current!);
        onCodeChange(code);
        onJsonChange(JSON.stringify(Blockly.serialization.workspaces.save(workspace.current!)));
      });
    }
  }, []);

  useEffect(() => {
    if (workspace.current && initialData) {
      try {
        const json = JSON.parse(initialData);
        workspace.current.clear();
        Blockly.serialization.workspaces.load(json, workspace.current);
      } catch (e) {}
    }
  }, [initialData]);

  return <div ref={blocklyDiv} className="w-full h-full" />;
}
