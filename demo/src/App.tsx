import React, { useState, useRef, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Handle,
} from "react-flow-renderer";
import "react-flow-renderer/dist/style.css";
import {
  ServiceProvider,
  streamDefinition,
  streamMindMap,
  streamMindMapArrows,
  hasApiKey,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
} from "../../src";
// 修改导入语句
import ApiKeyManager, { updateSelectedPromptType } from "../../src/ApiKeyManager";
import MindMapVisualizer from "../../src/MindMapVisualizer";
import {
  getChapterMindMapPrompt,
  getMindMapArrowPrompt,
} from "../../src/mindmap";
import {
  getPromptByName,
  formatPrompt,
  getPromptsByLanguage,
} from "../../llm-core/src/prompts";
import PromptManager from "./PromptManager";
import "./styles.css";

interface NodeObj {
  topic: string;
  id: string;
  tags?: string[];
  children?: NodeObj[];
}

interface Summary {
  id: string;
  label: string;
  parent: string;
  start: number;
  end: number;
}

interface MindMapData {
  nodeData: NodeObj;
  summaries?: Summary[];
}

interface Arrow {
  id: string;
  label: string;
  from: string;
  to: string;
  delta1: { x: number; y: number };
  delta2: { x: number; y: number };
  bidirectional?: boolean;
}

interface ArrowsData {
  arrows?: Arrow[];
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
  );
};

const nodeTypes = {
  mindmap: MindMapNode,
};

