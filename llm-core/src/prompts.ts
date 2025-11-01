// 提示模板接口定义
export interface Prompt {
  act: string
  prompt: string
}

export interface LanguageOption {
  code: string
  name: string
}

interface PromptsCollection {
  languages: LanguageOption[]
  [key: string]: Prompt[] | LanguageOption[]
}

// 最小化的默认提示模板数据
const defaultPrompts: PromptsCollection = {
  languages: [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' }
  ],
}

// 获取所有语言选项
export const getLanguages = (): LanguageOption[] => {
  return defaultPrompts.languages as LanguageOption[]
}

// 获取指定语言的所有提示模板
export const getPromptsByLanguage = (language: string): Prompt[] => {
  return (defaultPrompts[language] as Prompt[]) || []
}
