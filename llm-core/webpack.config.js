const path = require('path');

// 主配置函数
module.exports = (env = {}) => {
  const config = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: env.target === 'browser' ? 'browser.js' : 'index.js',
      library: { name: 'llmCore', type: 'umd' },
      globalObject: 'typeof self !== "undefined" ? self : this',
      // 确保正确导出所有模块
      umdNamedDefine: true,
      // 确保与UMD格式兼容
      iife: true
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    // 强制禁用所有优化和代码分割
    optimization: {
      minimize: false, // 禁用代码压缩
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
      runtimeChunk: false,
      concatenateModules: true
    },
    // 配置externals，避免将node_modules中的包打包进来
    externals: env.target === 'browser' ? {
      // 将react相关依赖设为外部依赖
      react: 'react',
      'react-dom': 'react-dom'
    } : {},
    // 确保正确处理ES模块导出
    experiments: {
      outputModule: true
    },
    // 禁用Webpack的懒加载和动态导入功能
    plugins: [],
    // 确保Webpack不会生成额外的chunk文件
    stats: {
      chunks: false,
      chunkModules: false,
      chunkOrigins: false
    },
    // 确保所有导出都正确处理
    target: env.target === 'browser' ? 'web' : 'node'
  };

  return config;
};