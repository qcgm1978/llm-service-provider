import React, { useState, useEffect, useRef } from 'react'
import {
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasApiKey,
  streamDefinition,
  streamMindMap,
  streamMindMapArrows,
  getChapterMindMapPrompt,
  getMindMapArrowPrompt,
  MindMapVisualizer,
  MindMapData,
  ArrowsData
} from '../../src'
import ApiKeyManager from '../../src/ApiKeyManager'
import './styles.css'

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Handle
} from 'reactflow'
import 'reactflow/dist/style.css'

interface NodeObj {
  topic: string
  id: string
  tags?: string[]
  children?: NodeObj[]
}

interface Summary {
  id: string
  label: string
  parent: string
  start: number
  end: number
}

interface MindMapData {
  nodeData: NodeObj
  summaries?: Summary[]
}

interface Arrow {
  id: string
  label: string
  from: string
  to: string
  delta1: { x: number; y: number }
  delta2: { x: number; y: number }
  bidirectional?: boolean
}

interface ArrowsData {
  arrows?: Arrow[]
}

// 自定义节点组件
const MindMapNode = ({ id, data }: { id: string; data: any }) => {
  return (
    <div className="mindmap-node">
      <Handle type="target" position="top" />
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
      <Handle type="source" position="bottom" />
    </div>
  )
}

const nodeTypes = {
  mindmap: MindMapNode
}

