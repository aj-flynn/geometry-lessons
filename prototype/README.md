# Lesson template gallery — prototypes for review

[Open the published gallery](https://aj-flynn.github.io/geometry-lessons/prototype/). You can also open **index.html** directly in a browser. No installation or build is needed. Or, from the repository root, run `python -m http.server 8766 --bind 127.0.0.1` and open `http://127.0.0.1:8766/prototype/`.

Choose a layout along the top, then use the sample-lesson menu to view any of the six public lessons. Previous/Next wrap through all nine. Keyboard shortcuts are `[` / `]` and `1`–`9` outside editing controls. **Choose this template** records your choice in the URL and displays its name. Tell the reviewer the name or share the URL. There is no backend or response storage. Switching the layout or lesson resets practice responses.

The URL accepts `template`, `lesson`, and `favourite`, for example `index.html?template=split&lesson=0002&favourite=split`. A localhost URL is available only on the computer running the server. Selection is **pending user review**; no prototype has been promoted into the live lesson library.

**Open prototype in new tab** opens the current template and sample lesson on their own. The link adds `view=standalone`, which hides the gallery header, switcher, selection controls, and explanatory footer. Lesson navigation and practice remain available; gallery keyboard shortcuts are disabled. The original gallery tab remains open, and standalone links can be bookmarked or shared.

## Nine directions

| Key | Name | Structure |
| --- | --- | --- |
| column | Reading Column | A book-like reading measure, contents, and sequential sections. |
| split | Evidence Split | Pinned evidence beside the explanation and practice; inline evidence on phones. |
| steps | Guided Steps | One stage at a time, progressive worked reasoning, and a glossary disclosure. |
| bento | Bento Overview | A modular overview with larger goal, worked-reasoning, and practice regions. |
| ladder | Reasoning Ladder | A visible route with stops and individual reasoning rungs. |
| inquiry | Inquiry First | Evidence and a prediction scratchpad before the explanation. |
| reference | Reference Three-Pane | Outline, reading column, and reference/glossary rail. |
| editorial | Editorial Spread | A bold opening, feature evidence, numbered reasoning, and contrasting practice section. |
| worksheet | Paper Worksheet | A printable sheet with working space and an exit ticket. |

## Content contract

The six `<article data-lesson>` elements in index.html are the shared source. Templates move cloned sections rather than maintaining separate lesson copies. `data-lesson` is a stable identifier, `data-subject` is the subject, and `data-href` points to the original public lesson. Each article supplies direct children with `data-part`: `intro`, `prerequisite`, `explanation`, `evidence`, `worked`, `practice`, `glossary`, `recap`. The intro has `data-field="title"`, `eyebrow`, and `objective`; sections have `data-field="heading"`.

Evidence accepts HTML diagrams, passages, tables and other accessible content. Its optional `data-prompt` supports Inquiry First. Worked reasoning uses an `<ol data-steps>`. Glossary entries have stable IDs and term links. Practice comparisons are closed `<details>` elements. `form[data-check="choice"]` reads feedback from a checked radio's `data-response`; numeric forms use `data-expected`, optional `data-tolerance` (default 0.000001), `data-hint`, `data-success`, and optional JSON `data-mistakes`. No responses are transmitted or persisted.

Stepped diagrams use `data-stepper`, `data-only` for exclusive zero-based states or `data-layer` for cumulative states, and an ordered list in `.stage-notes` for text equivalents. Without JavaScript the first diagram state and complete stage notes remain available. Without any one JavaScript file the gallery stays on its static source fallback. Print shows all guided stages and comparisons. Subject-specific simulations can be added through the shared interaction layer; these prototypes do not claim to implement every possible lesson interaction.

## Provenance and scope

Claude Code **claude-opus-5-5**, effort **high**, read all six published examples and authored index.html, including the lesson content, nine layout concepts and shared contract. Claude reached its session limit before creating the assets. With the user's explicit approval, Codex completed gallery.css, templates.css, kit.js, templates.js, gallery.js and this README, then verified the result. Existing lessons and production assets remain unchanged. These are review prototypes, not independently approved new lessons or a production template migration.

Verified in Chrome: all 54 template/lesson combinations at 1440 px and 390 px (108 renders), no page overflow or JavaScript errors, unique IDs and valid glossary anchors, numeric and choice feedback, resets, model stages, guided reasoning, favourite/reload, browser history, keyboard switching, no-JavaScript and individual-script fallbacks, direct file opening, and print visibility. The desktop and phone layouts were also visually inspected. The checks establish prototype behavior, not curriculum validation or a guarantee that every future lesson needs no adaptation.
