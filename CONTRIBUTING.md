# 贡献指南

感谢您对 LMQ-AI健身教练 项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题

如果您发现了 bug 或有改进建议：

1. 查看 [Issues](https://github.com/lmqvq/mq-ai-agent-frontend/issues) 确认问题未被报告
2. 创建新的 Issue，详细描述问题
3. 提供复现步骤和环境信息
4. 如果可能，提供截图或错误日志

### 功能建议

对于新功能建议：

1. 在 Issues 中描述功能需求
2. 说明功能的使用场景和价值
3. 讨论实现方案的可行性

### 代码贡献

1. **Fork 项目**
   ```bash
   git clone https://github.com/lmqvq/mq-ai-agent-frontend.git
   cd mq-ai-agent-frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **开发和测试**
   - 编写代码
   - 确保代码通过 ESLint 检查
   - 测试功能是否正常工作

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**
   - 详细描述您的更改
   - 说明更改的原因和影响
   - 如果相关，请引用相关的 Issue

## 📝 代码规范

### 代码风格

- 遵循 ESLint 配置的代码规范
- 使用 2 个空格进行缩进
- 使用有意义的变量和函数命名
- 添加必要的注释和文档

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

示例：
```
feat: 添加用户头像上传功能
fix: 修复登录状态持久化问题
docs: 更新 API 文档
```

### Vue 组件规范

- 使用 Composition API
- 组件名使用 PascalCase
- Props 使用 camelCase
- 事件名使用 kebab-case
- 合理使用 TypeScript 类型注解

## 🧪 测试

在提交代码前，请确保：

1. 代码通过 ESLint 检查：
   ```bash
   npm run lint
   ```

2. 功能在开发环境中正常工作：
   ```bash
   npm run serve
   ```

3. 构建过程无错误：
   ```bash
   npm run build
   ```

## 📖 开发环境设置

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### 推荐工具

- VS Code + Vetur 插件
- Vue DevTools 浏览器扩展

### 项目结构

请熟悉项目结构，确保新代码放在合适的位置：

```
src/
├── components/     # 可复用组件
├── views/         # 页面组件
├── stores/        # 状态管理
├── services/      # API 服务
├── router/        # 路由配置
└── styles/        # 样式文件
```

## 🎯 开发重点

### 优先级

1. **用户体验**: 确保功能易用、响应快速
2. **代码质量**: 保持代码清晰、可维护
3. **性能优化**: 关注加载速度和运行效率
4. **兼容性**: 支持主流浏览器

### 注意事项

- 保持 API 调用的一致性
- 确保响应式设计在各种设备上正常工作
- 注意 AI 对话功能的实时性和稳定性
- 维护良好的错误处理机制

## 📞 联系我们

如果您有任何问题或建议，可以通过以下方式联系我们：

- 创建 [Issue](https://github.com/lmqvq/mq-ai-agent-frontend/issues)
- 发送邮件至 [2097489731@qq.com](mailto:2097489731@qq.com)

再次感谢您的贡献！🎉
