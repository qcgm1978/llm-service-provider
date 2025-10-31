export interface Prompt {
  act: string;
  prompt: string;
}

export interface LanguagePrompts {
  [key: string]: Prompt[];
}

const defaultPrompts: LanguagePrompts = {
  en: [
    {
      act: 'Summarize',
      prompt: 'Please summarize the following content, keeping the key points and main ideas. The summary should be concise but comprehensive, covering all critical information. Make it in your own words and avoid direct quotes unless necessary.',
    },
    {
      act: 'Expand',
      prompt: 'Please expand the following content, providing more details, examples, and explanations. Elaborate on key points and add relevant information to make it more comprehensive and informative.',
    },
    {
      act: 'Q&A',
      prompt: 'Please answer the user\'s question based on the provided context. If the information is not available in the context, clearly state that you don\'t have the necessary information to answer the question.',
    },
    {
      act: 'Explain',
      prompt: 'Please explain the following concept or topic in simple, easy-to-understand language. Break down complex ideas into simpler terms and provide examples to illustrate the concepts.',
    },
    {
      act: 'Translate',
      prompt: 'Please translate the following text accurately while preserving the original meaning and context. Maintain the same tone and style as the original content.',
    },
    {
      act: 'Mind Map Generation',
      prompt: '```ts\nexport interface NodeObj {\n  topic: string\n  id: string\n  tags?: string[]\n  children?: NodeObj[]\n}\n// Summary of nodes from start to end with parent id\nexport interface Summary {\n  id: string\n  label: string\n  /**\n   * parent node id of the summary\n   */\n  parent: string\n  /**\n   * start index of the summary\n   */\n  start: number\n  /**\n   * end index of the summary\n   */\n  end: number\n}\n```\n\nReply to the user with JSON in the format {\n  nodeData: NodeObj\n  summaries?: Summary[]\n}, which is a recursive structure expressing **mind map data**.\n\n**Important!! nodeData and summaries are at the same level!!**\n\n**Strictly follow**:\n- Use incremental numbers for node IDs\n- Appropriately use parent-child hierarchy rather than just sibling relationships\n- Optionally add tags to nodes: core, case, practice, golden_sentence\n- Summary is a tool to summarize multiple child nodes of the same parent node, and will display summary text in curly braces next to the specified child nodes\n- Add appropriate Summaries, not redundant ones\n- Finally add a golden sentence node to record a few golden sentences from this chapter\n- Add appropriate emojis to express the connotation of the node\n- To achieve a hand-drawn style effect, please try to make the mind map structure rich with more branches and child nodes\n- Ensure correct JSON format, do not return anything other than JSON\n- If the content is acknowledgments, table of contents, preface, preamble, references, publisher introduction, citation notes, etc., please directly reply with "{nodeData:null}"',
    },
    {
      act: 'Mind Map Arrows Generation',
      prompt: 'Please analyze the following mind map data and generate connection arrows between nodes according to the given requirements:\n\n1. Connection arrows represent logical relationships between nodes, not just parent-child relationships\n2. Focus on connecting nodes with high relevance, not random connections\n3. Each arrow should have a clear label describing the relationship\n4. Arrows should be bidirectional where appropriate\n5. Avoid excessive arrows that would make the diagram cluttered\n6. Ensure arrows connect to appropriate node IDs\n\nReturn the result as a JSON array of arrow objects with the following format:\n[{\"source\": \"nodeId1\", \"target\": \"nodeId2\", \"label\": \"relationship description\", \"bidirectional\": true/false}]\n\nIf there are no appropriate connections to add, return an empty array.\n\nEnsure correct JSON format and do not return anything other than JSON.',
    },
  ],
  zh: [
    {
      act: 'Summarize',
      prompt: '请总结以下内容，保留关键点和主要思想。总结应简洁但全面，涵盖所有关键信息。用自己的话表达，除非必要，否则避免直接引用。',
    },
    {
      act: 'Expand',
      prompt: '请扩展以下内容，提供更多细节、例子和解释。详细阐述关键点，并添加相关信息，使其更加全面和信息丰富。',
    },
    {
      act: 'Q&A',
      prompt: '请根据提供的上下文回答用户的问题。如果上下文中没有相关信息，请明确表示您没有足够的信息来回答问题。',
    },
    {
      act: 'Explain',
      prompt: '请用简单、易懂的语言解释以下概念或主题。将复杂的想法分解成更简单的术语，并提供例子来说明这些概念。',
    },
    {
      act: 'Translate',
      prompt: '请准确翻译以下文本，同时保留原意和上下文。保持与原文相同的语调和风格。',
    },
    {
      act: 'Mind Map Generation',
      prompt: '```ts\nexport interface NodeObj {\n  topic: string\n  id: string\n  tags?: string[]\n  children?: NodeObj[]\n}\n// Summary of nodes from start to end with parent id\nexport interface Summary {\n  id: string\n  label: string\n  /**\n   * parent node id of the summary\n   */\n  parent: string\n  /**\n   * start index of the summary\n   */\n  start: number\n  /**\n   * end index of the summary\n   */\n  end: number\n}\n```\n\n请用JSON格式回复，格式为{\n  nodeData: NodeObj\n  summaries?: Summary[]\n}，这是一个递归结构，表达**思维导图数据**。\n\n**重要！！nodeData和summaries在同一层级！！**\n\n**严格遵循**：\n- 对节点ID使用递增的数字\n- 适当使用父子层次结构，而不仅仅是兄弟关系\n- 可选择性地为节点添加标签：core, case, practice, golden_sentence\n- Summary是用于总结同一父节点下多个子节点的工具，会在指定子节点旁边用花括号显示摘要文本\n- 添加适当的Summary，不要多余的\n- 最后添加一个金句节点，记录本章的几个金句\n- 添加适当的emoji来表达节点的内涵\n- 为了达到手绘风格的效果，请尽量让思维导图结构丰富，有更多的分支和子节点\n- 确保正确的JSON格式，不要返回JSON以外的任何内容\n- 如果内容是鸣谢、目录、前言、序、参考文献、出版者说明、引用注释等，请直接回复\"{nodeData:null}\"',
    },
    {
      act: 'Mind Map Arrows Generation',
      prompt: '请分析以下思维导图数据，并根据给定要求在节点之间生成连接箭头：\n\n1. 连接箭头表示节点之间的逻辑关系，不仅仅是父子关系\n2. 重点连接相关性高的节点，不要随意连接\n3. 每个箭头应有明确的标签，描述关系\n4. 在适当情况下，箭头应该是双向的\n5. 避免过多箭头使图表显得杂乱\n6. 确保箭头连接到适当的节点ID\n\n将结果作为箭头对象的JSON数组返回，格式如下：\n[{\"source\": \"nodeId1\", \"target\": \"nodeId2\", \"label\": \"关系描述\", \"bidirectional\": true/false}]\n\n如果没有合适的连接可以添加，请返回空数组。\n\n确保正确的JSON格式，不要返回JSON以外的任何内容。',
    },
  ],
};

