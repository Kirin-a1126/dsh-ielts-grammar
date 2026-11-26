# awesome-dsh-plugin PR

提交时只新增一个文件到 awesome-dsh-plugin 仓库：

```text
data/plugins/Kirin-a1126__dsh-ielts-grammar.yml
```

文件内容复制 [awesome-dsh-plugin-entry.yml](./awesome-dsh-plugin-entry.yml)。

## PR 标题

```text
Add Kirin-a1126/dsh-ielts-grammar
```

## PR 正文

```markdown
- [x] I added one file at `data/plugins/Kirin-a1126__dsh-ielts-grammar.yml`.
- [x] My repo's `package.json` declares `dsh.bundle` and a `cordis.patch.yml`.
- [x] My repo is public and will be at least 1 day old when this PR is reviewed.
- [x] `category: tools` — an IELTS grammar and lexis workspace with a sidebar panel.
- [x] The description states what the plugin does, without superlatives.
- [x] My repo has the `dsh-plugin` topic.

The plugin adds a sidebar workspace that checks IELTS Writing Task 2 drafts for
high-frequency grammar and spelling errors, offers one-click fixes, and suggests
curated academic synonyms and expressions. Analysis is local: it uses a Host
route and British/American Hunspell dictionaries, with no model call or external
upload. A prebuilt `v1.0.1` tarball is attached to the GitHub Release and is
declared in the entry.
```

## 提交前检查

- [ ] 公开仓库已上传代码
- [ ] 仓库至少创建满 24 小时
- [ ] 仓库已添加 `dsh-plugin` topic
- [ ] `dsh.bundle` 与 `cordis.patch.yml` 可从默认分支读取
- [ ] 未修改 awesome-dsh-plugin 生成的 README 或其他条目
- [ ] PR 只新增一个 YAML 文件

仓库创建时间约为 `2026-11-25T13:46:47Z`，满足 24 小时门槛的时间约为
`2026-11-26T13:46:47Z`（北京时间 2026-11-26 21:46 左右）。
