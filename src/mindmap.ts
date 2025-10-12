import { getPromptByName } from '../llm-core/src/prompts';



// 获取思维导图生成提示
export const getChapterMindMapPrompt = () => {
  const prompt = getPromptByName('思维导图生成', 'zh');
  return prompt || '';
};

// 获取思维导图箭头生成提示
export const getMindMapArrowPrompt = () => {
  const prompt = getPromptByName('思维导图箭头生成', 'zh');
  return prompt || '';
};