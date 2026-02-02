<img width="1278" height="765" alt="image" src="https://github.com/user-attachments/assets/cea807d6-bb38-4a23-86d6-92cab68d980b" /># 🚀 Interactive AIGC Demo

> 基于 RAG 增强的 AI 内容生成演示项目 - 展示完整的 AIGC 工作流程

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

生成结果示例：

iamge:
<img width="1168" height="696" alt="image" src="https://github.com/user-attachments/assets/46409d28-0be2-431c-8462-a34258761aae" />

video:
<img width="1266" height="684" alt="image" src="https://github.com/user-attachments/assets/81e2e7fc-e047-4ec3-9666-bde8946374da" />

## ⚠️ 重要说明

**这是一个演示项目（Demo），用于展示 AIGC 应用的完整架构和工作流程。**

### 当前实现状态

✅ **已完整实现的功能**：
- 完整的数据库架构（Supabase + PostgreSQL）
- Row Level Security (RLS) 安全策略
- 匿名用户认证系统
- RAG 知识库检索
- 完整的生成流程管理（6 个步骤）
- 实时进度追踪
- 生成历史记录

⚠️ **使用 Mock 数据的部分**：
- **图片生成**：当前使用随机占位符图片（`picsum.photos`），**不会根据提示词生成真实图片**
- **视频生成**：使用示例视频文件
- **LLM 分析**：返回预设的分析结果
- **趋势搜索**：返回空数组

### 接入真实 API 的方法

要使用真实的 AI 生成功能，需要替换以下函数（位于 `pages/api/generate.js`）：

1. `analyzePromptWithClaude()` - 接入 Claude API
2. `searchTrends()` - 接入秘塔搜索 API
3. `generateImageWithTPU()` - 接入 Stable Diffusion / DALL-E / 算能 TPU
4. `generateVideoWithTPU()` - 接入视频生成 API

---

## 🎯 项目价值

### 1. 完整的 AIGC 应用架构
展示了一个生产级 AIGC 应用应该包含的所有组件：
- 用户认证与会话管理
- 数据持久化与安全策略
- RAG 知识库集成
- 异步任务处理
- 实时状态更新

### 2. 最佳实践示范
- ✅ Supabase Row Level Security (RLS)
- ✅ 匿名认证（无需注册即可使用）
- ✅ Service Role Key 用于后端操作
- ✅ 前后端分离架构
- ✅ 错误处理与日志记录

### 3. 可扩展的代码结构
- 清晰的文件组织
- 模块化的数据库操作
- 易于替换的 API 接口
- 完整的类型定义

### 4. 学习资源
适合用于：
- 学习 Next.js + Supabase 集成
- 理解 AIGC 应用的工作流程
- 了解 RAG 技术的实际应用
- 作为自己项目的起点

---

## 🏗️ 技术栈

- **前端框架**: Next.js 14 + React 18
- **数据库**: Supabase (PostgreSQL + RLS)
- **认证**: Supabase Anonymous Auth
- **API**: Next.js API Routes
- **部署**: Vercel (推荐)

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn
- Supabase 账号（免费）

### 1. 克隆项目

```bash
git clone https://github.com/bsfolfsfik-dotcom/interactive-aigc-demo.git
cd interactive-aigc-demo-main
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

#### 3.1 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息并创建

#### 3.2 执行数据库初始化

1. 在 Supabase Dashboard 中，点击左侧 SQL Editor
2. 点击 New query
3. 先执行向量扩展启用命令：
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
   点击 Run 等待执行成功
4. 复制项目中 `supabase/schema.sql` 的内容
5. 粘贴到 SQL Editor 中，点击 Run 完成数据库表初始化

#### 3.3 启用匿名认证

1. 在 Supabase Dashboard 中，点击 **Authentication** → **Providers**
2. 找到 **Anonymous Sign-ins**
3. 启用它

#### 3.4 获取 API 密钥

1. 点击 **Settings** → **API**
2. 复制以下信息：
   - Project URL
   - anon public key
   - service_role key（⚠️ 保密）

### 4. 配置环境变量

1. 进入项目根目录 `interactive-aigc-demo-main`（和`README.md`、`package.json`同目录）；
2. 在文件夹**空白处右键** → 新建 → 文本文档；
3. 右键新建的文本文档 → 重命名，**删除默认的`.txt`后缀**，直接输入 `.env.local`（开头的`.`必须保留）；
4. 弹出「重命名可能会导致文件不可用」的提示，直接点击**是**，完成文件创建。

双击打开新建的`.env.local`文件，复制以下内容粘贴进去，**替换成你自己的Supabase密钥**（直接覆盖文档内容，不用改格式）：

```env
# Supabase 配置（必填，依次对应3.4中复制的三条信息）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 其他 API（可选，当前使用 mock 数据）
ANTHROPIC_API_KEY=your_key_here
METASO_API_KEY=your_key_here
TPU_API_ENDPOINT=your_endpoint_here
TPU_API_KEY=your_key_here
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 📊 项目结构

