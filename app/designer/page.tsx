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
  useReactFlow,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Trash2, Info } from 'lucide-react';

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

  // --- FUNGSI HAPUS OBJEK TERPILIH ---
  const deleteSelectedElements = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    
    if (selectedNodes.length === 0) {
      alert("Pilih objek di kanvas terlebih dahulu untuk menghapus!");
      return;
    }

    // Hapus node dari state
    setNodes((nds) => nds.filter((node) => !node.selected));
    
    // Opsional: Hapus slide yang targetId-nya adalah node yang dihapus
    const deletedIds = selectedNodes.map(n => n.id);
    setSlides((prevSlides) => prevSlides.map(slide => 
      deletedIds.includes(slide.targetId) ? { ...slide, targetId: "" } : slide
    ));
  }, [nodes, setNodes, setSlides]);

// Edit bagian fungsi runSlide di page.tsx
const runSlide = useCallback((index: number) => {
  if (index < 0 || index >= slides.length) {
    setIsPreviewMode(false);
    setActiveSlideIndex(-1);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, active: false } })));
    return;
  }

  setIsPreviewMode(true);
  setActiveSlideIndex(index);
  const slide = slides[index];
  const targetNode = nodes.find(n => n.id === slide.targetId);

  if (targetNode) {
    // Efek Kamera: Zoom in ke aktor (objek) yang sedang "berbicara" atau dibahas
    setCenter(
      targetNode.position.x + (targetNode.measured?.width || 100) / 2, 
      targetNode.position.y + (targetNode.measured?.height || 100) / 2, 
      { zoom: 2.2, duration: 1200 } // Durasi lebih lambat agar terasa smooth seperti film
    );
    
    // Berikan status 'active' untuk memicu animasi CSS di StoryNode.tsx
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, active: n.id === targetNode.id }
    })));
  }
}, [slides, nodes, setCenter, setNodes]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('assetType');
    if (!type) return;

    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type: 'storyNode',
      position: { x: 400, y: 300 },
      data: { 
        label: `ASET ${type.toUpperCase()}`, 
        type: type, 
        active: false 
      },
    };
    setNodes(nds => nds.concat(newNode));
  };

  const handleAddImageNode = useCallback((imageUrl: string, imageName: string) => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type: 'storyNode',
      position: { x: 400, y: 300 },
      data: {
        label: imageName.toUpperCase(),
        type: 'image',
        imageUrl: imageUrl,
        active: false,
      },
      style: { width: 150, height: 150 } 
    };
    setNodes(nds => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {!isPreviewMode && (
        <aside className="w-85 h-full bg-white border-r flex flex-col shadow-2xl z-50">
          <AssetPanel 
            slides={slides} 
            setSlides={setSlides} 
            nodes={nodes} 
            onStart={() => runSlide(0)} 
            onAddImageNode={handleAddImageNode}
          />
          <div className="flex-grow overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex justify-between items-center">
              Detail Penjelasan
              <div className="group relative cursor-help">
                <Info size={12} />
                <div className="hidden group-hover:block absolute right-0 top-5 bg-slate-800 text-white p-2 rounded text-[8px] w-32 normal-case font-normal z-50">
                  Klik objek di kanvas lalu tekan 'Del' atau tombol sampah untuk menghapus.
                </div>
              </div>
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

      <main className="flex-grow relative h-full bg-white" onDrop={onDrop} onDragOver={e => e.preventDefault()}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={!isPreviewMode}
          // Izinkan penghapusan dengan keyboard (Backspace/Delete)
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background color="#e2e8f0" gap={25} size={1} />
          <Controls showInteractive={false} />

          {/* TOMBOL HAPUS CEPAT (Hanya muncul saat bukan preview) */}
          {!isPreviewMode && (
            <Panel position="top-right" className="flex gap-2">
              <button 
                onClick={deleteSelectedElements}
                title="Hapus objek terpilih"
                className="p-3 bg-white border-2 border-slate-100 rounded-xl text-red-500 shadow-lg hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-2 font-black text-[10px]"
              >
                <Trash2 size={16} /> HAPUS OBJEK
              </button>
            </Panel>
          )}
        </ReactFlow>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
          <h1 className="text-[22vw] font-black select-none tracking-tighter">SANPIO</h1>
        </div>

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