function App() {
  // 基础状态
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(true);
  const [isPromptManagerOpen, setIsPromptManagerOpen] = useState(false);
  const [topic, setTopic] = useState("如何制作思维导图");
  const [selectedPromptType, setSelectedPromptType] = useState("简洁定义");
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");
  const [availablePrompts, setAvailablePrompts] = useState<string[]>([
    "简洁定义",
  ]);

  // 内容生成状态
  const [content, setContent] = useState("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // 思维导图状态
  const [mindMap, setMindMap] = useState("");
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [parsedMindMap, setParsedMindMap] = useState<MindMapData | null>(null);
  const [mindMapError, setMindMapError] = useState<string>("");

  // 箭头生成状态
  const [arrows, setArrows] = useState("");
  const [isGeneratingArrows, setIsGeneratingArrows] = useState(false);
  const [parsedArrows, setParsedArrows] = useState<ArrowsData | null>(null);
  const [arrowsError, setArrowsError] = useState<string>("");

  // 服务提供商状态
  const [selectedProvider, setSelectedProvider] = useState(
    getSelectedServiceProvider()
  );

  // React Flow 状态
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // 加载可用的提示模板类型
  useEffect(() => {
    const prompts = getPromptsByLanguage("zh");
    const promptTypes = prompts.map((prompt) => prompt.act);
    setAvailablePrompts(promptTypes);
  }, []);

  // 解析思维导图数据
  useEffect(() => {
    if (mindMap) {
      try {
        const parsed = JSON.parse(mindMap) as MindMapData;
        setParsedMindMap(parsed);
        setMindMapError("");
        convertToReactFlowNodes(parsed.nodeData);
      } catch (error) {
        console.error("解析思维导图数据失败:", error);
        setParsedMindMap(null);
        setNodes([]);
        setEdges([]);
        if (error instanceof SyntaxError) {
          setMindMapError(`JSON解析错误: ${error.message}`);
        } else {
          setMindMapError(
            `解析失败: ${error instanceof Error ? error.message : "未知错误"}`
          );
        }
      }
    } else {
      setParsedMindMap(null);
      setMindMapError("");
      setNodes([]);
      setEdges([]);
    }
  }, [mindMap]);

  // 解析箭头数据
  useEffect(() => {
    if (arrows) {
      try {
        const parsed = JSON.parse(arrows) as ArrowsData;
        setParsedArrows(parsed);
        setArrowsError("");
        if (parsed.arrows && nodes.length > 0) {
          addArrowEdges(parsed.arrows);
        }
      } catch (error) {
        console.error("解析箭头数据失败:", error);
        setParsedArrows(null);
        if (error instanceof SyntaxError) {
          setArrowsError(`JSON解析错误: ${error.message}`);
        } else {
          setArrowsError(
            `解析失败: ${error instanceof Error ? error.message : "未知错误"}`
          );
        }
      }
    } else {
      setParsedArrows(null);
      setArrowsError("");
    }
  }, [arrows, nodes]);

  // 将思维导图数据转换为 React Flow 节点
  const convertToReactFlowNodes = (nodeData: NodeObj) => {
    const newNodes: any[] = [];
    const newEdges: any[] = [];

    const createNodes = (
      node: NodeObj,
      x: number,
      y: number,
      level: number = 0
    ) => {
      newNodes.push({
        id: node.id,
        type: "mindmap",
        position: { x, y },
        data: {
          topic: node.topic,
          tags: node.tags,
          level,
        },
      });

      if (node.children && node.children.length > 0) {
        const childCount = node.children.length;
        const spacing = Math.min(400 / childCount, 150);
        const startX = x - (spacing * (childCount - 1)) / 2;

        node.children.forEach((child, index) => {
          const childX = startX + index * spacing;
          const childY = y + 150;

          newEdges.push({
            id: `${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            label: "",
            type: "smoothstep",
          });

          createNodes(child, childX, childY, level + 1);
        });
      }
    };

    createNodes(nodeData, 400, 100);

    setNodes(newNodes);
    setEdges(newEdges);
  };

  // 添加箭头边
  const addArrowEdges = (arrowsData: Arrow[]) => {
    const arrowEdges = arrowsData.map((arrow) => ({
      id: `arrow-${arrow.id}`,
      source: arrow.from,
      target: arrow.to,
      label: arrow.label,
      type: "smoothstep",
      animated: true,
      labelBgStyle: {
        fill: "#fff",
        borderRadius: "5px",
        padding: "2px 5px",
      },
    }));

    setEdges((prevEdges) => [...prevEdges, ...arrowEdges]);
  };

  // 处理新的连接
  const onConnect = (params: Connection) => {
    setEdges((prevEdges) => addEdge(params, prevEdges));
  };

  // 生成内容
  const generateContent = async () => {
    if (!topic || !hasApiKey()) return;
    setIsGeneratingContent(true);
    setContent("");
    
    try {
      let prompt = "";
      const replacements: Record<string, string> = { topic };
      
      if ((selectedPromptType === "wiki" || selectedPromptType === "JSON") && category) {
        replacements.category = category;
      } else if (selectedPromptType === "带上下文回答" && context) {
        replacements.context = context;
      }
      
      const promptTemplate = getPromptByName(selectedPromptType, "zh");
      if (promptTemplate) {
        prompt = formatPrompt(promptTemplate, replacements);
      } else {
        prompt = topic;
      }
      
      for await (const chunk of streamDefinition(
        topic,
        "zh",
        category || undefined,
        context || undefined
      )) {
        setContent((prev) => {
          return prev + chunk;
        });
      }
    } catch (error) {
      setContent(
        `生成失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // 生成思维导图
  const generateMindMapFromContent = async () => {
    if (!content || !hasApiKey()) return;
    setIsGeneratingMindMap(true);
    setMindMap("");

    try {
      for await (const chunk of streamMindMap(content, "zh")) {
        setMindMap((prev) => prev + chunk);
      }
    } catch (error) {
      setMindMap(
        `生成失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  // 生成箭头
  const generateArrows = async () => {
    if (!mindMap || !hasApiKey()) return;
    setIsGeneratingArrows(true);
    setArrows("");

    try {
      for await (const chunk of streamMindMapArrows(mindMap, "zh")) {
        setArrows((prev) => prev + chunk);
      }
    } catch (error) {
      setArrows(
        `生成失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      setIsGeneratingArrows(false);
    }
  };

  // 切换服务提供商
  const handleProviderChange = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setSelectedServiceProvider(provider);
  };

  return (
    <div className="app-container">
      <h1>LLM Service Provider 演示</h1>

      {/* API Key 配置 */}
      <div className="section">
        <h2>API Key 配置</h2>
        <button onClick={() => setIsApiKeyManagerOpen(true)}>
          配置 API Key
        </button>
        <ApiKeyManager
          onSave={() => {}}
          onClose={() => setIsApiKeyManagerOpen(false)}
          isOpen={isApiKeyManagerOpen}
          defaultPromptType={selectedPromptType}
          language="zh"
          compactTemplate={false}
          styleVariant="comic2"
        />
      </div>

      {/* 提示模板管理 */}
      <div className="section">
        <h2>提示模板管理</h2>
        <button onClick={() => setIsPromptManagerOpen(true)}>
          管理提示模板
        </button>
        <PromptManager
          isOpen={isPromptManagerOpen}
          onClose={() => setIsPromptManagerOpen(false)}
          onSave={() => {
            console.log("提示模板已保存");
          }}
        />
      </div>

      <div className="section">
        <h2>服务提供商选择</h2>
        <div className="provider-selector">
          {Object.values(ServiceProvider).map((provider) => (
            <button
              key={provider}
              onClick={() => handleProviderChange(provider)}
              style={{
                backgroundColor:
                  selectedProvider === provider ? "#007bff" : "#f0f0f0",
                color: selectedProvider === provider ? "white" : "black",
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

        <div className="prompt-type-selector">
          <label>选择提示类型:</label>
                <select
                value={selectedPromptType}
                onChange={(e) => {
                  setSelectedPromptType(e.target.value);
                  updateSelectedPromptType(e.target.value);
                }}
                style={{ padding: "5px", marginLeft: "10px" }}
              >
            {availablePrompts.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {selectedPromptType === "wiki" || selectedPromptType === "JSON" && (
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="输入类别..."
          />
        )}

        {selectedPromptType === "带上下文回答" && (
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="输入上下文信息..."
            rows={4}
            className="context-input"
          />
        )}

        <button
          onClick={generateContent}
          disabled={isGeneratingContent || !hasApiKey()}
        >
          {isGeneratingContent ? "生成中..." : "生成内容"}
        </button>
        <div className="result-container">
          <h3>生成内容:</h3>
          <div className="text-area">
            {isGeneratingContent && (
              <span className="info-message">正在生成内容...</span>
            )}
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
          {isGeneratingMindMap ? "生成中..." : "生成思维导图"}
        </button>
        <div className="result-container">
          <h3>思维导图数据 (JSON):</h3>
          {mindMapError && <div className="error-message">{mindMapError}</div>}
          <pre>
            {isGeneratingMindMap && "正在生成思维导图...\n"}
            {mindMap}
          </pre>
        </div>

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
              <div className="empty-state">请先生成思维导图数据</div>
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
          {isGeneratingArrows ? "生成中..." : "生成箭头连接"}
        </button>
        <div className="result-container">
          <h3>箭头数据 (JSON):</h3>
          {arrowsError && <div className="error-message">{arrowsError}</div>}
          <pre>
            {isGeneratingArrows && "正在生成箭头连接...\n"}
            {arrows}
          </pre>
        </div>
      </div>

      {/* 提示文本展示 */}
      <div className="section">
        <h2>原始提示文本</h2>
        <div className="result-container">
          <h3>思维导图提示:</h3>
          <pre>{getChapterMindMapPrompt()}</pre>
        </div>
        <div className="result-container">
          <h3>箭头提示:</h3>
          <pre>{getMindMapArrowPrompt()}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
