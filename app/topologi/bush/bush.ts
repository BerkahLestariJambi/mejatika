export const generateBus = (updateNodeData: any) => {
  const nodes: any[] = [];
  const edges: any[] = [];

  for (let i = 0; i < 5; i++) {
    const xPos = i * 250 + 200;
    
    // Titik sambung kabel (Junction)
    nodes.push({
      id: `j-${i}`,
      type: 'universal',
      position: { x: xPos, y: 350 },
      data: { type: 'junction', isLive: false }
    });

    if (i > 0) {
      edges.push({
        id: `back-${i}`,
        source: `j-${i - 1}`,
        sourceHandle: 'r',
        target: `j-${i}`,
        targetHandle: 'l',
        style: { strokeWidth: 6, stroke: '#1e293b' }
      });
    }

    const isTop = i % 2 === 0;
    nodes.push({
      id: `n-${i}`,
      type: 'universal',
      position: { x: xPos - 55, y: isTop ? 180 : 480 },
      data: { 
        shapeType: i === 0 ? 'router' : 'pc', 
        label: i === 0 ? 'GATEWAY' : `PC-${i}`, 
        onChange: updateNodeData, 
        isLive: false 
      }
    });

    edges.push({
      id: `drop-${i}`,
      source: `j-${i}`,
      sourceHandle: isTop ? 't' : 'b',
      target: `n-${i}`,
      targetHandle: isTop ? 'b' : 't',
      style: { strokeWidth: 3, stroke: '#64748b' }
    });
  }
  return { nodes, edges };
};