```
3_interactive_aigc_demo/
├── pages/
│   ├── index.js              # 主页面（前端 UI）
│   └── api/
│       ├── generate.js       # 生成 API（核心逻辑）
│       ├── health.js         # 健康检查
│       ├── history.js        # 历史记录
│       └── configs.js        # 用户配置
├── lib/
│   └── supabase.js          # Supabase 客户端和数据库操作
├── supabase/
│   ├── schema.sql           # 数据库表结构
│   └── fix-rls.sql          # RLS 策略修复脚本
├── .env.example             # 环境变量示例
└── package.json
```

---

## 🔄 完整工作流程

### 用户视角

1. **访问页面** → 自动创建匿名用户会话
2. **输入提示词** → 例如："a beautiful cyberpunk city"
3. **点击生成** → 提交生成请求
4. **查看进度** → 实时显示 6 个处理步骤
5. **查看结果** → 显示生成的内容和元数据

### 系统流程

```
用户输入提示词
    ↓
1. 创建 generation 记录（status: pending）
    ↓
2. 异步处理开始（status: processing）
    ↓
3. Step 1: 解析用户意图（LLM 分析）
    ↓
4. Step 2: 搜索趋势（可选，基于关键词）
    ↓
5. Step 3: RAG 知识库检索（从 Supabase）
    ↓
6. Step 4: 增强提示词（结合 RAG 结果）
    ↓
7. Step 5: 生成图片（TPU/SD API）
    ↓
8. Step 6: 生成视频（可选）
    ↓
9. 更新 generation 记录（status: completed）
    ↓
前端轮询获取结果并展示
```

### 数据流

```
前端 (React)
    ↓ POST /api/generate
后端 API (Next.js)
    ↓ 写入数据
Supabase (PostgreSQL)
    ↓ RLS 验证
返回结果
    ↓ 轮询查询
前端更新 UI
```

---

## 📚 数据库架构

### 核心表

