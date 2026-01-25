"use client"
import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

interface BlocklyProps {
  onCodeChange: (code: string) => void;
  onJsonChange: (json: string) => void;
}

export default function BlocklyEditor({ onCodeChange, onJsonChange }: BlocklyProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: 'Logika', colour: '210', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'logic_compare' }] },
      { kind: 'category', name: 'Perulangan', colour: '120', contents: [{ kind: 'block', type: 'controls_repeat_ext' }] },
      { kind: 'category', name: 'Teks', colour: '160', contents: [{ kind: 'block', type: 'text' }, { kind: 'block', type: 'text_print' }] },
      { kind: 'category', name: 'Variabel', colour: '330', custom: 'VARIABLE' },
    ]
  };

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        trashcan: true,
      });

      workspace.current.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace.current!);
        const json = JSON.stringify(Blockly.serialization.workspaces.save(workspace.current!));
        onCodeChange(code);
        onJsonChange(json);
      });
    }
  }, []);

  return <div ref={blocklyDiv} className="w-full h-full border-none shadow-inner" />;
}