// 当前使用的提示模板，初始为默认提示模板
let currentPrompts: LanguagePrompts = { ...defaultPrompts };

/**
 * 获取所有支持的语言列表
 */
export function getLanguages(): string[] {
  return Object.keys(currentPrompts);
}

/**
 * 根据语言获取该语言的所有提示模板
 */
export function getPromptsByLanguage(language: string): Prompt[] {
  return currentPrompts[language] || [];
}

/**
 * 根据语言和动作名称获取特定的提示模板
 */
export function getPromptByName(language: string, act: string): Prompt | undefined {
  const prompts = getPromptsByLanguage(language);
  return prompts.find(prompt => prompt.act === act);
}

/**
 * 格式化提示模板，替换模板中的占位符
 */
export function formatPrompt(prompt: Prompt, context?: string, query?: string): string {
  let formatted = prompt.prompt;
  if (context) {
    formatted = formatted.replace(/\{context\}/g, context);
  }
  if (query) {
    formatted = formatted.replace(/\{query\}/g, query);
  }
  return formatted;
}

/**
 * 更新特定语言的提示模板
 */
export function updatePrompt(language: string, prompt: Prompt): void {
  if (!currentPrompts[language]) {
    currentPrompts[language] = [];
  }
  const index = currentPrompts[language].findIndex(p => p.act === prompt.act);
  if (index >= 0) {
    currentPrompts[language][index] = prompt;
  } else {
    currentPrompts[language].push(prompt);
  }
}

/**
 * 重置提示模板为默认状态
 */
export function resetPrompts(): void {
  currentPrompts = { ...defaultPrompts };
}

/**
 * 获取章节思维导图提示模板
 */
export function getChapterMindMapPrompt(): string {
  const prompt = getPromptByName('zh', 'Mind Map Generation');
  return prompt?.prompt || '';
}

/**
 * 获取思维导图箭头提示模板
 */
export function getMindMapArrowPrompt(): string {
  const prompt = getPromptByName('zh', 'Mind Map Arrows Generation');
  return prompt?.prompt || '';
}