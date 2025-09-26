// 提示模板接口定义
export interface Prompt {
  act: string;
  prompt: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

interface PromptsCollection {
  languages: LanguageOption[];
  [key: string]: Prompt[] | LanguageOption[];
}

// 默认提示模板数据
const defaultPrompts: PromptsCollection = {
  languages: [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' }
  ],
  zh: [
    // 默认提示模板
    { act: '简洁定义', prompt: '{topic}' },
    { act: '类别定义', prompt: '"{topic}"。不要使用markdown、标题或任何特殊格式。只返回定义本身的文本。' },
    { act: '带上下文回答', prompt: '请用中文回答"{topic}"。\n\n上下文信息：{context}' },
    // 思维导图相关提示
    { act: '思维导图生成', prompt: '```ts\nexport interface NodeObj {\n  topic: string\n  id: string\n  tags?: string[]\n  children?: NodeObj[]\n}\n// 总结父id的第start到end个节点的内容\nexport interface Summary {\n  id: string\n  label: string\n  /**\n   * parent node id of the summary\n   */\n  parent: string\n  /**\n   * start index of the summary\n   */\n  start: number\n  /**\n   * end index of the summary\n   */\n  end: number\n}\n```\n\n使用符合  {\n  nodeData: NodeObj\n  summaries?: Summary[]\n} 格式的 JSON 回复用户，这是一个表达**思维导图数据**的递归结构。\n\n**注意！！nodeData、summaries 在同一层级！！**\n\n**严格遵守**：\n- 节点 ID 使用递增数字即可\n- 注意不要一昧使用兄弟节点关系，适当应用父子级别的分层\n- 向节点插入 tags 可选：核心、案例、实践、金句\n- Summary 是总结多个同父节点的子节点的工具，会使用花括号把总结文本显示在指定子节点侧边，因为节点存在两侧分布的情况，禁止总结根节点\n- 适当添加 Summary，不要添加多余的 Summary\n- 最后添加一个金句节点记录几句本章金句\n- 适当添加表达该节点内涵的 emoji\n- 为了实现手绘风格效果，请尽量使思维导图结构丰富，使用更多分支和子节点\n- 确保JSON格式正确，不要返回任何JSON以外的内容\n- 如果内容是致谢、目录、前言、序言、参考文献、出版社介绍、引用说明等的页面，请直接回复"{nodeData:null}"' },
    { act: '思维导图箭头生成', prompt: '请根据给定的思维导图数据，生成节点之间的箭头连接关系。箭头表示因果关系、依赖关系、时间顺序或逻辑关系。\n\n要求：\n1. 使用JSON格式输出，只包含箭头信息\n2. 每个箭头对象包含以下字段：\n   - from: 起始节点ID\n   - to: 目标节点ID\n   - label: 箭头标签（描述关系的简短文本）\n3. 不要返回任何JSON以外的内容\n4. 不要复制思维导图数据，只返回箭头数组\n5. 箭头数组应命名为"arrows"' }
  ],
  en: [
    // 默认提示模板
    { act: 'Concise Definition', prompt: 'Please provide a concise, encyclopedia-style definition for the term: "{topic}" in English. Please provide informative and neutral content. Do not use markdown, headings, or any special formatting. Return only the text of the definition itself.' },
    { act: 'Category Definition', prompt: 'Please provide a concise, encyclopedia-style definition for the term: "{topic}" in the category of {category} in English. Please provide informative and neutral content. Do not use markdown, headings, or any special formatting. Return only the text of the definition itself.' },
    { act: 'Answer with Context', prompt: 'Please answer the question "{topic}" in English.\n\nContext information: {context}' },
    // Mind map related prompts
    { act: 'Mind Map Generation', prompt: '```ts\nexport interface NodeObj {\n  topic: string\n  id: string\n  tags?: string[]\n  children?: NodeObj[]\n}\n// Summary of nodes from start to end with parent id\nexport interface Summary {\n  id: string\n  label: string\n  /**\n   * parent node id of the summary\n   */\n  parent: string\n  /**\n   * start index of the summary\n   */\n  start: number\n  /**\n   * end index of the summary\n   */\n  end: number\n}\n```\n\nReply to the user with JSON in the format {\n  nodeData: NodeObj\n  summaries?: Summary[]\n}, which is a recursive structure expressing **mind map data**.\n\n**Important!! nodeData and summaries are at the same level!!**\n\n**Strictly follow**:\n- Use incremental numbers for node IDs\n- Appropriately use parent-child hierarchy rather than just sibling relationships\n- Optionally add tags to nodes: core, case, practice, golden_sentence\n- Summary is a tool to summarize multiple child nodes of the same parent node, and will display summary text in curly braces next to the specified child nodes\n- Add appropriate Summaries, not redundant ones\n- Finally add a golden sentence node to record a few golden sentences from this chapter\n- Add appropriate emojis to express the connotation of the node\n- To achieve a hand-drawn style effect, please try to make the mind map structure rich with more branches and child nodes\n- Ensure correct JSON format, do not return anything other than JSON\n- If the content is acknowledgments, table of contents, preface, preamble, references, publisher introduction, citation notes, etc., please directly reply with "{nodeData:null}"' },
    { act: 'Mind Map Arrows Generation', prompt: 'Please generate arrow connections between nodes based on the given mind map data. Arrows represent causal relationships, dependencies, chronological order, or logical relationships.\n\nRequirements:\n1. Output in JSON format, containing only arrow information\n2. Each arrow object contains the following fields:\n   - from: starting node ID\n   - to: target node ID\n   - label: arrow label (short text describing the relationship)\n3. Do not return anything other than JSON\n4. Do not copy the mind map data, only return the arrow array\n5. The arrow array should be named "arrows"' }
  ]
};

// 创建可修改的提示模板对象
let prompts: PromptsCollection = JSON.parse(JSON.stringify(defaultPrompts));

// 获取所有语言选项
export const getLanguages = (): LanguageOption[] => {
  return prompts.languages as LanguageOption[];
};

// 获取指定语言的所有提示模板
export const getPromptsByLanguage = (language: string): Prompt[] => {
  return (prompts[language] as Prompt[]) || [];
};

// 根据名称和语言获取提示模板
export const getPromptByName = (name: string, language: 'zh' | 'en' = 'zh'): string | undefined => {
  const promptsForLang = prompts[language] as Prompt[];
  if (!promptsForLang) return undefined;
  
  const prompt = promptsForLang.find(p => p.act === name);
  return prompt?.prompt;
};

// 替换提示模板中的变量
export const formatPrompt = (prompt: string, replacements: Record<string, string>): string => {
  let result = prompt;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
};

// 添加或更新提示模板
export const updatePrompt = (name: string, prompt: string, language: 'zh' | 'en' = 'zh'): boolean => {
  const promptsForLang = prompts[language] as Prompt[];
  if (!promptsForLang) return false;
  
  const index = promptsForLang.findIndex(p => p.act === name);
  if (index >= 0) {
    promptsForLang[index].prompt = prompt;
  } else {
    promptsForLang.push({ act: name, prompt });
  }
  return true;
};

// 重置所有提示模板到默认值
export const resetPrompts = (): void => {
  prompts = JSON.parse(JSON.stringify(defaultPrompts));
};

export default prompts;