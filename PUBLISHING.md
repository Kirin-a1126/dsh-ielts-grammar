# 发布指南

本文把 `dsh-ielts-grammar` 从本地开发包整理为可发布到 npm 和 DSH 插件市场的版本。

## 当前发布就绪状态

- 包名：`dsh-ielts-grammar`（未加 scope）
- 版本：`1.0.0`
- 许可证：MIT
- `private` 已移除，`publishConfig.access` 为 `public`
- 已声明 `dsh.bundle.patch` 与 `dsh.client`
- npm 运行时依赖：`nspell`、`dictionary-en`、`dictionary-en-gb`
- 发布包白名单在 `package.json` 的 `files` 中
- 发布前会自动执行全部测试（`prepublishOnly`）
- 2026-11-25 检查 npm registry 时该包名为 404，看起来可用；发布前请再确认一次

公开仓库已经创建：

```text
https://github.com/Kirin-a1126/dsh-ielts-grammar
```

仍需你完成：

1. 把代码上传到这个目前为空的仓库。
2. 你的 npm 账号与一次性发布授权。
3. 至少等待仓库创建满 24 小时，才能向 awesome-dsh-plugin 提 PR。
4. 一张真实界面截图（不是硬性门槛，但市场展示更好）。
5. 在各市场的实际提交动作。

## 1. 发布前本地检查

```powershell
# 全部测试
& 'C:\Users\xiaoh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' --test test/analyzer.test.mjs test/client.test.mjs test/host.test.mjs

# 语法检查
& 'C:\Users\xiaoh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' --check lib/analyzer.js
& 'C:\Users\xiaoh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' --check lib/index.js
& 'C:\Users\xiaoh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' --check lib/client.js
```

确认发布包内容（推荐先装好 npm，或用 DSH 自带 pnpm）：

```powershell
pnpm pack
tar -tf dsh-ielts-grammar-1.0.0.tgz
```

tarball 中应包含：

- `package.json`、`cordis.patch.yml`
- `lib/index.js`、`lib/analyzer.js`、`lib/lexicon.js`、`lib/client.js`
- `locale/en.json`、`locale/zh.json`、`icon.svg`
- `README.md`、`README.en.md`、`PUBLISHING.md`、`LICENSE`、`THIRD_PARTY_NOTICES.md`

不应包含 `node_modules/`、`test/`、日志或本地绝对路径文件。

## 2. 上传到公开 GitHub 仓库

仓库已存在且为空：

```text
https://github.com/Kirin-a1126/dsh-ielts-grammar
```

最简单的上传方式是网页上传。使用已排除 `node_modules` 的快照目录：

```text
D:\AI task\dsh-ielts-grammar-upload
```

在空仓库页面点 **uploading an existing file**，把该目录中的内容拖入并提交。仓库的 `package.json` 已包含：

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/Kirin-a1126/dsh-ielts-grammar.git"
},
"homepage": "https://github.com/Kirin-a1126/dsh-ielts-grammar#readme"
```

如果改用 Git 命令行：

```bash
git init
git add .
git commit -m "feat: initial IELTS grammar and lexis plugin"
git branch -M main
git remote add origin https://github.com/Kirin-a1126/dsh-ielts-grammar.git
git push -u origin main
```

然后在 GitHub 仓库的 **About → Topics** 中加入：

```text
dsh-plugin
deepseek-harness
dsh
ielts
ielts-writing
```

`dsh-plugin` topic 会被多个市场自动发现和静态校验。

## 3. 发布到 npm

先确认包名仍可用：

```bash
npm view dsh-ielts-grammar
```

如果返回 404，说明仍可发布。登录并发布：

```bash
npm login
npm publish --access public
```

发布后验证：

```bash
npm view dsh-ielts-grammar version
npm view dsh-ielts-grammar dsh.bundle
```

`npm publish` 会触发 `prepublishOnly` 中的测试。不要提交 npm token、密码或 `.env` 文件。

## 4. 提交插件市场

### DSH 内置市场 / dshmarket

内置市场的列表来自精选目录 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)，不是直接提交到 dshmarket 主仓库。

两种方式：

1. 给公开仓库加 `dsh-plugin` topic，等待自动抓取。
2. 向 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 提 PR，在目录中增加一个 YAML。不要向 dshmarket 主仓库提插件条目。

仓库创建满 24 小时后，在 awesome-dsh-plugin 的 fork 中添加：

```text
data/plugins/Kirin-a1126__dsh-ielts-grammar.yml
```

内容：

```yaml
url: https://github.com/Kirin-a1126/dsh-ielts-grammar
name: Kirin-a1126/dsh-ielts-grammar
category: tools
description:
  en: IELTS grammar checker and academic synonym replacer with a dedicated sidebar workspace.
  zh: 带侧栏工作台的雅思语法检测与学术同义替换插件。
```

可直接使用本仓库的 `marketplace/awesome-dsh-plugin-entry.yml` 和 `marketplace/PR.md`。

### dsh.so

在 [提交插件](https://www.dsh.so/zh/submit/) 粘贴 GitHub 仓库或 npm 包名。其公开的接受标准包括：

- `package.json` 中存在 `dsh` 字段
- README 带安装说明
- SPDX 可识别的开源许可证
- 仓库名 / 包名符合 `^[a-z0-9]+(-[a-z0-9]+)*$`
- 有可供安全扫描的源码
- 安全扫描无阻断级发现

当前插件均满足这些条件，剩下的是公开仓库、npm 发布和实际提交。

### 其他目录

`dsh.market`、`dshopen.org` 等聚合站通常会自动抓取带 `dsh-plugin` topic 的公开仓库；发布后等待抓取即可。

## 5. 发布后验证

在干净的 DSH 环境或新 profile 中执行：

```bash
dsh plugin add dsh-ielts-grammar
```

然后确认：

- 侧栏出现「雅思语法 / IELTS Grammar」
- 主面板可以打开
- 输入含拼写错误的句子能返回 `spelling-dictionary` 问题
- 同义替换建议可以点击应用
- 页面内没有外部网络请求

## 仍需人工确认

- GitHub 仓库所有者与仓库名
- npm 账号、2FA、发布 token
- market PR / 提交按钮的最终点击
- 是否添加真实截图、演示 GIF 和英文 Release notes

上述操作涉及你的账号和对外发布，本文只准备发布配置，不代为登录或提交。

## 参考

- [dsh.so 提交插件与接受标准](https://www.dsh.so/zh/submit/)
- [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
- [dshmarket](https://github.com/dsh-market/dsh-market)
- [第三方发布经验指南](https://cdn.jsdelivr.net/npm/dsh-document-view@1.1.1/docs/PUBLISHING.md)
