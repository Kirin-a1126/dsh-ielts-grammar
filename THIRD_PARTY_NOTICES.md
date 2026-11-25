# Third-party notices

`dsh-ielts-grammar` uses the following runtime packages for dictionary-based
spelling correction. They are installed as normal package dependencies and keep
their own license files under `node_modules/<package>/license`.

## nspell

- Version: 2.1.5
- License: MIT
- Source: https://github.com/wooorm/nspell
- Copyright (c) 2016 Titus Wormer

The MIT text is reproduced below.

```text
The MIT License (MIT)

Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## dictionary-en

- Version: 4.0.0
- License: MIT AND BSD
- Source: https://github.com/wooorm/dictionaries
- Dictionary data: SCOWL / en_US Hunspell Dictionary, Copyright 2000–2018 Kevin Atkinson and contributors
- Full license: `node_modules/dictionary-en/license` after installation, and https://github.com/wooorm/dictionaries

The dictionary is derived from SCOWL and Ispell. Its license requires the
copyright notice and permission notice to appear in supporting documentation.
The full notice, including the Ispell BSD text and the SCOWL credits, is shipped
verbatim in the package's `license` file. The essential permission statement is:

> Copyright 2000-2018 by Kevin Atkinson. Permission to use, copy, modify,
> distribute and sell these word lists, the associated scripts, the output
> created from the scripts, and its documentation for any purpose is hereby
> granted without fee, provided that the above copyright notice appears in all
> copies and that both that copyright notice and this permission notice appear
> in supporting documentation. Kevin Atkinson makes no representations about
> the suitability of this array for any purpose. It is provided "as is" without
> express or implied warranty.

## dictionary-en-gb

- Version: 3.0.0
- License: MIT AND BSD
- Source: https://github.com/wooorm/dictionaries
- Dictionary data: SCOWL / en_GB Hunspell Dictionary, Copyright 2000–2018 Kevin Atkinson and contributors
- Full license: `node_modules/dictionary-en-gb/license` after installation, and https://github.com/wooorm/dictionaries

The same SCOWL + Ispell notice as `dictionary-en` applies; the full text ships in
that package's `license` file.
