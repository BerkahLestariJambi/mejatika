"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Blok Logika untuk mengontrol Komponen GUI
const registerLogicBlocks = () => {
  Blockly.Blocks['set_component_text'] = {
    init: function() {
      this.appendValueInput("TEXT").setCheck("String").appendField("Atur Teks Komponen");
      this.appendDummyInput().appendField("ID:").appendField(new Blockly.FieldTextInput("button1"), "ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };

  javascriptGenerator.forBlock['set_component_text'] = function(block) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || "''";
    const id = block.getFieldValue('ID');
    return `updateComponent('${id}', { text: ${text} });\n`;
  };
};

export default function BlocklyEditor({ onCodeChange, onJsonChange, initialData }: any) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      registerLogicBlocks();
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents: [
            { kind: 'category', name: 'Aksi Komponen', colour: '#2563eb', contents: [{kind:'block', type:'set_component_text'}] },
            { kind: 'category', name: 'Logika', colour: '#4a90e2', contents: [{kind:'block', type:'controls_if'}, {kind:'block', type:'logic_compare'}] },
            { kind: 'category', name: 'Teks', colour: '#9b59b6', contents: [{kind:'block', type:'text'}] },
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
