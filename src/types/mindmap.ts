// 思维导图节点接口
export interface NodeObj {
  topic: string
  id: string
  tags?: string[]
  children?: NodeObj[]
}

// 思维导图摘要接口
export interface Summary {
  id: string
  label: string
  parent: string
  start: number
  end: number
}

// 完整思维导图数据接口
export interface MindMapData {
  nodeData: NodeObj
  summaries?: Summary[]
}

// 箭头连接接口
export interface Arrow {
  id: string
  label: string
  from: string
  to: string
  delta1: { x: number; y: number }
  bidirectional?: boolean
}

// 箭头数据接口
export interface ArrowsData {
  arrows?: Arrow[]
}