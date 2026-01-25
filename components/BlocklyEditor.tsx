"use client";
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

const registerMejatikaBlocks = () => {
  if (Blockly.Blocks['event_button_click']) return;

  Blockly.Blocks['event_button_click'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Saat Tombol ID:")
          .appendField(new Blockly.FieldTextInput("btn_1"), "ID")
          .appendField("diklik");
      this.appendStatementInput("DO").setCheck(null).appendField("lakukan");
      this.setColour(20);
    }
  };

  Blockly.Blocks['set_ui_text'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck(null).appendField("Atur Teks ID:");
      this.appendDummyInput().appendField(new Blockly.FieldTextInput("label_1"), "ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };
  
  // Generator tetap sama seperti sebelumnya...
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
            { kind: 'category', name: 'Events', colour: '20', contents: [{kind:'block', type:'event_button_click'}] },
            { kind: 'category', name: 'Aksi UI', colour: '230', contents: [{kind:'block', type:'set_ui_text'}] },
          ]
        },
        renderer: 'zelos', // Menggunakan Zelos agar blok lebih besar & mudah di-drag
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
        },
      });

      // Solusi "Susah Geser": Paksa resize saat div berubah ukuran
      const observer = new ResizeObserver(() => {
        if (workspace.current) {
          Blockly.svgResize(workspace.current);
        }
      });
      observer.observe(blocklyDiv.current);

      workspace.current.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace.current!);
        onCodeChange(code);
        const json = Blockly.serialization.workspaces.save(workspace.current!);
        onJsonChange(JSON.stringify(json));
      });
    }

    return () => workspace.current?.dispose();
  }, []);

  useEffect(() => {
    if (workspace.current && initialData) {
      try {
        const json = JSON.parse(initialData);
        workspace.current.clear();
        Blockly.serialization.workspaces.load(json, workspace.current);
        // Pastikan blok muncul di tengah layar
        setTimeout(() => workspace.current?.scrollCenter(), 50);
      } catch (e) {}
    }
  }, [initialData]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <div 
        ref={blocklyDiv} 
        className="absolute inset-0 w-full h-full" 
        style={{ touchAction: 'none' }} // Mencegah browser melakukan scroll saat kita menggeser blok
      />
    </div>
  );
}