function App() {
  // 基础状态
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false)
  const [topic, setTopic] = useState('如何制作思维导图')
  
  // 内容生成状态
  const [content, setContent] = useState('')
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  
  // 思维导图状态
  const [mindMap, setMindMap] = useState('')
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false)
  const [parsedMindMap, setParsedMindMap] = useState<MindMapData | null>(null)
  const [mindMapError, setMindMapError] = useState<string>('')
  
  // 箭头生成状态
  const [arrows, setArrows] = useState('')
  const [isGeneratingArrows, setIsGeneratingArrows] = useState(false)
  const [parsedArrows, setParsedArrows] = useState<ArrowsData | null>(null)
  const [arrowsError, setArrowsError] = useState<string>('')
  
  // 服务提供商状态
  const [selectedProvider, setSelectedProvider] = useState(getSelectedServiceProvider())

  // React Flow 状态
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  // 解析思维导图数据
  useEffect(() => {
    if (mindMap) {
      try {
        const parsed = JSON.parse(mindMap) as MindMapData
        setParsedMindMap(parsed)
        setMindMapError('')
        // 将解析后的数据转换为 React Flow 的节点和边
        convertToReactFlowNodes(parsed.nodeData)
      } catch (error) {
        console.error('解析思维导图数据失败:', error)
        setParsedMindMap(null)
        setNodes([])
        setEdges([])
        if (error instanceof SyntaxError) {
          setMindMapError(`JSON解析错误: ${error.message}`)
        } else {
          setMindMapError(`解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }
    } else {
      setParsedMindMap(null)
      setMindMapError('')
      setNodes([])
      setEdges([])
    }
  }, [mindMap])

  // 解析箭头数据
  useEffect(() => {
    if (arrows) {
      try {
        const parsed = JSON.parse(arrows) as ArrowsData
        setParsedArrows(parsed)
        setArrowsError('')
        // 添加箭头边
        if (parsed.arrows && nodes.length > 0) {
          addArrowEdges(parsed.arrows)
        }
      } catch (error) {
        console.error('解析箭头数据失败:', error)
        setParsedArrows(null)
        if (error instanceof SyntaxError) {
          setArrowsError(`JSON解析错误: ${error.message}`)
        } else {
          setArrowsError(`解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }
    } else {
      setParsedArrows(null)
      setArrowsError('')
    }
  }, [arrows, nodes])

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

  // 生成内容
  const generateContent = async () => {
    if (!topic || !hasApiKey()) return
    setIsGeneratingContent(true)
    setContent('')

    try {
      for await (const chunk of streamDefinition(topic, 'zh')) {
        setContent(prev => prev + chunk)
      }
    } catch (error) {
      setContent(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGeneratingContent(false)
    }
  }

  // 生成思维导图
  const generateMindMapFromContent = async () => {
    if (!content || !hasApiKey()) return
    setIsGeneratingMindMap(true)
    setMindMap('')

    try {
      for await (const chunk of streamMindMap(content, 'zh')) {
        setMindMap(prev => prev + chunk)
      }
    } catch (error) {
      setMindMap(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGeneratingMindMap(false)
    }
  }

  // 生成箭头
  const generateArrows = async () => {
    if (!mindMap || !hasApiKey()) return
    setIsGeneratingArrows(true)
    setArrows('')

    try {
      for await (const chunk of streamMindMapArrows(mindMap, 'zh')) {
        setArrows(prev => prev + chunk)
      }
    } catch (error) {
      setArrows(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGeneratingArrows(false)
    }
  }

  // 切换服务提供商
  const handleProviderChange = (provider: ServiceProvider) => {
    setSelectedProvider(provider)
    setSelectedServiceProvider(provider)
  }

  return (
    <div className="app-container">
      <h1>LLM Service Provider 演示</h1>
      
      {/* API Key 配置 */}
      <div className="section">
        <h2>API Key 配置</h2>
        <button 
          onClick={() => setIsApiKeyManagerOpen(true)}
        >
          配置 API Key
        </button>
        <ApiKeyManager
          isOpen={isApiKeyManagerOpen}
          onSave={(key) => {
            console.log('API key saved:', key)
            setIsApiKeyManagerOpen(false)
          }}
          onClose={() => setIsApiKeyManagerOpen(false)}
        />
      </div>

      {/* 服务提供商选择 */}
      <div className="section">
        <h2>服务提供商选择</h2>
        <div className="provider-selector">
          {Object.values(ServiceProvider).map((provider) => (
            <button
              key={provider}
              onClick={() => handleProviderChange(provider)}
              style={{
                backgroundColor: selectedProvider === provider ? '#007bff' : '#f0f0f0',
                color: selectedProvider === provider ? 'white' : 'black'
              }}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>

      {/* 内容生成 */}
      <div className="section">
        <h2>内容生成</h2>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="输入主题..."
        />
        <button 
          onClick={generateContent} 
          disabled={isGeneratingContent || !hasApiKey()}
        >
          {isGeneratingContent ? '生成中...' : '生成内容'}
        </button>
        <div className="result-container">
          <h3>生成内容:</h3>
          <div className="text-area">
            {isGeneratingContent && <span className="info-message">正在生成内容...</span>}
            {content}
          </div>
        </div>
      </div>

      {/* 思维导图生成 */}
      <div className="section">
        <h2>思维导图生成</h2>
        <button 
          onClick={generateMindMapFromContent} 
          disabled={isGeneratingMindMap || !content || !hasApiKey()}
        >
          {isGeneratingMindMap ? '生成中...' : '生成思维导图'}
        </button>
        <div className="result-container">
          <h3>思维导图数据 (JSON):</h3>
          {mindMapError && (
            <div className="error-message">
              {mindMapError}
            </div>
          )}
          <pre>
            {isGeneratingMindMap && '正在生成思维导图...\n'}
            {mindMap}
          </pre>
        </div>
        
        {/* 思维导图可视化 - 使用 MindMapVisualizer 组件 */}
        <div className="result-container">
          <h3>思维导图可视化:</h3>
          <div className="mindmap-container">
            {mindMapError ? (
              <div className="error-display">
                <h4>解析思维导图数据失败</h4>
                <p>{mindMapError}</p>
                <p>请检查JSON格式并修复错误后重新生成</p>
              </div>
            ) : parsedMindMap ? (
              <MindMapVisualizer 
                mindMapData={parsedMindMap} 
                arrowsData={parsedArrows} 
              />
            ) : (
              <div className="empty-state">
                请先生成思维导图数据
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 箭头连接生成 */}
      <div className="section">
        <h2>箭头连接生成</h2>
        <button 
          onClick={generateArrows} 
          disabled={isGeneratingArrows || !mindMap || !hasApiKey()}
        >
          {isGeneratingArrows ? '生成中...' : '生成箭头连接'}
        </button>
        <div className="result-container">
          <h3>箭头数据 (JSON):</h3>
          {arrowsError && (
            <div className="error-message">
              {arrowsError}
            </div>
          )}
          <pre>
            {isGeneratingArrows && '正在生成箭头连接...\n'}
            {arrows}
          </pre>
        </div>
      </div>

      {/* 提示文本展示 */}
      <div className="section">
        <h2>原始提示文本</h2>
        <div className="result-container">
          <h3>思维导图提示:</h3>
          <pre>
            {getChapterMindMapPrompt()}
          </pre>
        </div>
        <div className="result-container">
          <h3>箭头提示:</h3>
          <pre>
            {getMindMapArrowPrompt()}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App