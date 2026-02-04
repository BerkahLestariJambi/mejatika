// src/app/designer/page.tsx
'use client';

import React, { useCallback, useState, useEffect } from 'react';
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

import StoryNode from '@/components/story-designer/StoryNode';
import AssetPanel from '@/components/story-designer/AssetPanel';
import SlideEditor from '@/components/story-designer/SlideEditor';
import Player from '@/components/story-designer/Player';
import { useStory } from '@/hooks/useStory';

const nodeTypes = { storyNode: StoryNode };

function DesignerCore() {
  const { setCenter, fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [bgImage, setBgImage] = useState(''); // State untuk Background Film

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

  // Daftarkan fungsi ganti background agar bisa diakses AssetPanel
  useEffect(() => {
    (window as any).setBackground = setBgImage;
  }, []);

  const deleteSelectedElements = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    setNodes((nds) => nds.filter((node) => !node.selected));
    const deletedIds = selectedNodes.map(n => n.id);
    setSlides((prevSlides) => prevSlides.map(slide => 
      deletedIds.includes(slide.targetId) ? { ...slide, targetId: "" } : slide
    ));
  }, [nodes, setNodes, setSlides]);

  const runSlide = useCallback((index: number) => {
    if (index < 0 || index >= slides.length) {
      setIsPreviewMode(false);
      setActiveSlideIndex(-1);
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, active: false } })));
      setTimeout(() => fitView({ duration: 800 }), 100);
      return;
    }

    setIsPreviewMode(true);
    setActiveSlideIndex(index);
    const slide = slides[index];
    const targetNode = nodes.find(n => n.id === slide.targetId);

    if (targetNode) {
      // ZOOM CINEMATIC: Fokus ke karakter yang bicara
      setCenter(
        targetNode.position.x + 80, 
        targetNode.position.y + 80, 
        { zoom: 2.5, duration: 1500 }
      );
      
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, active: n.id === targetNode.id }
      })));
    }
  }, [slides, nodes, setCenter, setNodes, setIsPreviewMode, setActiveSlideIndex, fitView]);

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
    };
    setNodes(nds => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans">
      {/* SIDEBAR: Hilang saat Play agar murni jadi film */}
      {!isPreviewMode && (
        <aside className="w-85 h-full bg-white border-r flex flex-col shadow-2xl z-50">
          <AssetPanel 
            slides={slides} 
            setSlides={setSlides} 
            nodes={nodes} 
            onStart={() => runSlide(0)} 
            onAddImageNode={handleAddImageNode}
          />
        </aside>
      )}

      <main className="flex-grow relative h-full bg-black overflow-hidden">
        
        {/* LAYER BACKGROUND FILM */}
        {bgImage && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={bgImage} 
              className={`w-full h-full object-cover transition-all duration-1000 ${isPreviewMode ? 'scale-110 blur-0' : 'opacity-40 blur-sm'}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={!isPreviewMode}
          elementsSelectable={!isPreviewMode}
          panOnDrag={!isPreviewMode}
          zoomOnScroll={!isPreviewMode}
          selectionKeyCode={isPreviewMode ? null : "Shift"}
          deleteKeyCode={["Backspace", "Delete"]}
          style={{ background: 'transparent' }}
          fitView
        >
          {/* Grid hanya muncul saat mengedit */}
          {!isPreviewMode && <Background color="#444" gap={25} size={1} opacity={0.2} />}
          {!isPreviewMode && <Controls showInteractive={false} className="bg-white border-none shadow-xl" />}

          {!isPreviewMode && (
            <Panel position="top-right" className="flex gap-2">
              <button 
                onClick={deleteSelectedElements}
                className="p-3 bg-white/90 backdrop-blur text-red-500 rounded-2xl shadow-2xl hover:bg-red-50 transition-all flex items-center gap-2 font-black text-[10px]"
              >
                <Trash2 size={16} /> HAPUS OBJEK
              </button>
            </Panel>
          )}
        </ReactFlow>

        {/* WATERMARK SANPIO: Hanya muncul saat edit */}
        {!isPreviewMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
            <h1 className="text-[20vw] font-black select-none tracking-tighter">SANPIO</h1>
          </div>
        )}

        {/* PLAYER: Interface Film Kartun (Subtitle & Suara) */}
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
