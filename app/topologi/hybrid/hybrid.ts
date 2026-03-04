export const generateHybrid = (updateNodeData: any) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  const hubA = 'ha';
  const hubB = 'hb';

  nodes.push({
    id: hubA,
    type: 'universal',
    position: { x: 400, y: 350 },
    data: { shapeType: 'switch', label: 'HUB A (STAR)', onChange: updateNodeData, isLive: false }
  });

  nodes.push({
    id: hubB,
    type: 'universal',
    position: { x: 800, y: 350 },
    data: { shapeType: 'switch', label: 'HUB B (STAR)', onChange: updateNodeData, isLive: false }
  });

  // Cabang untuk Hub A dan Hub B
  [hubA, hubB].forEach((h, idx) => {
    for (let j = 0; j < 2; j++) {
      const pcId = `p-${h}-${j}`;
      nodes.push({
        id: pcId,
        type: 'universal',
        position: { 
          x: (idx === 0 ? 400 : 800) + (j === 0 ? -150 : 150), 
          y: 180 
        },
        data: { shapeType: 'pc', label: `USER-${idx + 1}.${j + 1}`, onChange: updateNodeData, isLive: false }
      });
      edges.push({ id: `e-${pcId}`, source: h, target: pcId, style: { strokeWidth: 3, stroke: '#1e293b' } });
    }
  });

  // Backbone yang menghubungkan dua star menjadi hybrid
  edges.push({
    id: 'backbone',
    source: hubA,
    target: hubB,
    style: { strokeWidth: 8, stroke: '#1e293b', strokeDasharray: '10,5' },
    label: 'BACKBONE'
  });

  return { nodes, edges };
};
