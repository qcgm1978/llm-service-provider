import { streamDefinition } from '../../llm-core/src/index';

// 思维导图生成函数
export async function* streamMindMap(
  content: string,
  language: "zh" | "en" = "zh",
  promptConfig?: any
): AsyncGenerator<string, void, undefined> {
  // 直接使用内联提示模板，不再从llm-core获取
  const prompt = language === 'zh' 
    ? `请基于以下内容生成一个详细的思维导图，以JSON格式输出：

要求：
1. 输出格式必须是严格的JSON格式
2. 必须包含节点和它们之间的层次关系
3. 确保JSON可以被正确解析
4. 思维导图应该全面反映内容的主要观点和分支
5. 节点应该有唯一的ID
6. id<10

请直接输出JSON，不要包含其他文本或说明（如\`\`\`json等标记）。`
    : `Please generate a detailed mind map in JSON format based on the following content:

Requirements:
1. Output must be in strict JSON format
2. Must include nodes and their hierarchical relationships
3. Ensure the JSON can be properly parsed
4. The mind map should comprehensively reflect the main points and branches of the content
5. Nodes should have unique IDs
6. id<10

Please output JSON directly without any other text or explanations(like \`\`\`json etc.).`;

  try {
    // 将内容和思维导图提示结合
    const fullPrompt = `${content}\n\n${prompt}`;

    // 使用streamDefinition函数来生成思维导图
    yield* streamDefinition(fullPrompt, language, "mindmap", undefined, promptConfig);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const prefix =
      language === "zh"
        ? "生成思维导图时发生错误: "
        : "Error generating mind map: ";
    yield `${prefix}${errorMessage}`;
  }
}

// 思维导图箭头生成函数
export async function* streamMindMapArrows(
  mindMapData: string,
  language: "zh" | "en" = "zh",
  promptConfig?: any
): AsyncGenerator<string, void, undefined> {
  // 直接使用内联提示模板，不再从llm-core获取
  const prompt = language === 'zh'
    ? `请基于以下思维导图数据，生成节点之间的连接箭头信息，以JSON格式输出：

要求：
1. 输出格式必须是严格的JSON格式
2. 每个箭头应包含：id（唯一标识符）、label（关系描述）、from（源节点ID）、to（目标节点ID）
3. 确保JSON可以被正确解析
4. 只生成有意义的、内容相关的连接关系
5. 箭头信息应封装在{"arrows": [...] }结构中

请直接输出JSON，不要包含其他文本或说明（如\`\`\`json等标记）。`
    : `Please generate connection arrow information between nodes based on the following mind map data, output in JSON format(like \`\`\`json):

Requirements:
1. Output must be in strict JSON format
2. Each arrow should include: id (unique identifier), label (relationship description), from (source node ID), to (target node ID)
3. Ensure the JSON can be properly parsed
4. Only generate meaningful, content-related connection relationships
5. Arrow information should be encapsulated in a {"arrows": [...] } structure

Please output JSON directly without any other text or explanations(like \`\`\`json etc.).`;

  try {
    // 将思维导图数据和箭头提示结合
    const fullPrompt = `${mindMapData}\n\n${prompt}`;

    // 使用streamDefinition函数来生成箭头
    yield* streamDefinition(fullPrompt, language, "mindmap_arrows", undefined, promptConfig);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const prefix =
      language === "zh"
        ? "生成思维导图箭头时发生错误: "
        : "Error generating mind map arrows: ";
    yield `${prefix}${errorMessage}`;
  }
}
