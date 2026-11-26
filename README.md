# 雅思语法与同义替换 · dsh-ielts-grammar

一个带左侧栏入口的 DeepSeek Harness 插件：在 DSH 内直接检查雅思 Task 2 草稿的高频语法问题，并把基础词汇升级为更准确的学术表达。

[English README](./README.en.md) · [GitHub](https://github.com/Kirin-a1126/dsh-ielts-grammar) · [Release v1.0.1](https://github.com/Kirin-a1126/dsh-ielts-grammar/releases/tag/v1.0.1)

![icon](./icon.svg)

## 功能

- **侧栏工作台**：左侧栏新增「雅思语法」入口，点击进入全宽编辑页，不占用对话空间。
- **实时语法检测**：输入停顿 420ms 后自动检测；也可点击「重新检测」或按 `Ctrl / ⌘ + Enter`。
- **通用拼写检测**：同时加载英式与美式 Hunspell 词典，能发现词表外的拼写错误，并按编辑距离给出更正建议。
- **一键修复**：每个问题显示语境、原因和可点击替换项；点击后直接改写草稿并重新检测。
- **同义替换**：按单词、短语、搭配分类给出 Band 7–9 的学术备选，并标注可数性等使用条件。
- **重复词提示**：列出出现三次以上的实词，减少 `people / technology / problem` 等词的机械重复。
- **本地运行**：分析在 DSH Host 进程中完成，不上传草稿，不调用模型，也没有额外 API Key。
- **双语界面**：跟随 DSH 语言设置切换中英文；颜色全部来自主题 token，适配明暗主题。
- **草稿保留**：草稿保存在浏览器 localStorage，刷新页面或切换页面后仍可继续。

## 检测范围

规则库聚焦雅思写作中的高频、可解释错误，而不是替代完整语法解析器。

| 类别 | 示例 |
| --- | --- |
| 主谓一致 | `people thinks`、`this have`、`there is many` |
| 冠词 | `a important`、`an university`、`He is teacher` |
| 可数性 | `informations`、`a advice`、`much students`、`less people` |
| 动词/介词搭配 | `discuss about`、`depends of`、`capable to` |
| 数量结构 | `one of the student`、`the number of people are` |
| 冗余与词形 | `In my opinion, I think`、`more better`、`although … but` |
| 拼写与标点 | 精选高频错误 + 英式/美式词典通用拼写检查、标点前后空格、小写 `i` |
| 词汇升级 | `important → crucial / pivotal`、`a lot of → a considerable number of` |

拼写检查同时接受英式与美式写法（如 `colour / color`、`organise / organize`）。人名、地名、缩写等大写开头的专有名词默认跳过；句首的大写词只在存在高置信度常见更正时提示。专业术语若被误报，可以忽略，也可以加入 `lib/analyzer.js` 的 `SPELL_ALLOWLIST`。

> 结果来自固定规则集与本地词典，不代表官方雅思分数。建议始终结合语境判断是否替换，尤其是涉及可数性和语义细微差别时。

## 安装

### 从插件市场安装

在 DSH 的 **插件 → 市场 / 发现** 中搜索：

- 中文：**雅思语法与同义替换**
- English: **IELTS Grammar & Lexis**

市场的预构建安装包来自 [GitHub Release v1.0.1](https://github.com/Kirin-a1126/dsh-ielts-grammar/releases/tag/v1.0.1)，不需要额外从源码构建。安装后侧栏入口 id 为 `ielts-grammar`；若入口没有立即出现，刷新 DSH Web 页面。

### 本地开发安装

在 DSH 中让 Agent 使用插件管理器安装本目录：

```text
plugin_manager action=install_bundle target=D:\AI task\dsh-ielts-grammar
```

### 兼容性

- 已在 DSH `0.2.1-rc.5` 上完成侧栏、主面板、分析路由和拼写词典的实测。
- Node.js 需为 18 或更高版本。
- 仅支持 Web 平台；侧栏与主面板通过 Client slot 注册。

## 使用

1. 点击左侧栏「雅思语法」。
2. 粘贴作文草稿，或点「载入示例」查看每类问题。
3. 在右侧「语法」页点击建议，或在「同义替换」页选择学术表达。
4. 应用后自动重新检测；顶部「复制草稿」可复制当前全文。

## 隐私与安全

- 草稿只发送到本机的同源 Host 路由 `/dsh-ielts-grammar/analyze`，不上传、不访问第三方服务。
- 分析过程不调用模型，不需要 API Key。
- 请求体限制为 128 KiB，文本上限 20,000 字符。
- 运行时依赖仅为 `nspell`、`dictionary-en`、`dictionary-en-gb`，许可证见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

## 开发

```powershell
# 语法检查与测试（使用 DSH 自带 Node）
& 'C:\Users\xiaoh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' --test test/analyzer.test.mjs test/client.test.mjs test/host.test.mjs
```

```text
lib/analyzer.js   规则引擎 + 本地拼写词典（纯函数，可单测）
lib/lexicon.js    同义替换词库
lib/index.js      Host 路由 /dsh-ielts-grammar/analyze
lib/client.js     侧栏入口、主面板与本地化
```

拼写依赖 `nspell`、`dictionary-en` 与 `dictionary-en-gb`，许可证与来源见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

发布到 npm、GitHub 和插件市场的步骤见 [PUBLISHING.md](./PUBLISHING.md)。

## License

MIT
