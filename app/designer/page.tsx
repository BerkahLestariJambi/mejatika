// src/app/designer/page.tsx
'use client';

import React, { useCallback } from 'react';
import { 
  ReactFlow, 
  useNodesState, 
  useEdgesState, 
  Background, 
  Controls, 
  ReactFlowProvider, 
  useReactFlow 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import Komponen Modular
import StoryNode from '@/components/story-designer/StoryNode';
import AssetPanel from '@/components/story-designer/AssetPanel';
import SlideEditor from '@/components/story-designer/SlideEditor';
import Player from '@/components/story-designer/Player';

// Import Hook Kustom
import { useStory } from '@/hooks/useStory';

const nodeTypes = { storyNode: StoryNode };

function DesignerCore() {
  const { setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Menggunakan Hook useStory untuk manajemen state materi
  const {
    slides,
    setSlides,
    activeSlideIndex,
    setActiveSlideIndex,
    isPreviewMode,
    setIsPreviewMode,
    updateSlide,
    removeSlide
  } = useStory();

  // Fungsi untuk menjalankan/pindah slide
  const runSlide = useCallback((index: number) => {
    if (index < 0 || index >= slides.length) {
      setIsPreviewMode(false);
      setActiveSlideIndex(-1);
      // Reset highlight pada semua node
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, active: false } })));
      return;
    }

    setIsPreviewMode(true);
    setActiveSlideIndex(index);
    const slide = slides[index];
    const targetNode = nodes.find(n => n.id === slide.targetId);

    if (targetNode) {
      // Animasi kamera ke arah node target
      setCenter(targetNode.position.x, targetNode.position.y, { zoom: 1.8, duration: 800 });
      // Berikan efek 'active' hanya pada node yang dituju
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, active: n.id === targetNode.id }
      })));
    }
  }, [slides, nodes, setCenter, setIsPreviewMode, setActiveSlideIndex, setNodes]);

  // Logika Drag and Drop Aset
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('assetType');
    if (!type) return;

    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type: 'storyNode',
      position: { x: 400, y: 300 }, // Posisi default, bisa disesuaikan
      data: { 
        label: `ASET ${type.toUpperCase()}`, 
        type: type, 
        active: false 
      }
    };

    setNodes(nds => nds.concat(newNode));
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* SIDEBAR: Muncul hanya saat tidak dalam mode preview */}
      {!isPreviewMode && (
        <aside className="w-85 h-full bg-white border-r flex flex-col shadow-2xl z-50">
          <AssetPanel 
            slides={slides} 
            setSlides={setSlides} 
            nodes={nodes} 
            onStart={() => runSlide(0)} 
          />
          <div className="flex-grow overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">
              Detail Penjelasan
            </h3>
            <SlideEditor 
              slides={slides} 
              updateSlide={updateSlide} 
              removeSlide={removeSlide} 
              nodes={nodes} 
            />
          </div>
        </aside>
      )}

      {/* CANVAS AREA */}
      <main className="flex-grow relative h-full bg-white" onDrop={onDrop} onDragOver={e => e.preventDefault()}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView
          // Nonaktifkan interaksi saat preview agar user fokus pada narasi
          nodesDraggable={!isPreviewMode}
          nodesConnectable={!isPreviewMode}
          elementsSelectable={!isPreviewMode}
        >
          <Background color="#e2e8f0" gap={25} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>

        {/* WATERMARK SANPIO */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
          <h1 className="text-[22vw] font-black select-none tracking-tighter">SANPIO</h1>
        </div>

        {/* PLAYER UI: Muncul hanya saat mode preview */}
        {isPreviewMode && slides[activeSlideIndex] && (
          <Player 
            activeSlide={{ ...slides[activeSlideIndex], index: activeSlideIndex }}
            totalSlides={slides.length}
            onNext={() => runSlide(activeSlideIndex + 1)}
            onBack={() => runSlide(activeSlideIndex - 1)}
            onExit={() => runSlide(-1)}
          />
        )}
      </main>
    </div>
  );
}

export default function StoryDesignerPage() {
  return (
    <ReactFlowProvider>
      <DesignerCore />
    </ReactFlowProvider>
  );
}
