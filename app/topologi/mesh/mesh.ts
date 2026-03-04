export const generateMesh = (updateNodeData: any) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  const count = 5;
  const radius = 250;
  const CX = 600;
  const CY = 400;

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count;
    const x = CX + radius * Math.cos(angle) - 60;
    const y = CY + radius * Math.sin(angle) - 40;
    
    nodes.push({
      id: `m-${i + 1}`,
      type: 'universal',
      position: { x, y },
      data: { shapeType: 'pc', label: `MESH-PC-${i+1}`, onChange: updateNodeData, isLive: false }
    });
  }

  // Menghubungkan setiap node ke semua node lainnya
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      edges.push({
        id: `em-${i}-${j}`,
        source: `m-${i + 1}`,
        target: `m-${j + 1}`,
        style: { strokeWidth: 2, stroke: '#1e293b' }
      });
    }
  }
  return { nodes, edges };
};
