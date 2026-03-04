export const generateStar = (updateNodeData: any, centerX: number, centerY: number) => {
  const nodes = [];
  const edges = [];
  const hubId = 'central-hub';

  nodes.push({
    id: hubId,
    type: 'universal',
    position: { x: centerX - 60, y: centerY - 40 },
    data: { shapeType: 'switch', label: 'CENTER SWITCH', onChange: updateNodeData, isLive: false }
  });

  for (let i = 0; i < 6; i++) {
    const angle = (i * 2 * Math.PI) / 6;
    nodes.push({
      id: `s-pc-${i}`,
      type: 'universal',
      position: { 
        x: centerX + 280 * Math.cos(angle) - 60, 
        y: centerY + 280 * Math.sin(angle) - 40 
      },
      data: { shapeType: 'pc', label: `CLIENT-${i + 1}`, onChange: updateNodeData, isLive: false }
    });
    edges.push({
      id: `es-${i}`,
      source: hubId,
      target: `s-pc-${i}`,
      style: { strokeWidth: 3, stroke: '#1e293b' }
    });
  }
  return { nodes, edges };
};
