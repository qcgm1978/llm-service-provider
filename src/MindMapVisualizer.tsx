import React, { useState, useEffect, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Handle,
  MiniMap,
  Controls,
  Background,
  Position,
  BackgroundVariant
} from 'reactflow'
import '../index.css'
import type { NodeObj, Summary, MindMapData, Arrow, ArrowsData } from './types/mindmap'

interface MindMapVisualizerProps {
  mindMapData?: MindMapData | null
  arrowsData?: ArrowsData | null
  mindMapError?: string
  arrowsError?: string
}

// 自定义节点组件
const MindMapNode = ({ id, data }: { id: string; data: any }) => {
  return (
    <div className="mindmap-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <h4>{data.topic}</h4>
        {data.tags && (
          <div className="node-tags">
            {data.tags.map((tag: string, idx: number) => (
              <span key={idx} className={`tag ${tag.toLowerCase()}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = {
  mindmap: MindMapNode
}

const MindMapVisualizer: React.FC<MindMapVisualizerProps> = ({
  mindMapData,
  arrowsData,
  mindMapError,
  arrowsError
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  // 处理思维导图数据变化
  useEffect(() => {
    if (mindMapData && mindMapData.nodeData) {
      convertToReactFlowNodes(mindMapData.nodeData)
    } else {
      setNodes([])
      setEdges([])
    }
  }, [mindMapData])

  // 处理箭头数据变化
  useEffect(() => {
    if (arrowsData && arrowsData.arrows && nodes.length > 0) {
      addArrowEdges(arrowsData.arrows)
    }
  }, [arrowsData, nodes])

  // 将思维导图数据转换为 React Flow 节点
  const convertToReactFlowNodes = (nodeData: NodeObj) => {
    const newNodes: any[] = []
    const newEdges: any[] = []
    
    // 递归创建节点和边
    const createNodes = (node: NodeObj, x: number, y: number, level: number = 0) => {
      // 创建节点
      newNodes.push({
        id: node.id,
        type: 'mindmap',
        position: { x, y },
        data: {
          topic: node.topic,
          tags: node.tags,
          level
        }
      })
      
      // 创建子节点和边
      if (node.children && node.children.length > 0) {
        const childCount = node.children.length
        const spacing = Math.min(400 / childCount, 150)
        const startX = x - (spacing * (childCount - 1)) / 2
        
        node.children.forEach((child, index) => {
          const childX = startX + index * spacing
          const childY = y + 150
          
          // 创建边
          newEdges.push({
            id: `${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            label: '',
            type: 'smoothstep'
          })
          
          // 递归创建子节点
          createNodes(child, childX, childY, level + 1)
        })
      }
    }
    
    // 从中心节点开始创建
    createNodes(nodeData, 400, 100)
    
    setNodes(newNodes)
    setEdges(newEdges)
  }

  // 添加箭头边
  const addArrowEdges = (arrowsData: Arrow[]) => {
    const arrowEdges = arrowsData.map(arrow => ({
      id: `arrow-${arrow.id}`,
      source: arrow.from,
      target: arrow.to,
      label: arrow.label,
      type: 'smoothstep',
      animated: true,
      labelBgStyle: {
        fill: '#fff',
        borderRadius: '5px',
        padding: '2px 5px'
      }
    }))
    
    setEdges(prevEdges => [...prevEdges, ...arrowEdges])
  }

  // 处理新的连接
  const onConnect = (params: Connection) => {
    setEdges(prevEdges => addEdge(params, prevEdges))
  }

  return (
    <div className="mindmap-container" ref={reactFlowWrapper}>
      {mindMapError ? (
        <div className="error-display">
          <h4>解析思维导图数据失败</h4>
          <p>{mindMapError}</p>
          <p>请检查JSON格式并修复错误后重新生成</p>
        </div>
      ) : nodes.length > 0 ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      ) : (
        <div className="empty-state">
          请先生成思维导图数据
        </div>
      )}
    </div>
  )
}

export default MindMapVisualizer

export type { NodeObj, Summary, MindMapData, Arrow, ArrowsData }