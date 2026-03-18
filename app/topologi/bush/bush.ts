// app/topologi/bush/bush.tsx
import { Position } from '@xyflow/react';

export const generateBush = (updateNodeData: any) => {
  const busNodes: any[] = [];
  const busEdges: any[] = [];
  const nodeCount = 5; // Jumlah perangkat PC
  
  // 1. Membuat Jalur Utama (Backbone) menggunakan Junctions
  for (let i = 0; i < nodeCount; i++) {
    const jId = `j-${i}`;
    
    // Simpul Backbone (Titik hitam kecil di tengah)
    busNodes.push({
      id: jId,
      type: 'universal',
      position: { x: 200 + (i * 200), y: 300 },
      data: { 
        type: 'junction', 
        isLive: false 
      }
    });

    // 2. Membuat Node Perangkat (PC) yang terhubung ke backbone
    const pcId = `pc-${i}`;
    busNodes.push({
      id: pcId,
      type: 'universal',
      position: { x: 200 + (i * 200), y: i % 2 === 0 ? 150 : 450 }, // Posisi selang-seling atas/bawah
      data: { 
        shapeType: 'pc', 
        label: `PC-${i + 1}`, 
        onChange: updateNodeData, 
        isLive: false 
      }
    });

    // 3. Menghubungkan PC ke Backbone (Drop Cable)
    busEdges.push({ 
      id: `e-pc-${i}`, 
      source: jId, 
      target: pcId, 
      style: { stroke: '#1e293b', strokeWidth: 3 } 
    });

    // 4. Menghubungkan antar segmen backbone (Kabel Utama)
    if (i > 0) {
      busEdges.push({ 
        id: `e-b-${i}`, 
        source: `j-${i-1}`, 
        target: jId, 
        style: { stroke: '#1e293b', strokeWidth: 5 } // Kabel backbone dibuat lebih tebal
      });
    }
  }

  return { nodes: busNodes, edges: busEdges };
};
