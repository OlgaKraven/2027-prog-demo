import ELK from 'elkjs/lib/elk.bundled.js';

export async function buildErLayout({tables,links}) {
  const width = 232;
  const header = 66;
  const row = 44;
  const graph = await new ELK().layout({
    id:'schema',
    layoutOptions:{
      'elk.algorithm':'layered',
      'elk.direction':'RIGHT',
      'elk.edgeRouting':'ORTHOGONAL',
      'elk.spacing.nodeNode':'28',
      'elk.spacing.edgeEdge':'12',
      'elk.layered.spacing.nodeNodeBetweenLayers':'80',
      'elk.layered.spacing.edgeEdgeBetweenLayers':'14',
      'elk.layered.mergeEdges':'false',
      'elk.padding':'[top=20,left=28,bottom=20,right=28]',
      'elk.aspectRatio':'1.5',
      'elk.separateConnectedComponents':'true'
    },
    children:tables.map(table=>({
      id:table.id,
      width,
      height:header+table.fields.length*row,
      layoutOptions:{'elk.portConstraints':'FIXED_POS'},
      ports:table.fields.flatMap((field,index)=>[['out',width,'EAST'],['in',0,'WEST']].map(([kind,x,side])=>({
        id:table.id+'.'+field.id+'.'+kind,x,y:header-1+index*row+row/2,width:0,height:0,
        layoutOptions:{'elk.port.side':side}
      })))
    })),
    edges:links.map(link=>({
      id:link.from+'.'+link.field,
      sources:[link.to+'.'+link.target+'.out'],
      targets:[link.from+'.'+link.field+'.in']
    }))
  });
  return {
    width:graph.width,height:graph.height,
    nodes:graph.children.map(({id,x,y,width,height})=>({id,x,y,width,height})),
    edges:graph.edges.map(({id,sections})=>({id,sections:sections||[]}))
  };
}
