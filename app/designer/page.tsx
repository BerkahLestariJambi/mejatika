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
import { Trash2 } from 'lucide-react';

import StoryNode from '@/components/story-designer/StoryNode';
import BoardNode from '@/components/story-designer/BoardNode'; // Komponen Baru
import AssetPanel from '@/components/story-designer/AssetPanel';
import SlideEditor from '@/components/story-designer/SlideEditor';
import Player from '@/components/story-designer/Player';
import { useStory } from '@/hooks/useStory';

// Daftarkan dua tipe node: Karakter (storyNode) dan Papan Tulis (boardNode)
const nodeTypes = { 
  storyNode: StoryNode,
  boardNode: BoardNode 
};

function DesignerCore() {
  const { setCenter, fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [bgImage, setBgImage] = useState('');

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

  // Daftarkan fungsi ganti background ke window agar bisa diakses AssetPanel
  useEffect(() => {
    (window as any).setBackground = setBgImage;
  }, []);

  // FITUR: Update Koordinat Mulut per Node Karakter
  const updateMouthPosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, mouthX: x, mouthY: y } } 
          : node
      )
    );
  }, [setNodes]);

  // FITUR: Tambah Papan Tulis (Board)
  const handleAddBoard = useCallback(() => {
    const id = `board_${Date.now()}`;
    const newNode = {
      id,
      type: 'boardNode',
      position: { x: 200, y: 200 },
      data: { 
        label: 'PAPAN MATERI', 
        content: 'Tulis isi materi di sini...', 
        active: false 
      },
    };
    setNodes(nds => nds.concat(newNode));
  }, [setNodes]);

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
      // Zoom ke arah node (baik itu Karakter atau Papan Tulis)
      setCenter(
        targetNode.position.x + 80, 
        targetNode.position.y + 80, 
        { zoom: 2.2, duration: 1500 }
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
        mouthX: 50,
        mouthY: 62,
        onUpdateMouth: (x: number, y: number) => updateMouthPosition(id, x, y)
      },
    };
    setNodes(nds => nds.concat(newNode));
  }, [setNodes, updateMouthPosition]);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans text-slate-900">
      {!isPreviewMode && (
        <aside className="w-85 h-full bg-white border-r flex flex-col shadow-2xl z-50">
          <AssetPanel 
            slides={slides} 
            setSlides={setSlides} 
            nodes={nodes} 
            onStart={() => runSlide(0)} 
            onAddImageNode={handleAddImageNode}
            onAddBoard={handleAddBoard} // Kirim fungsi tambah papan ke sidebar
          />
        </aside>
      )}

      <main className="flex-grow relative h-full bg-black overflow-hidden">
        {/* BACKGROUND LAYER */}
        {bgImage && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={bgImage} 
              className={`w-full h-full object-cover transition-all duration-1000 ${isPreviewMode ? 'scale-110 blur-0' : 'opacity-40 blur-sm'}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
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
          deleteKeyCode={["Backspace", "Delete"]}
          style={{ background: 'transparent' }}
          fitView
        >
          {!isPreviewMode && <Background color="#555" gap={25} size={1} opacity={0.2} />}
          {!isPreviewMode && <Controls showInteractive={false} className="bg-white border-none shadow-xl" />}

          {!isPreviewMode && (
            <Panel position="top-right" className="flex gap-2">
              <button 
                onClick={deleteSelectedElements}
                className="p-3 bg-white/90 backdrop-blur text-red-600 rounded-2xl shadow-2xl hover:bg-red-50 transition-all flex items-center gap-2 font-black text-[10px] border border-red-100"
              >
                <Trash2 size={16} /> HAPUS OBJEK
              </button>
            </Panel>
          )}
        </ReactFlow>

        {/* WATERMARK SANPIO */}
        {!isPreviewMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
            <h1 className="text-[20vw] font-black select-none tracking-tighter text-white">SANPIO</h1>
          </div>
        )}

        {/* PLAYER CINEMATIC */}
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
