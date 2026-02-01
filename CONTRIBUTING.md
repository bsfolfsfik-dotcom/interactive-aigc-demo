# 贡献指南

感谢你对 Interactive AIGC Demo 项目的关注！

## 🤝 如何贡献

### 报告 Bug

如果你发现了 bug，请：

1. 检查 [Issues](https://github.com/your-username/interactive-aigc-demo/issues) 中是否已有相同问题
2. 如果没有，创建新的 Issue，包含：
   - 清晰的标题
   - 详细的问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（Node.js 版本、浏览器等）
   - 截图或错误日志（如果有）

### 提出新功能

1. 先创建 Issue 讨论你的想法
2. 等待维护者反馈
3. 获得批准后再开始开发

### 提交代码

1. **Fork 本仓库**
   ```bash
   # 点击 GitHub 页面右上角的 Fork 按钮
   ```

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/your-username/interactive-aigc-demo.git
   cd interactive-aigc-demo
   ```

3. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **进行开发**
   - 遵循现有的代码风格
   - 添加必要的注释
   - 确保代码可以正常运行

5. **测试你的更改**
   ```bash
   npm run dev
   # 在浏览器中测试功能
   ```

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   # 或
   git commit -m "fix: resolve issue #123"
   ```

   提交信息格式：
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `style:` 代码格式调整
   - `refactor:` 代码重构
   - `test:` 测试相关
   - `chore:` 构建/工具相关

7. **推送到你的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建 Pull Request**
   - 访问你的 Fork 页面
   - 点击 "New Pull Request"
   - 填写 PR 描述，说明你的更改
   - 等待 Review

## 📝 代码规范

### JavaScript/React

- 使用 ES6+ 语法
- 使用函数式组件和 Hooks
- 保持组件简洁，单一职责
- 添加必要的注释

### 文件命名

- 组件文件：`PascalCase.js`
- 工具函数：`camelCase.js`
- API 路由：`kebab-case.js`

### 代码风格

```javascript
// ✅ 好的示例
async function fetchData(id) {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('id', id);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// ❌ 避免
async function fetchData(id){
const data=await supabase.from('table').select('*').eq('id',id)
return data
}
```

## 🧪 测试

目前项目还没有自动化测试，但请确保：

- [ ] 代码可以正常运行
- [ ] 没有控制台错误
- [ ] 功能符合预期
- [ ] 不影响现有功能

## 📚 文档

如果你的更改涉及：

- 新功能 → 更新 README.md
- API 变更 → 更新相关文档
- 配置变更 → 更新 .env.example

## ❓ 需要帮助？

- 查看 [README.md](README.md)
- 查看现有的 [Issues](https://github.com/your-username/interactive-aigc-demo/issues)
- 创建新的 Issue 提问

## 🎯 优先级

当前最需要的贡献：

1. **接入真实 AI API**
   - Stable Diffusion
   - DALL-E
   - Claude API

2. **UI/UX 改进**
   - 更好的加载动画
   - 响应式设计
   - 暗色模式

3. **功能增强**
   - 图片编辑功能
   - 批量生成
   - 导出功能

4. **文档完善**
   - 更多示例
   - 视频教程
   - API 文档

## 📜 行为准则

- 尊重他人
- 保持友好和专业
- 接受建设性批评
- 关注项目目标

---

再次感谢你的贡献！🎉
