# Geometry lessons

A public library of short, visual geometry concept lessons. Each lesson explains the idea, illustrates the relationship, and offers new examples and progressive hints so the learner can return to their own work independently.

- **Library:** https://aj-flynn.github.io/geometry-lessons/
- **Input:** homework photos/images, PDFs, and Word documents, read privately by an agent.
- **Output:** concept lessons with definitions, accurate diagrams, useful accessible animation, analogous practice, and source links.
- **Boundary:** never provide or confirm answers, completed proofs, or disguised worked solutions to actual homework. Never publish input documents, their text, personal information, or learner records.

Start with [Similar polygons](https://aj-flynn.github.io/geometry-lessons/lessons/0001-similar-polygons.html): correspondence, consistent proportions, a controllable scale explorer, and length/perimeter/area relationships. It uses original examples and no private input. This is a static teaching library plus an agent workflow; the website itself has no upload service, model API, tracking, or background inbox listener.

## Use it with an agent

Open this repository in an authorized agent environment. Its `AGENTS.md` points to the reusable [geometry-teach skill](skills/geometry-teach/SKILL.md). Send a private attachment with a request such as:

> Use geometry-teach to explain the concepts in this attachment. Teach the problem types with definitions, diagrams, animation, and different examples. Do not solve or confirm my homework. Publish a safe lesson in the geometry-lessons library and reply here with its live link.

The workflow accepts photos, scanned or text PDFs, and `.docx`. A safe native reader may also support legacy `.doc`; otherwise export that file to PDF or DOCX. Diagrams and equations require visual reading even when text extraction succeeds. The optional Python DOCX helper reads body text without macros, external relationships, or disk extraction; it does not replace visual reading. If an attachment or geometry mark is unreadable, the agent must ask for clarification rather than guess.

## Author and publish

1. Read the skill and its [review/publishing workflow](skills/geometry-teach/references/lesson-workflow.md).
2. Read private input outside this checkout. Draft and sanitize outside it too. Build one small concept lesson from `templates/lesson.html`, then add only the completed public HTML in `lessons/`.
3. Check privacy and separation from every supplied homework problem, verify the new mathematics, and inspect diagrams/controls across screen sizes. Record those checks and the final file hash in `lessons.json`.
4. Run `node scripts/build-index.mjs`, `node scripts/check.mjs`, and `node --test tests/*.test.mjs`. For the DOCX reader, also run `python -m unittest discover -s tests -p test_docx.py` (a custom writable temporary directory can be set with `GEOMETRY_QA_TEMP`). Node 22+ and Python 3 use only their standard libraries; no package install is needed.
5. Review the full diff and stage only explicit safe paths. Publish the lesson, manifest, root index, and any changed shared assets together. GitHub Pages uses `main` and `/ (root)`.
6. Verify the precise live page, then return its link and the library link in the originating conversation. Do not claim deployment or message delivery succeeded without evidence.

Every manifest entry carries semantic review flags and a SHA-256 of the reviewed HTML. Automated checks reject stale index output, unindexed/unreviewed lessons, changed reviewed HTML, many raw-input file types, and common embedded upload/network/storage patterns. They cannot prove that arbitrary text is free of PII or a disguised homework answer. The agent must perform the semantic review.

## Keep private material private

Everything committed here, including deleted files in Git history, is public. Ignoring a file is not a privacy guarantee. Never copy real input into this checkout, including ignored folders; never put it in GitHub issues, PRs, commit messages, build artifacts, or examples. Browser practice responses remain in memory and are not sent or stored. This workflow does not erase the original attachment from chat, Slack, Library, backups, or the originating service; their retention rules still apply.

See [setup and routing](docs/SETUP.md) for the distinction between a working library and an end-to-end dot inbox workflow.

## Teaching approach and license notice

Adapted from [Matt Pocock's official teach skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md): small lessons tied to a mission, reliable sources, shared components, active recall, and useful feedback. The original's private teaching notes/records are deliberately excluded from this public repository. [Matt Pocock's MIT notice](skills/geometry-teach/LICENSE-MATT-POCOCK.txt) is retained.

