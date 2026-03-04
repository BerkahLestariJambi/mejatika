import { Position } from '@xyflow/react';

export const generateRing = (updateNodeData: any, centerX: number, centerY: number) => {
  const nodes = [];
  const edges = [];
  const count = 5;

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    nodes.push({
      id: `r-${i + 1}`, // Menggunakan nama PC-1, PC-2, dst
      type: 'universal',
      position: { 
        x: centerX + 240 * Math.cos(angle) - 60, 
        y: centerY + 240 * Math.sin(angle) - 40 
      },
      data: { shapeType: 'pc', label: `PC-${i + 1}`, onChange: updateNodeData, isLive: false }
    });
  }

  for (let i = 0; i < count; i++) {
    const sourceId = `r-${i + 1}`;
    const targetId = `r-${((i + 1) % count) + 1}`;
    
    // Khusus PC-5 (atas) ke PC-1 (samping) bisa diatur handle-nya di sini jika otomatis
    edges.push({
      id: `er-${i}`,
      source: sourceId,
      target: targetId,
      style: { strokeWidth: 3, stroke: '#1e293b' }
    });
  }
  return { nodes, edges };
};
