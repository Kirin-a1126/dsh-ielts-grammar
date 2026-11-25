/**
 * Browser half of dsh-ielts-grammar.
 *
 * A sidebar entry opens a full workspace with a draft editor and a live report.
 * Analysis comes from the package's local Host route; this module owns only the
 * view, replacement application and locale wiring.
 *
 * Plain factory bundle: no JSX and no build step.
 *
 * @module dsh-ielts-grammar/client
 */

window.__ModuleLoader__.load({
  id: 'dsh-ielts-grammar',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const React = require('react')
    const h = React.createElement

    const PANEL_ID = 'ielts-grammar'
    const NS = 'ieltsGrammar'
    const ROUTE = '/dsh-ielts-grammar/analyze'
    const STORAGE_KEY = 'dsh-ielts-grammar:draft'
    const MAX_TEXT_LENGTH = 20000

    const SAMPLE = [
      'Nowadays, a lot of people thinks that technology is more better for education. In my opinion, I think this is a important question.',
      'The government should discuss about how to use technology in the classroom, and they should provide informations to students. However, there are many problem with this approach.',
      'For example, some students use their phones too much and this have a negative effect on their study. In conclusion, technology is very good, but we must also consider the disadvantages.',
    ].join('\n\n')

    const EN = {
      'sidebar.label': 'IELTS Grammar',
      'hero.eyebrow': 'IELTS WRITING STUDIO',
      'hero.title': 'Grammar & Lexis Studio',
      'hero.subtitle': 'Paste a Task 2 draft. Check high-frequency grammar errors, then lift basic wording with one-click academic alternatives.',
      'hero.sample': 'Load sample',
      'hero.clear': 'Clear',
      'hero.copy': 'Copy draft',
      'hero.copied': 'Copied',
      'aria.editor': 'Essay draft',
      'aria.report': 'Analysis results',
      'aria.tabs': 'Analysis sections',
      'editor.title': 'Essay draft',
      'editor.words': '{n} words',
      'editor.placeholder': 'Paste or type your IELTS essay here. Analysis runs locally as you write.',
      'editor.footer': 'Rule-based check · runs locally',
      'editor.recheck': 'Re-check',
      'editor.checking': 'Checking…',
      'editor.shortcut': 'Ctrl / ⌘ + Enter',
      'report.title': 'Analysis',
      'report.grammarTab': 'Grammar',
      'report.upgradeTab': 'Upgrades',
      'report.grammarCount': '{n} flagged',
      'report.upgradeCount': '{n} ideas',
      'report.ready': 'Up to date',
      'report.loading': 'Analysing…',
      'report.idle': 'Waiting for a draft',
      'report.error': 'Analysis failed',
      'report.retry': 'Retry',
      'metric.grammar': 'Grammar',
      'metric.grammarSub': '{errors} errors · {warnings} warnings',
      'metric.upgrade': 'Upgrade ideas',
      'metric.upgradeSub': 'Lexical range',
      'metric.words': 'Words',
      'metric.wordsSub': '{sentences} sentences · {paragraphs} paragraphs',
      'health.label': 'Rule-check health',
      'health.value': '{n}/100',
      'health.note': 'A signal from this rule set, not an official IELTS band.',
      'grammar.emptyTitle': 'No high-frequency grammar issues found',
      'grammar.emptyBody': 'The rules cover agreement, articles, prepositions, uncountable nouns, common misspellings and punctuation. A clean result is not an official band score.',
      'grammar.locate': 'Locate',
      'grammar.apply': 'Apply',
      'grammar.remove': 'Remove',
      'grammar.fixHint': 'Click a suggestion to replace it in the draft.',
      'grammar.severity.error': 'Error',
      'grammar.severity.warning': 'Warning',
      'grammar.severity.style': 'Style',
      'category.spelling': 'Spelling',
      'category.mechanics': 'Mechanics',
      'category.agreement': 'Agreement',
      'category.article': 'Articles',
      'category.preposition': 'Verb pattern',
      'category.uncountable': 'Countability',
      'category.redundancy': 'Redundancy',
      'category.word-form': 'Word form',
      'category.conjunction': 'Conjunction',
      'category.style': 'Style',
      'upgrade.intro': 'Click an alternative to swap it into your draft. Check the note when countability matters.',
      'upgrade.emptyTitle': 'No upgrade ideas for this draft',
      'upgrade.emptyBody': 'The curated lexicon focuses on common IELTS basics. Keep your own precise topic vocabulary; not every word needs replacing.',
      'upgrade.kind.word': 'Word',
      'upgrade.kind.phrase': 'Phrase',
      'upgrade.kind.collocation': 'Collocation',
      'upgrade.band': 'B{n}',
      'upgrade.repeatedTitle': 'Words you repeat',
      'upgrade.repeatedBody': 'Content words that appear three or more times. Vary them when they are not your key term.',
      'upgrade.times': '{n}×',
      'empty.title': 'Check grammar. Lift your lexis.',
      'empty.body': 'Start with a sample to see how each issue is explained and replaced.',
      'empty.step1': 'Paste a Task 2 draft in the editor.',
      'empty.step2': 'Review grammar issues with a one-click fix.',
      'empty.step3': 'Swap basic words for academic alternatives.',
      'empty.sampleCta': 'Try the sample draft',
      'error.network': 'Could not reach the local analyser. Is the plugin route active?',
      'error.tooLong': 'This draft is too long for the checker (max {n} characters).',
      'error.invalid': 'The analyser returned an error. Try again.',
      'error.stale': 'The draft changed before the fix could apply. Please re-check.',
      'error.copy': 'Clipboard is unavailable. Select the draft and copy it manually.',
      'error.empty': 'Add at least a few words first.',
      'footer.disclaimer': 'Rule-based coverage: high-frequency IELTS errors only. Always review a suggestion in context.',
      'footer.privacy': 'Your draft is processed locally.',
    }

    const ZH = {
      'sidebar.label': '雅思语法',
      'hero.eyebrow': '雅思写作工作台',
      'hero.title': '语法与同义替换工作台',
      'hero.subtitle': '粘贴 Task 2 草稿：先查高频语法错误，再一键把基础表达升级为学术同义替换。',
      'hero.sample': '载入示例',
      'hero.clear': '清空',
      'hero.copy': '复制草稿',
      'hero.copied': '已复制',
      'aria.editor': '作文草稿',
      'aria.report': '检测结果',
      'aria.tabs': '结果分区',
      'editor.title': '作文草稿',
      'editor.words': '{n} 词',
      'editor.placeholder': '在这里粘贴或输入雅思作文，写作时会自动进行本地检测。',
      'editor.footer': '规则检测 · 本地运行',
      'editor.recheck': '重新检测',
      'editor.checking': '检测中…',
      'editor.shortcut': 'Ctrl / ⌘ + Enter',
      'report.title': '检测结果',
      'report.grammarTab': '语法',
      'report.upgradeTab': '同义替换',
      'report.grammarCount': '{n} 处',
      'report.upgradeCount': '{n} 条建议',
      'report.ready': '已更新',
      'report.loading': '分析中…',
      'report.idle': '等待草稿',
      'report.error': '分析失败',
      'report.retry': '重试',
      'metric.grammar': '语法',
      'metric.grammarSub': '{errors} 错误 · {warnings} 提醒',
      'metric.upgrade': '替换建议',
      'metric.upgradeSub': '词汇升级',
      'metric.words': '词数',
      'metric.wordsSub': '{sentences} 句 · {paragraphs} 段',
      'health.label': '规则检测健康度',
      'health.value': '{n}/100',
      'health.note': '仅反映本规则集的检测结果，不是官方雅思分数。',
      'grammar.emptyTitle': '未发现高频语法错误',
      'grammar.emptyBody': '当前规则覆盖主谓一致、冠词、介词、不可数名词、常见拼写和标点；无问题不等于官方评分。',
      'grammar.locate': '定位',
      'grammar.apply': '应用',
      'grammar.remove': '删除',
      'grammar.fixHint': '点击建议即可在草稿中替换。',
      'grammar.severity.error': '错误',
      'grammar.severity.warning': '提醒',
      'grammar.severity.style': '风格',
      'category.spelling': '拼写',
      'category.mechanics': '书写规范',
      'category.agreement': '主谓一致',
      'category.article': '冠词',
      'category.preposition': '动词搭配',
      'category.uncountable': '可数性',
      'category.redundancy': '重复表达',
      'category.word-form': '词形',
      'category.conjunction': '连词',
      'category.style': '风格',
      'upgrade.intro': '点击备选表达即可替换进草稿；涉及可数性时请先看说明。',
      'upgrade.emptyTitle': '这篇草稿暂无替换建议',
      'upgrade.emptyBody': '词库只覆盖常见基础表达；保留你准确的领域词汇，不必为了替换而替换。',
      'upgrade.kind.word': '单词',
      'upgrade.kind.phrase': '短语',
      'upgrade.kind.collocation': '搭配',
      'upgrade.band': 'B{n}',
      'upgrade.repeatedTitle': '高频重复词',
      'upgrade.repeatedBody': '出现三次及以上的实词。若它不是你的核心术语，可以考虑变化表达。',
      'upgrade.times': '{n} 次',
      'empty.title': '查语法，也升级表达。',
      'empty.body': '载入示例，看看每个问题如何解释与一键替换。',
      'empty.step1': '在左侧粘贴 Task 2 草稿。',
      'empty.step2': '查看语法问题，一键修复。',
      'empty.step3': '把基础词替换成学术表达。',
      'empty.sampleCta': '试用示例草稿',
      'error.network': '无法连接本地分析器，请确认插件路由已启用。',
      'error.tooLong': '草稿过长，检测上限为 {n} 字符。',
      'error.invalid': '分析器返回错误，请重试。',
      'error.stale': '草稿已变化，修复未能应用，请重新检测。',
      'error.copy': '剪贴板不可用，请手动选择复制。',
      'error.empty': '请先输入一些内容。',
      'footer.disclaimer': '规则覆盖范围有限，只检查高频雅思错误；请结合语境判断建议。',
      'footer.privacy': '草稿仅在本地处理。',
    }

    let boundTranslate = null
    let localeFace = null

    function interpolate (template, vars) {
      if (vars === undefined) return template
      return template.replace(/\{(\w+)\}/g, (whole, key) => (
        Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole
      ))
    }

    function t (key, vars) {
      let text = key
      try {
        text = boundTranslate === null ? (EN[key] ?? key) : boundTranslate(key)
      } catch {
        text = EN[key] ?? key
      }
      return interpolate(text, vars)
    }

    function activeLanguage () {
      try {
        const active = localeFace?.getLocale()?.active ?? 'en'
        return String(active).toLowerCase().startsWith('zh') ? 'zh' : 'en'
      } catch {
        return 'en'
      }
    }

    const CSS = `
.ig-panel {
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  color: var(--dsw-alias-label-primary);
  background:
    radial-gradient(900px 340px at 10% -12%, color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent), transparent 72%),
    var(--dsw-alias-bg-base);
  font-size: 14px;
  line-height: 1.6;
}
.ig-shell { max-width: 1240px; margin: 0 auto; padding: 26px 28px 60px; }
.ig-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.ig-eyebrow { display: inline-flex; align-items: center; gap: 7px; color: var(--dsw-alias-brand-primary); font-size: 10.5px; font-weight: 650; letter-spacing: .13em; }
.ig-title { margin: 7px 0 5px; font-size: 27px; line-height: 1.18; letter-spacing: -.025em; font-weight: 650; }
.ig-subtitle { margin: 0; max-width: 700px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.ig-hero-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding-top: 4px; }
.ig-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12.5px; font-weight: 520; cursor: pointer; transition: background .15s ease, border-color .15s ease, transform .15s ease; }
.ig-btn:hover { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l2); }
.ig-btn:active { transform: translateY(1px); }
.ig-btn:focus-visible, .ig-tab:focus-visible, .ig-fix:focus-visible, .ig-alt:focus-visible, .ig-locate:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.ig-btn[disabled] { opacity: .5; cursor: default; transform: none; }
.ig-btn-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
.ig-btn-primary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 84%, var(--dsw-alias-label-primary)); border-color: transparent; }
.ig-btn-small { padding: 6px 10px; font-size: 12px; }
.ig-icon { flex: none; }
.ig-grid { display: grid; grid-template-columns: minmax(0, 1.03fr) minmax(350px, .97fr); gap: 18px; align-items: start; }
.ig-card { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 15px; box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); overflow: hidden; }
.ig-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--dsw-alias-border-l1); background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent); }
.ig-card-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ig-card-title h2 { margin: 0; font-size: 13px; font-weight: 620; }
.ig-wordcount { color: var(--dsw-alias-label-secondary); font-size: 11.5px; white-space: nowrap; }
.ig-textarea { display: block; width: 100%; min-height: 438px; max-height: 62vh; box-sizing: border-box; resize: vertical; border: 0; outline: none; padding: 17px 18px; background: transparent; color: inherit; font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif; font-size: 15px; line-height: 1.82; }
.ig-textarea::placeholder { color: var(--dsw-alias-label-secondary); opacity: .78; }
.ig-editor-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 12px 9px 16px; border-top: 1px solid var(--dsw-alias-border-l1); background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 55%, transparent); }
.ig-foot-note { display: inline-flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.ig-foot-actions { display: flex; align-items: center; gap: 8px; }
.ig-shortcut { color: var(--dsw-alias-label-secondary); font-size: 10.5px; opacity: .8; }
.ig-report { display: flex; flex-direction: column; gap: 11px; min-width: 0; }
.ig-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ig-metric { padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
.ig-metric-value { font-size: 21px; line-height: 1.15; font-weight: 650; letter-spacing: -.02em; }
.ig-metric-label { margin-top: 2px; font-size: 10.5px; font-weight: 600; color: var(--dsw-alias-label-secondary); text-transform: uppercase; letter-spacing: .06em; }
.ig-metric-sub { margin-top: 3px; font-size: 10.5px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ig-report-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 3px; }
.ig-report-head h2 { margin: 0; font-size: 14px; font-weight: 620; }
.ig-live { display: inline-flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.ig-live-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsw-alias-state-success-primary); }
.ig-live[data-status="checking"] .ig-live-dot { background: var(--dsw-alias-state-warn-primary); animation: ig-pulse 1.2s ease-in-out infinite; }
.ig-live[data-status="error"] .ig-live-dot { background: var(--dsw-alias-state-error-primary); }
.ig-live[data-status="idle"] .ig-live-dot { background: var(--dsw-alias-state-idle-primary); }
@keyframes ig-pulse { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
.ig-health { padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px; background: var(--dsw-alias-bg-layer-1); }
.ig-health-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ig-health-label { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.ig-health-value { font-size: 12px; font-weight: 600; }
.ig-health-track { height: 5px; margin: 7px 0 6px; overflow: hidden; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); }
.ig-health-fill { height: 100%; border-radius: inherit; background: var(--dsw-alias-state-success-primary); transition: width .3s ease; }
.ig-health[data-tone="warn"] .ig-health-fill { background: var(--dsw-alias-state-warn-primary); }
.ig-health[data-tone="error"] .ig-health-fill { background: var(--dsw-alias-state-error-primary); }
.ig-health-note { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 10.5px; }
.ig-tabs { display: flex; gap: 4px; padding: 4px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px; background: var(--dsw-alias-bg-layer-1); }
.ig-tab { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 7px 9px; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; font-weight: 550; cursor: pointer; }
.ig-tab[aria-selected="true"] { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); }
.ig-tab-count { min-width: 18px; padding: 1px 5px; border-radius: 999px; background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); font-size: 10px; line-height: 1.5; }
.ig-tab[aria-selected="true"] .ig-tab-count { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent); color: var(--dsw-alias-brand-primary); }
.ig-pane { display: flex; flex-direction: column; gap: 9px; }
.ig-hint { margin: 1px 0 1px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
.ig-issue, .ig-upgrade { padding: 11px 12px; border: 1px solid var(--dsw-alias-border-l1); border-left: 3px solid var(--dsw-alias-state-warn-primary); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.ig-issue[data-severity="error"] { border-left-color: var(--dsw-alias-state-error-primary); }
.ig-issue[data-severity="warning"] { border-left-color: var(--dsw-alias-state-warn-primary); }
.ig-issue[data-severity="style"] { border-left-color: var(--dsw-alias-state-idle-primary); }
.ig-issue[data-active="true"] { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--dsw-alias-border-l1)); }
.ig-upgrade { border-left-color: var(--dsw-alias-brand-primary); }
.ig-item-head { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ig-chip { display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 7px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent); color: var(--dsw-alias-brand-primary); font-size: 9.5px; font-weight: 650; letter-spacing: .055em; text-transform: uppercase; }
.ig-criterion { display: inline-flex; border-radius: 5px; padding: 1px 5px; background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-secondary); font-size: 9px; font-weight: 650; letter-spacing: .05em; }
.ig-severity { color: var(--dsw-alias-label-secondary); font-size: 10px; }
.ig-severity[data-severity="error"] { color: var(--dsw-alias-state-error-primary); }
.ig-severity[data-severity="warning"] { color: var(--dsw-alias-state-warn-primary); }
.ig-locate { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; padding: 2px 3px; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 10.5px; cursor: pointer; }
.ig-locate:hover { color: var(--dsw-alias-brand-primary); }
.ig-msg { margin: 7px 0 6px; font-size: 12.5px; line-height: 1.55; }
.ig-context { margin: 0 0 8px; padding: 6px 8px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.55; overflow-wrap: anywhere; }
.ig-context mark { padding: 0 2px; border-radius: 3px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 26%, transparent); color: var(--dsw-alias-label-primary); }
.ig-upgrade .ig-context mark { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent); }
.ig-suggestions { display: flex; flex-wrap: wrap; gap: 5px; }
.ig-fix { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--dsw-alias-border-l1)); border-radius: 7px; background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 7%, transparent); color: var(--dsw-alias-state-success-primary); font: inherit; font-size: 11.5px; font-weight: 550; text-align: left; cursor: pointer; }
.ig-fix:hover { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent); }
.ig-fix-text { overflow-wrap: anywhere; }
.ig-explain { margin: 7px 0 0; color: var(--dsw-alias-label-secondary); font-size: 10.5px; line-height: 1.55; }
.ig-alt-grid { display: flex; flex-direction: column; gap: 5px; }
.ig-alt { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, var(--dsw-alias-border-l1)); border-radius: 7px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent); color: var(--dsw-alias-label-primary); font: inherit; text-align: left; cursor: pointer; }
.ig-alt:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent); }
.ig-alt-main { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
.ig-alt-text { font-size: 12px; font-weight: 560; overflow-wrap: anywhere; }
.ig-band { flex: none; padding: 1px 5px; border-radius: 4px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); color: var(--dsw-alias-brand-primary); font-size: 8.5px; font-weight: 700; letter-spacing: .03em; }
.ig-alt-note { color: var(--dsw-alias-label-secondary); font-size: 10px; line-height: 1.45; }
.ig-reason { margin: 7px 0 0; color: var(--dsw-alias-label-secondary); font-size: 10.5px; line-height: 1.55; }
.ig-repeats { margin-top: 4px; padding: 11px 12px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 10px; }
.ig-repeats h3 { margin: 0 0 3px; font-size: 12px; font-weight: 620; }
.ig-repeats p { margin: 0 0 8px; color: var(--dsw-alias-label-secondary); font-size: 10.5px; }
.ig-repeat-list { display: flex; flex-wrap: wrap; gap: 5px; }
.ig-repeat { display: inline-flex; align-items: center; gap: 5px; padding: 3px 7px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); font-size: 10.5px; }
.ig-repeat-count { color: var(--dsw-alias-label-secondary); }
.ig-repeat-alt { color: var(--dsw-alias-brand-primary); }
.ig-empty { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 20px 18px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 12px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent); }
.ig-empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); color: var(--dsw-alias-brand-primary); }
.ig-empty h3 { margin: 0; font-size: 14px; font-weight: 620; }
.ig-empty p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.65; }
.ig-steps { display: flex; flex-direction: column; gap: 6px; width: 100%; margin: 2px 0; padding: 0; list-style: none; }
.ig-step { display: flex; align-items: flex-start; gap: 8px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
.ig-step-n { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 17px; height: 17px; margin-top: 1px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font-size: 9px; font-weight: 650; }
.ig-empty .ig-btn { margin-top: 2px; }
.ig-error { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 14px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 34%, var(--dsw-alias-border-l1)); border-radius: 10px; background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent); }
.ig-error h3 { margin: 0; font-size: 12.5px; }
.ig-error p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
.ig-skeleton { display: flex; flex-direction: column; gap: 8px; }
.ig-skeleton-row { height: 52px; border-radius: 9px; background: linear-gradient(90deg, var(--dsw-alias-bg-layer-2) 20%, color-mix(in srgb, var(--dsw-alias-bg-layer-2) 55%, transparent) 45%, var(--dsw-alias-bg-layer-2) 70%); background-size: 220% 100%; animation: ig-shimmer 1.4s linear infinite; }
@keyframes ig-shimmer { from { background-position: 140% 0; } to { background-position: -80% 0; } }
.ig-banner { display: flex; align-items: center; gap: 7px; margin-bottom: 11px; padding: 8px 11px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 36%, var(--dsw-alias-border-l1)); border-radius: 9px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, transparent); color: var(--dsw-alias-label-primary); font-size: 11.5px; }
.ig-footer { display: flex; justify-content: space-between; gap: 18px; margin-top: 18px; color: var(--dsw-alias-label-secondary); font-size: 10.5px; line-height: 1.6; }
.ig-spin { animation: ig-spin .9s linear infinite; }
@keyframes ig-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .ig-live-dot, .ig-spin, .ig-skeleton-row { animation: none; }
  .ig-btn, .ig-health-fill { transition: none; }
}
@media (max-width: 980px) {
  .ig-grid { grid-template-columns: minmax(0, 1fr); }
  .ig-textarea { min-height: 300px; max-height: 46vh; }
}
@media (max-width: 680px) {
  .ig-shell { padding: 18px 14px 42px; }
  .ig-hero { flex-direction: column; gap: 12px; }
  .ig-hero-actions { justify-content: flex-start; }
  .ig-title { font-size: 23px; }
  .ig-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ig-shortcut { display: none; }
  .ig-footer { flex-direction: column; gap: 4px; }
}
`

    function injectStyle () {
      const id = 'dsh-ielts-grammar-style'
      if (document.getElementById(id) !== null) return () => {}
      const style = document.createElement('style')
      style.id = id
      style.textContent = CSS
      document.head.appendChild(style)
      return () => { style.remove() }
    }

    function svg (children, size, props) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        className: 'ig-icon',
        ...(props ?? {}),
      }, children)
    }

    function IconSpark ({ size = 14 }) {
      return svg([
        h('path', { key: 'a', d: 'M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.6l-1.6-5.4L5 10.6 10.4 9Z' }),
        h('path', { key: 'b', d: 'M18.5 15.5 19.2 18l2.3.8-2.3.7-.7 2.5-.7-2.5-2.3-.7 2.3-.8Z' }),
      ], size)
    }

    function IconRefresh ({ size = 14, spinning = false }) {
      return svg([
        h('path', { key: 'a', d: 'M20 11a8 8 0 1 0-2.3 5.7' }),
        h('path', { key: 'b', d: 'M20 4v7h-7' }),
      ], size, spinning ? { className: 'ig-icon ig-spin' } : undefined)
    }

    function IconCopy ({ size = 14 }) {
      return svg([
        h('rect', { key: 'a', x: 8, y: 8, width: 12, height: 12, rx: 2 }),
        h('path', { key: 'b', d: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2' }),
      ], size)
    }

    function IconTrash ({ size = 14 }) {
      return svg([
        h('path', { key: 'a', d: 'M4 7h16' }),
        h('path', { key: 'b', d: 'M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' }),
        h('path', { key: 'c', d: 'M6.5 7 7.4 20h9.2l.9-13' }),
        h('path', { key: 'd', d: 'M10 11v5M14 11v5' }),
      ], size)
    }

    function IconPlay ({ size = 13 }) {
      return svg([h('path', { key: 'a', d: 'm8 5 11 7-11 7Z' })], size)
    }

    function IconTarget ({ size = 12 }) {
      return svg([
        h('circle', { key: 'a', cx: 12, cy: 12, r: 7 }),
        h('circle', { key: 'b', cx: 12, cy: 12, r: 2.5 }),
        h('path', { key: 'c', d: 'M12 2v3M12 19v3M2 12h3M19 12h3' }),
      ], size)
    }

    function IconArrow ({ size = 12 }) {
      return svg([h('path', { key: 'a', d: 'M5 12h13M13 6l6 6-6 6' })], size)
    }

    function IconCheck ({ size = 18 }) {
      return svg([
        h('path', { key: 'a', d: 'M20 11.1V12a8 8 0 1 1-4.7-7.3' }),
        h('path', { key: 'b', d: 'm20 5-8.2 8.2L9 10.4' }),
      ], size, { strokeWidth: 1.9 })
    }

    function IconAlert ({ size = 14 }) {
      return svg([
        h('path', { key: 'a', d: 'M10.3 4.2 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z' }),
        h('path', { key: 'b', d: 'M12 9v4.5M12 17h.01' }),
      ], size)
    }

    /** The sidebar glyph: a draft with an A and a correction mark. */
    function Icon ({ size = 20, active = false }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.65,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        opacity: active ? 1 : 0.88,
        'aria-hidden': true,
      },
      h('path', { key: 'page', d: 'M6 3.5h8.5L19 8v12.5H6z' }),
      h('path', { key: 'fold', d: 'M14.5 3.5V8H19' }),
      h('path', { key: 'a', d: 'm9 16.8 2.4-5.8 2.4 5.8M10.1 14.6h2.6' }),
      h('path', { key: 'check', d: 'm15.6 18.6 1.3 1.3 2.2-2.6', stroke: 'currentColor' }))
    }

    function countWords (value) {
      return (value.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length
    }

    function makeContext (text, start, end) {
      let left = Math.max(0, start - 64)
      let right = Math.min(text.length, end + 64)
      while (left > 0 && !/\s/.test(text[left - 1])) left -= 1
      while (right < text.length && !/\s/.test(text[right])) right += 1
      const before = text.slice(left, start).replace(/\s+/g, ' ')
      const after = text.slice(end, right).replace(/\s+/g, ' ')
      return {
        before: (left > 0 ? '…' : '') + before,
        match: text.slice(start, end),
        after: after + (right < text.length ? '…' : ''),
      }
    }

    function healthTone (score) {
      if (score === null) return 'idle'
      if (score >= 80) return 'ok'
      if (score >= 60) return 'warn'
      return 'error'
    }

    function useLocaleRevision () {
      const [, setRevision] = React.useState(0)
      React.useEffect(() => {
        if (localeFace === null) return undefined
        return localeFace.subscribe(() => setRevision((value) => (value + 1) % 1000000))
      }, [])
    }

    function Button ({ onClick, children, disabled = false, primary = false, small = false, title }) {
      return h('button', {
        type: 'button',
        className: `ig-btn${primary ? ' ig-btn-primary' : ''}${small ? ' ig-btn-small' : ''}`,
        onClick,
        disabled,
        title,
      }, children)
    }

    function Metric ({ value, label, sub }) {
      return h('div', { className: 'ig-metric' },
        h('div', { className: 'ig-metric-value' }, value),
        h('div', { className: 'ig-metric-label' }, label),
        h('div', { className: 'ig-metric-sub', title: sub }, sub))
    }

    function StatusPill ({ status }) {
      const key = status === 'checking'
        ? 'report.loading'
        : status === 'error' ? 'report.error' : status === 'ready' ? 'report.ready' : 'report.idle'
      return h('span', { className: 'ig-live', 'data-status': status, 'aria-live': 'polite' },
        h('span', { className: 'ig-live-dot', key: 'dot' }),
        t(key))
    }

    function IssueCard ({ issue, text, active, onLocate, onApply }) {
      const language = activeLanguage()
      const context = makeContext(text, issue.start, issue.end)
      const message = issue.message?.[language] ?? issue.message?.en ?? ''
      const explanation = issue.explanation?.[language] ?? issue.explanation?.en ?? ''
      const category = t(`category.${issue.category}`)
      return h('article', {
        className: 'ig-issue',
        'data-severity': issue.severity,
        'data-active': active ? 'true' : 'false',
        'data-issue-id': issue.id,
      },
      h('div', { className: 'ig-item-head' },
        h('span', { className: 'ig-chip' }, category),
        h('span', { className: 'ig-criterion' }, issue.criterion),
        h('span', { className: 'ig-severity', 'data-severity': issue.severity }, t(`grammar.severity.${issue.severity}`)),
        h('button', {
          type: 'button',
          className: 'ig-locate',
          onClick: () => onLocate(issue),
          title: t('grammar.locate'),
        }, h(IconTarget, { key: 'i' }), t('grammar.locate'))),
      h('p', { className: 'ig-msg' }, message),
      h('p', { className: 'ig-context' },
        context.before,
        h('mark', { key: 'match' }, context.match),
        context.after),
      issue.suggestions.length > 0
        ? h('div', { className: 'ig-suggestions' }, issue.suggestions.map((suggestion, index) => h('button', {
          key: `${issue.id}-fix-${index}`,
          type: 'button',
          className: 'ig-fix',
          onClick: () => onApply(issue, suggestion),
          title: `${t('grammar.apply')}: ${suggestion === '' ? t('grammar.remove') : suggestion}`,
        },
        h(IconArrow, { key: 'arrow' }),
        h('span', { key: 'text', className: 'ig-fix-text' }, suggestion === '' ? t('grammar.remove') : suggestion))))
        : null,
      explanation !== '' ? h('p', { className: 'ig-explain' }, explanation) : null)
    }

    function UpgradeCard ({ upgrade, text, onLocate, onApply }) {
      const language = activeLanguage()
      const context = makeContext(text, upgrade.start, upgrade.end)
      const reason = upgrade.reason?.[language] ?? upgrade.reason?.en ?? ''
      return h('article', { className: 'ig-upgrade' },
        h('div', { className: 'ig-item-head' },
          h('span', { className: 'ig-chip' }, t(`upgrade.kind.${upgrade.kind}`)),
          h('span', { className: 'ig-criterion' }, 'LR'),
          h('button', {
            type: 'button',
            className: 'ig-locate',
            onClick: () => onLocate(upgrade),
            title: t('grammar.locate'),
          }, h(IconTarget, { key: 'i' }), t('grammar.locate'))),
        h('p', { className: 'ig-context' },
          context.before,
          h('mark', { key: 'match' }, context.match),
          context.after),
        h('div', { className: 'ig-alt-grid' }, upgrade.alternatives.map((alternative, index) => h('button', {
          key: `${upgrade.id}-alt-${index}`,
          type: 'button',
          className: 'ig-alt',
          onClick: () => onApply(upgrade, alternative.text),
          title: `${t('grammar.apply')}: ${alternative.text}`,
        },
        h('span', { key: 'main', className: 'ig-alt-main' },
          h('span', { key: 'text', className: 'ig-alt-text' }, alternative.text),
          h('span', { key: 'band', className: 'ig-band' }, t('upgrade.band', { n: alternative.band }))),
        h('span', { key: 'note', className: 'ig-alt-note' }, alternative.note?.[language] ?? alternative.note?.en ?? '')))),
        reason !== '' ? h('p', { className: 'ig-reason' }, reason) : null)
    }

    function EmptyState ({ title, body, icon = 'spark', children }) {
      return h('div', { className: 'ig-empty' },
        h('span', { className: 'ig-empty-icon' }, icon === 'check' ? h(IconCheck, { key: 'i' }) : h(IconSpark, { key: 'i' })),
        h('h3', null, title),
        h('p', null, body),
        children)
    }

    function ErrorPanel ({ code, onRetry }) {
      const messageKey = code === 'tooLong' ? 'error.tooLong' : code === 'network' ? 'error.network' : 'error.invalid'
      return h('div', { className: 'ig-error' },
        h('div', { className: 'ig-item-head' }, h(IconAlert, { key: 'i' }), h('h3', null, t('report.error'))),
        h('p', null, t(messageKey, { n: MAX_TEXT_LENGTH })),
        h(Button, { small: true, onClick: onRetry }, h(IconRefresh, { key: 'i', size: 13 }), t('report.retry')))
    }

    function Panel () {
      useLocaleRevision()
      const [text, setText] = React.useState(() => {
        try {
          return window.localStorage.getItem(STORAGE_KEY) ?? ''
        } catch {
          return ''
        }
      })
      const [report, setReport] = React.useState(null)
      const [status, setStatus] = React.useState('idle')
      const [errorCode, setErrorCode] = React.useState('')
      const [actionError, setActionError] = React.useState('')
      const [tab, setTab] = React.useState('grammar')
      const [activeId, setActiveId] = React.useState('')
      const [copied, setCopied] = React.useState(false)
      const debounce = React.useRef(null)
      const textarea = React.useRef(null)
      const copyTimer = React.useRef(null)
      const requestSequence = React.useRef(0)

      React.useEffect(() => () => {
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
      }, [])

      React.useEffect(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY, text)
        } catch {
          // Ignore storage failures.
        }
      }, [text])

      async function runAnalysis (value) {
        if (value.trim() === '') {
          setStatus('idle')
          setReport(null)
          setErrorCode('')
          return
        }
        const requestId = requestSequence.current + 1
        requestSequence.current = requestId
        setStatus('checking')
        setErrorCode('')
        setActionError('')
        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 10000)
        try {
          const response = await window.fetch(ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: value }),
            signal: controller.signal,
          })
          let payload = null
          try {
            payload = await response.json()
          } catch {
            payload = null
          }
          if (!response.ok) {
            const code = response.status === 413 ? 'tooLong' : payload?.error === 'TEXT_REQUIRED' ? 'empty' : 'invalid'
            throw Object.assign(new Error(code), { code })
          }
          if (requestId !== requestSequence.current) return
          setReport(payload)
          setStatus('ready')
        } catch (cause) {
          if (requestId !== requestSequence.current) return
          const offline = cause instanceof TypeError || cause?.name === 'AbortError'
          const code = cause?.code === 'tooLong' ? 'tooLong' : offline ? 'network' : 'invalid'
          setErrorCode(code)
          setStatus('error')
        } finally {
          window.clearTimeout(timeout)
        }
      }

      React.useEffect(() => {
        // Invalidate any request that is still in flight for the previous draft
        // before the debounce delay elapses.
        requestSequence.current += 1
        if (text.trim() === '') {
          setStatus('idle')
          setReport(null)
          setErrorCode('')
          return undefined
        }
        setStatus('checking')
        const handle = window.setTimeout(() => {
          debounce.current = null
          runAnalysis(text)
        }, 420)
        debounce.current = handle
        return () => {
          window.clearTimeout(handle)
          if (debounce.current === handle) debounce.current = null
        }
        // runAnalysis reads only stable state setters and requestSequence.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [text])

      const liveWords = countWords(text)
      const stats = report?.stats
      const grammarScore = stats?.grammarScore ?? null
      const score = grammarScore === null ? 0 : grammarScore
      const tone = healthTone(grammarScore)

      function analyzeNow () {
        if (debounce.current !== null) {
          window.clearTimeout(debounce.current)
          debounce.current = null
        }
        if (text.trim() === '') {
          setActionError('empty')
          return
        }
        runAnalysis(text)
      }

      function applyReplacement (item, replacement) {
        setActionError('')
        if (text.slice(item.start, item.end) !== item.original) {
          setActionError('stale')
          return
        }
        setText(text.slice(0, item.start) + replacement + text.slice(item.end))
        setActiveId('')
      }

      function locate (item) {
        const element = textarea.current
        if (element === null) return
        setActiveId(item.id)
        element.focus()
        element.setSelectionRange(item.start, item.end)
        const ratio = item.start / Math.max(1, text.length)
        element.scrollTop = Math.max(0, ratio * element.scrollHeight - element.clientHeight * 0.35)
      }

      async function copyDraft () {
        if (text.trim() === '') {
          setActionError('empty')
          return
        }
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
          copyTimer.current = window.setTimeout(() => setCopied(false), 1800)
        } catch {
          setActionError('copy')
        }
      }

      function loadSample () {
        setText(SAMPLE)
        setTab('grammar')
        setActionError('')
        setActiveId('')
        window.requestAnimationFrame?.(() => textarea.current?.focus())
      }

      function clearDraft () {
        setText('')
        setReport(null)
        setStatus('idle')
        setErrorCode('')
        setActionError('')
        setActiveId('')
        window.requestAnimationFrame?.(() => textarea.current?.focus())
      }

      function onKeyDown (event) {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          analyzeNow()
        }
      }

      const grammar = report?.grammar ?? []
      const upgrades = report?.upgrades ?? []
      const hasDraft = text.trim() !== ''
      const list = tab === 'grammar' ? grammar : upgrades

      let reportBody
      if (!hasDraft) {
        reportBody = h(EmptyState, {
          title: t('empty.title'),
          body: t('empty.body'),
          icon: 'spark',
        },
        h('ul', { className: 'ig-steps' },
          [t('empty.step1'), t('empty.step2'), t('empty.step3')].map((step, index) => h('li', {
            className: 'ig-step',
            key: `step-${index}`,
          }, h('span', { className: 'ig-step-n', key: 'n' }, String(index + 1)), step))),
        h(Button, { primary: true, small: true, onClick: loadSample },
          h(IconPlay, { key: 'i', size: 12 }),
          t('empty.sampleCta')))
      } else if (status === 'error' && report === null) {
        reportBody = h(ErrorPanel, { code: errorCode, onRetry: analyzeNow })
      } else if (report === null && status === 'checking') {
        reportBody = h('div', { className: 'ig-skeleton' },
          h('div', { className: 'ig-skeleton-row', key: 'a' }),
          h('div', { className: 'ig-skeleton-row', key: 'b' }),
          h('div', { className: 'ig-skeleton-row', key: 'c' }))
      } else if (report === null) {
        reportBody = h(EmptyState, {
          title: t('empty.title'),
          body: t('empty.body'),
          icon: 'spark',
        })
      } else {
        reportBody = h(React.Fragment, null,
          h('div', { className: 'ig-health', 'data-tone': tone },
            h('div', { className: 'ig-health-row' },
              h('span', { className: 'ig-health-label' }, t('health.label')),
              h('span', { className: 'ig-health-value' }, grammarScore === null ? '—' : t('health.value', { n: grammarScore }))),
            h('div', { className: 'ig-health-track' },
              h('div', { className: 'ig-health-fill', style: { width: `${grammarScore === null ? 0 : score}%` } })),
            h('p', { className: 'ig-health-note' }, t('health.note'))),
          h('div', { className: 'ig-tabs', role: 'tablist', 'aria-label': t('aria.tabs') },
            h('button', {
              key: 'grammar',
              type: 'button',
              role: 'tab',
              className: 'ig-tab',
              'aria-selected': tab === 'grammar' ? 'true' : 'false',
              onClick: () => setTab('grammar'),
            }, t('report.grammarTab'), h('span', { key: 'c', className: 'ig-tab-count' }, String(grammar.length))),
            h('button', {
              key: 'upgrades',
              type: 'button',
              role: 'tab',
              className: 'ig-tab',
              'aria-selected': tab === 'upgrades' ? 'true' : 'false',
              onClick: () => setTab('upgrades'),
            }, t('report.upgradeTab'), h('span', { key: 'c', className: 'ig-tab-count' }, String(upgrades.length)))),
          h('div', { className: 'ig-pane', role: 'tabpanel', 'aria-label': t(tab === 'grammar' ? 'report.grammarTab' : 'report.upgradeTab') },
            tab === 'grammar' && grammar.length > 0
              ? h('p', { className: 'ig-hint' }, t('grammar.fixHint'))
              : null,
            tab === 'grammar' && grammar.length === 0
              ? h(EmptyState, {
                title: t('grammar.emptyTitle'),
                body: t('grammar.emptyBody'),
                icon: 'check',
              })
              : null,
            tab === 'grammar'
              ? grammar.map((issue) => h(IssueCard, {
                key: issue.id,
                issue,
                text,
                active: activeId === issue.id,
                onLocate: locate,
                onApply: applyReplacement,
              }))
              : null,
            tab === 'upgrades' && upgrades.length > 0
              ? h('p', { className: 'ig-hint' }, t('upgrade.intro'))
              : null,
            tab === 'upgrades' && upgrades.length === 0
              ? h(EmptyState, {
                title: t('upgrade.emptyTitle'),
                body: t('upgrade.emptyBody'),
                icon: 'check',
              })
              : null,
            tab === 'upgrades'
              ? upgrades.map((upgrade) => h(UpgradeCard, {
                key: upgrade.id,
                upgrade,
                text,
                onLocate: locate,
                onApply: applyReplacement,
              }))
              : null,
            tab === 'upgrades' && report.repeated?.length > 0
              ? h('section', { className: 'ig-repeats' },
                h('h3', null, t('upgrade.repeatedTitle')),
                h('p', null, t('upgrade.repeatedBody')),
                h('div', { className: 'ig-repeat-list' }, report.repeated.map((entry) => h('span', {
                  key: entry.term,
                  className: 'ig-repeat',
                },
                h('span', { key: 'term' }, entry.term),
                h('span', { key: 'count', className: 'ig-repeat-count' }, t('upgrade.times', { n: entry.count })),
                entry.alternatives.length > 0
                  ? h('span', { key: 'alt', className: 'ig-repeat-alt' }, `→ ${entry.alternatives[0]}`)
                  : null))))
              : null))
      }

      const statusText = status === 'checking'
        ? t('editor.checking')
        : t('editor.recheck')

      return h('div', { className: 'ig-panel' },
        h('div', { className: 'ig-shell' },
          h('header', { className: 'ig-hero' },
            h('div', null,
              h('div', { className: 'ig-eyebrow' }, h(IconSpark, { key: 'i', size: 13 }), t('hero.eyebrow')),
              h('h1', { className: 'ig-title' }, t('hero.title')),
              h('p', { className: 'ig-subtitle' }, t('hero.subtitle'))),
            h('div', { className: 'ig-hero-actions' },
              h(Button, { onClick: loadSample }, h(IconSpark, { key: 'i', size: 13 }), t('hero.sample')),
              h(Button, { onClick: clearDraft, disabled: text.length === 0 }, h(IconTrash, { key: 'i', size: 13 }), t('hero.clear')),
              h(Button, { onClick: copyDraft, disabled: text.length === 0 }, h(IconCopy, { key: 'i', size: 13 }), copied ? t('hero.copied') : t('hero.copy')))),
          actionError !== ''
            ? h('div', { className: 'ig-banner', role: 'status' }, h(IconAlert, { key: 'i', size: 13 }), t(`error.${actionError}`))
            : null,
          h('div', { className: 'ig-grid' },
            h('section', { className: 'ig-card ig-editor-card', 'aria-label': t('aria.editor') },
              h('div', { className: 'ig-card-head' },
                h('div', { className: 'ig-card-title' },
                  h('span', { className: 'ig-chip' }, 'GRA + LR'),
                  h('h2', null, t('editor.title'))),
                h('span', { className: 'ig-wordcount' }, t('editor.words', { n: liveWords }))),
              h('textarea', {
                ref: textarea,
                className: 'ig-textarea',
                value: text,
                placeholder: t('editor.placeholder'),
                spellCheck: false,
                'aria-label': t('aria.editor'),
                onChange: (event) => {
                  setText(event.target.value)
                  setActionError('')
                },
                onKeyDown,
              }),
              h('div', { className: 'ig-editor-foot' },
                h('span', { className: 'ig-foot-note' }, h('span', { className: 'ig-live-dot', key: 'dot' }), t('editor.footer')),
                h('div', { className: 'ig-foot-actions' },
                  h('span', { className: 'ig-shortcut' }, t('editor.shortcut')),
                  h(Button, {
                    primary: true,
                    small: true,
                    onClick: analyzeNow,
                    disabled: status === 'checking',
                  }, h(IconRefresh, { key: 'i', size: 12, spinning: status === 'checking' }), statusText)))),
            h('aside', { className: 'ig-report', 'aria-label': t('aria.report') },
              h('div', { className: 'ig-metrics' },
                h(Metric, {
                  value: stats === undefined ? (hasDraft ? '—' : 0) : stats.issueCount,
                  label: t('metric.grammar'),
                  sub: t('metric.grammarSub', {
                    errors: stats?.errors ?? 0,
                    warnings: stats?.warnings ?? 0,
                  }),
                }),
                h(Metric, {
                  value: stats === undefined ? (hasDraft ? '—' : 0) : stats.upgradeCount,
                  label: t('metric.upgrade'),
                  sub: t('metric.upgradeSub'),
                }),
                h(Metric, {
                  value: stats === undefined ? liveWords : stats.words,
                  label: t('metric.words'),
                  sub: t('metric.wordsSub', {
                    sentences: stats?.sentences ?? 0,
                    paragraphs: stats?.paragraphs ?? 0,
                  }),
                })),
              h('div', { className: 'ig-report-head' },
                h('h2', null, t('report.title')),
                h(StatusPill, { status })),
              status === 'error' && report !== null
                ? h('div', { className: 'ig-banner', role: 'status' }, h(IconAlert, { key: 'i', size: 13 }), t(`error.${errorCode}`))
                : null,
              reportBody)),
          h('footer', { className: 'ig-footer' },
            h('span', null, t('footer.disclaimer')),
            h('span', null, t('footer.privacy')))))
    }

    function apply (ctx) {
      boundTranslate = ctx.locale.bind(NS)
      localeFace = ctx.locale

      ctx.effect(() => {
        const disposers = [
          ctx.locale.register(NS, 'en', EN),
          ctx.locale.register(NS, 'zh', ZH),
          ctx.locale.register(NS, 'zh-CN', ZH),
        ]
        return () => {
          for (const dispose of disposers) dispose()
        }
      }, 'ielts-grammar: locale')

      ctx.effect(() => injectStyle(), 'ielts-grammar: styles')

      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
      }, Panel))

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 31,
        label: () => t('sidebar.label'),
      }, Icon))
    }

    exports.name = 'ielts-grammar-ui'
    exports.inject = ['slots', 'locale']
    exports.apply = apply
    exports.PANEL_ID = PANEL_ID
    exports.ROUTE = ROUTE
    exports.__test = {
      Panel,
      IssueCard,
      UpgradeCard,
      Icon,
      makeContext,
      countWords,
      healthTone,
      EN,
      ZH,
    }

    return exports
  },
})