#### `generations` - 生成记录
```sql
- id: UUID (主键)
- user_id: TEXT (用户 ID)
- prompt: TEXT (用户输入)
- config: JSONB (配置参数)
- result_url: TEXT (结果 URL)
- status: TEXT (pending/processing/completed/failed)
- metadata: JSONB (元数据)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `generation_history` - 执行步骤
```sql
- id: UUID (主键)
- generation_id: UUID (关联 generations)
- step: TEXT (步骤名称)
- phase: TEXT (阶段：PARSE/SEARCH/RAG/TPU)
- status: TEXT (状态)
- duration_ms: INTEGER (耗时)
- metadata: JSONB (详细信息)
- created_at: TIMESTAMP
```

#### `knowledge_base` - RAG 知识库
```sql
- id: UUID (主键)
- style_name: TEXT (风格名称)
- category: TEXT (分类)
- prompt_template: TEXT (提示词模板)
- sd_params: JSONB (Stable Diffusion 参数)
- lora_configs: JSONB (LoRA 配置)
- metadata: JSONB (元数据)
```

#### `user_configs` - 用户配置
```sql
- id: UUID (主键)
- user_id: TEXT (用户 ID)
- name: TEXT (配置名称)
- config: JSONB (配置内容)
- is_favorite: BOOLEAN (是否收藏)
- tags: TEXT[] (标签)
```

### RLS 策略

所有表都启用了 Row Level Security：
- 使用 Supabase Auth 的 `authenticated` 角色
- 后端使用 `service_role` key 绕过 RLS
- 前端使用 `anon` key 受 RLS 保护

---

## 🎨 实操演示

### 场景 1：基本生成流程

1. 打开 http://localhost:3000
2. 看到页面显示 "Session ID: xxxxxxxx..."（自动创建的匿名用户）
3. 输入提示词：
   ```
   a beautiful sunset over the ocean
   ```
4. 点击 "Generate"
5. 观察进度显示：
   - ✓ Step 1: Parsing user intent (完成)
   - ✓ Step 2: RAG knowledge retrieval (完成)
   - ✓ Step 3: Enhancing prompt with RAG (完成)
   - ✓ Step 4: Generating image with TPU (完成)
6. 查看结果：
   - Status: completed
   - Enhanced Prompt: "photorealistic, highly detailed, professional photography, a beautiful sunset over the ocean"
   - Generated Image: 显示随机占位符图片

### 场景 2：查看数据库记录

1. 登录 Supabase Dashboard
2. 点击 **Table Editor**
3. 选择 `generations` 表
4. 看到刚才创建的记录，包含：
   - user_id（匿名用户 ID）
   - prompt（原始提示词）
   - status: completed
   - metadata（包含增强后的提示词）
5. 选择 `generation_history` 表
6. 看到该生成的所有执行步骤

### 场景 3：测试 RAG 知识库

1. 输入包含风格关键词的提示词：
   ```
   cyberpunk style robot
   ```
2. 生成完成后，查看 "Enhanced Prompt"
3. 应该看到提示词被增强为：
   ```
   cyberpunk style, neon lights, futuristic, dark atmosphere, high contrast, cyberpunk style robot
   ```
4. 这说明 RAG 从知识库中检索到了 "Cyberpunk" 风格的模板

### 场景 4：生成视频

1. 输入提示词
2. **勾选** "Generate video (takes longer)"
3. 点击 "Generate"
4. 等待完成（会多一个步骤：Generating video with SVD）
5. 结果中会显示视频播放器

---

## 🔧 自定义与扩展

### 1. 添加新的风格到知识库

在 Supabase SQL Editor 中执行：

```sql
INSERT INTO knowledge_base (style_name, category, prompt_template, sd_params, metadata)
VALUES (
  'Watercolor',
  'art',
  'watercolor painting style, soft colors, artistic, {subject}',
  '{"cfg_scale": 7.0, "steps": 25, "sampler": "Euler a"}',
  '{"tags": ["art", "watercolor", "painting"]}'
);
```

### 2. 接入真实的图片生成 API

编辑 `pages/api/generate.js`，替换 `generateImageWithTPU` 函数：

```javascript
async function generateImageWithTPU(prompt, params) {
  // 示例：接入 Replicate 的 Stable Diffusion
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'stability-ai/sdxl',
      input: {
        prompt: prompt,
        ...params
      }
    })
  });

  const data = await response.json();
  return {
    url: data.output[0],
    duration: data.metrics.predict_time * 1000
  };
}
```

### 3. 添加用户认证

当前使用匿名认证，如需真实用户系统：

1. 在 Supabase 启用 Email/OAuth 认证
2. 修改 `pages/index.js` 的 `initializeUser` 函数
3. 添加登录/注册 UI
4. 更新 RLS 策略以使用真实用户 ID

---

## 🐛 常见问题

### Q: 为什么图片和提示词不匹配？

**A**: 当前使用的是随机占位符图片服务，不会根据提示词生成真实图片。这是 Demo 的预期行为。要生成真实图片，需要接入 Stable Diffusion、DALL-E 等 API。

### Q: RLS 策略错误怎么办？

**A**: 执行 `supabase/fix-rls.sql` 脚本，或者在 SQL Editor 中运行：
```sql
ALTER TABLE generations DISABLE ROW LEVEL SECURITY;
```

### Q: 如何重置数据库？

**A**: 在 Supabase SQL Editor 中执行：
```sql
TRUNCATE generations, generation_history, user_configs CASCADE;
```

### Q: 匿名用户会话丢失怎么办？

**A**: 清除浏览器缓存或使用无痕模式，会自动创建新的匿名会话。

---

## 📈 性能优化建议

### 生产环境部署

1. **启用缓存**
   - 使用 Redis 缓存 RAG 检索结果
   - 缓存常用的风格模板

2. **优化数据库查询**
   - 为常用查询添加索引
   - 使用数据库连接池

3. **异步处理**
   - 使用消息队列（如 BullMQ）处理生成任务
   - 实现任务重试机制

4. **CDN 加速**
   - 将生成的图片/视频上传到 CDN
   - 使用 Vercel Edge Functions

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代品
- [Picsum Photos](https://picsum.photos/) - 占位符图片服务

---

## 📞 联系方式

- 项目地址: [GitHub](https://github.com/bsfolfsfik-dotcom/interactive-aigc-demo)
- 问题反馈: [Issues](https://github.com/bsfolfsfik-dotcom/interactive-aigc-demo/issues)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**






