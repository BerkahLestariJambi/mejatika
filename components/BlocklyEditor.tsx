"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

const registerCustomBlocks = () => {
  // Blok Input Field
  Blockly.Blocks['gui_input'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Buat Input")
          .appendField(new Blockly.FieldTextInput("Placeholder..."), "HINT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(190);
    }
  };

  // Blok Image
  Blockly.Blocks['gui_image'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Buat Gambar (URL)")
          .appendField(new Blockly.FieldTextInput("https://via.placeholder.com/150"), "URL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
    }
  };

  // Generator JavaScript
  javascriptGenerator.forBlock['gui_input'] = function(block) {
    const hint = block.getFieldValue('HINT');
    return `renderElement('input', { placeholder: '${hint}' });\n`;
  };

  javascriptGenerator.forBlock['gui_image'] = function(block) {
    const url = block.getFieldValue('URL');
    return `renderElement('image', { url: '${url}' });\n`;
  };

  // Re-use generator label & button dari kode sebelumnya...
  javascriptGenerator.forBlock['gui_label'] = function(block) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || "''";
    const color = block.getFieldValue('COLOR');
    return `renderElement('label', { text: ${text}, color: '${color}' });\n`;
  };

  javascriptGenerator.forBlock['gui_button'] = function(block) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || "''";
    const bgColor = block.getFieldValue('BG_COLOR');
    return `renderElement('button', { text: ${text}, bgColor: '${bgColor}' });\n`;
  };
};

export default function BlocklyEditor({ onCodeChange, onJsonChange, initialData }: any) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      registerCustomBlocks();
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents: [
            { 
              kind: 'category', 
              name: 'Palet Desain', 
              colour: '#e91e63', 
              contents: [
                { kind: 'block', type: 'gui_label' },
                { kind: 'block', type: 'gui_button' },
                { kind: 'block', type: 'gui_input' },
                { kind: 'block', type: 'gui_image' },
              ] 
            },
            { kind: 'category', name: 'Logika', colour: '#4a90e2', contents: [{kind:'block', type:'text'}] },
          ]
        },
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
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
