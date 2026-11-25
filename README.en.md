# IELTS Grammar & Lexis · dsh-ielts-grammar

A DeepSeek Harness plugin with a dedicated sidebar workspace for checking IELTS
Writing Task 2 drafts and upgrading basic wording to more precise academic
English.

[中文说明](./README.md) · [GitHub](https://github.com/Kirin-a1126/dsh-ielts-grammar) · [Release v1.0.0](https://github.com/Kirin-a1126/dsh-ielts-grammar/releases/tag/v1.0.0)

![icon](./icon.svg)

## Features

- **Sidebar workspace**: a new "IELTS Grammar" entry opens a full-width editor,
  separate from the conversation.
- **Live grammar checks**: drafts are analysed after a short typing pause; use
  `Re-check` or `Ctrl / ⌘ + Enter` to run immediately.
- **One-click fixes**: each issue includes its context, an explanation, and
  clickable replacements that update the draft and re-run the check.
- **Dictionary spelling**: British and American Hunspell dictionaries catch
  misspellings outside the curated list and suggest nearby corrections.
- **Lexical upgrades**: curated Band 7–9 synonyms and academic expressions for
  words, phrases and collocations, with countability notes.
- **Repetition hints**: content words repeated three or more times are listed
  with alternatives when available.
- **Local only**: analysis runs in the DSH Host process. No draft is uploaded,
  no model is called, and no API key is required.
- **Bilingual UI**: follows the DSH locale; all colours come from theme tokens.
- **Draft persistence**: the current draft is kept in browser localStorage.

## Coverage

The checker focuses on high-frequency, explainable IELTS errors rather than
claiming to be a complete parser.

| Area | Examples |
| --- | --- |
| Agreement | `people thinks`, `this have`, `there is many` |
| Articles | `a important`, `an university`, `He is teacher` |
| Countability | `informations`, `a advice`, `much students`, `less people` |
| Verb patterns | `discuss about`, `depends of`, `capable to` |
| Quantifiers | `one of the student`, `the number of people are` |
| Redundancy / form | `In my opinion, I think`, `more better`, `although … but` |
| Spelling / mechanics | curated high-frequency errors, UK/US dictionary spelling, punctuation spacing, lower-case `i` |
| Lexical range | `important → crucial / pivotal`, `a lot of → a considerable number of` |

Spelling accepts both British and American forms (`colour / color`,
`organise / organize`, `centre / center`). Capitalised names and acronyms are
skipped by default; a sentence-initial capitalised word is only flagged when a
high-confidence common correction exists. Technical terms can be added to
`SPELL_ALLOWLIST` in `lib/analyzer.js`.

> Results come from local rules and dictionaries, not an official IELTS band
> score. Review every suggestion in context.

## Install

From the DSH plugin market, search for **IELTS Grammar & Lexis**. The storefront
uses the prebuilt [GitHub Release v1.0.0](https://github.com/Kirin-a1126/dsh-ielts-grammar/releases/tag/v1.0.0)
package, so no build step is needed.

Local development install:

```text
plugin_manager action=install_bundle target=D:\AI task\dsh-ielts-grammar
```

### Compatibility

- Tested with DSH `0.2.1-rc.5`.
- Node.js 18 or newer.
- Web platform only; the sidebar and panel use Client slots.

## Usage

1. Open **IELTS Grammar** in the left sidebar.
2. Paste a Task 2 draft or choose **Load sample**.
3. Apply grammar suggestions in the **Grammar** tab, or pick an academic
   alternative in the **Upgrades** tab.
4. The draft is re-checked automatically after each change. **Copy draft** copies
   the current text.

## Privacy and security

- The draft is sent only to the same-origin local Host route
  `/dsh-ielts-grammar/analyze`; nothing is uploaded.
- No model calls and no API keys.
- Request bodies are limited to 128 KiB and drafts to 20,000 characters.
- Runtime dependencies: `nspell`, `dictionary-en`, `dictionary-en-gb`. See
  [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## Development

```powershell
& 'C:\Users\xiaoh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' --test test/analyzer.test.mjs test/client.test.mjs test/host.test.mjs
```

```text
lib/analyzer.js   rules + local spell dictionaries (pure, unit-tested)
lib/lexicon.js    lexical upgrade data
lib/index.js      Host route /dsh-ielts-grammar/analyze
lib/client.js     sidebar entry, panel, locale wiring
```

Publishing steps are documented in [PUBLISHING.md](./PUBLISHING.md).

## License

MIT
