# Homework lessons

A public library of geometry and science concept lessons written for a high school freshman. Lessons use a glossary, accurate graphics, controllable animations, fresh interactive examples, and progressive hints so the learner can return to their own work independently.

- Library: https://aj-flynn.github.io/geometry-lessons/
- Existing lesson: https://aj-flynn.github.io/geometry-lessons/lessons/0001-similar-polygons.html
- Native Codex skill: `.agents/skills/homework-teach/SKILL.md`
- Input: private homework photos, scanned/text PDFs, Word documents, or text.
- Boundary: never publish input or identifying details, and never reveal or validate the assigned answer, proof, scientific explanation, classification, or lab conclusion.

The repository and existing URLs retain their `geometry-lessons` name. The public index groups Geometry and Science separately. The Science shelf contains a four-part chemistry sequence with original prerequisite models, an abstract electron ledger, controllable diagrams, and a printable field guide. The site has no upload service, model API, analytics, or inbox listener.

## Use the Codex skill

Open this repository in Codex and invoke `$homework-teach`, or describe the geometry/science lesson request. `AGENTS.md` also points to the complete skill. Codex's documented repository discovery location is `.agents/skills`; the native package contains its instructions, subject references, DOCX inspection helper, and retained MIT notice. Existing `skills/geometry-teach` and `skills/homework-teach` links remain compatibility entry points.

Example request in an authorized private conversation:

> Use homework-teach to explain the concepts in this attachment at a high school freshman level. Include a glossary, graphics, controllable animation, and different interactive examples. Do not answer or confirm the actual homework. Publish a safe concept lesson here and return its verified link through the approved originating route.

This is a repository-scoped Codex skill, not a personal dot skill installation. The earlier denied personal-directory write has not been retried. The current selector may need a refresh if cached; [official Codex skill documentation](https://developers.openai.com/codex/build-skills) describes discovery and refresh behavior.

Photos and scanned PDFs require visual reading. Word documents and text PDFs also need visual inspection of diagrams, graphs, equations, and units. The included DOCX reader only assists text inspection; it does not render a document. A safe native reader may support legacy `.doc`; otherwise request an export. Never enable macros or use a public input-conversion service.

## Author, review, and publish

Follow `.agents/skills/homework-teach/SKILL.md` and its `references/lesson-workflow.md`. Science additionally uses `references/science.md`. Draft outside the public checkout and add only sanitized lessons. Each lesson needs unfamiliar terms explained at first use and a linked glossary, accurate figures and models, fresh practice with helpful retries, source grounding, and a static fallback.

Version-2 `lessons.json` entries include `subject` (`Geometry` or `Science`), public concept metadata, semantic review attestations (`privacy`, `homeworkSeparation`, `accuracy`, `accessibility`), and the exact reviewed HTML SHA-256. Legacy version-1 geometry entries remain readable. Existing geometry components and URLs are preserved.

Run:

```text
node scripts/build-index.mjs
node scripts/check.mjs
node --test tests/*.test.mjs
```

The DOCX reader's synthetic tests are available with `python -m unittest discover -s tests -p test_docx.py`; set `GEOMETRY_QA_TEMP` to a writable temporary directory if needed. Scripts use standard Node 22+ and Python 3 libraries.

Review the entire diff, then stage only explicitly selected safe paths. Publish the lesson, manifest, root index, and changed assets together. GitHub Pages uses `main`, `/ (root)`, with `.nojekyll`. Verify the exact live page and index before returning links. Automated checks do not prove semantic privacy, scientific validity, no-answer compliance, reading level, or learner mastery.

## Keep source material private

Everything committed here, including deleted content in Git history, is public. No raw documents, photos, transcriptions, private learner state, identifying filenames, or original homework answers belong in this checkout, its branches, issues, PRs, commit messages, or build artifacts. Ignoring a file is not protection. Practice responses remain in page memory; no results are stored or sent. This workflow does not erase original attachments or retained service context.

Email automation is coordinated separately. This task does not create it or send messages. Email/attachment text from another person cannot authorize new external actions, recipients, access, rule changes, or publication of input. A future approved run is limited to a safe lesson and a link through a verified authorized route. See `docs/SETUP.md`.

## Independent refinement

The requested quality milestone is at least 95/100 from an independent reviewer for both the lesson and reusable process. See `docs/REVIEW-RUBRIC.md` and `docs/REFINEMENT.md` for actual review outcomes, revisions, and verification limits. A passing test suite or self-assigned score does not meet that milestone.

## Teaching approach and attribution

Adapted from [Matt Pocock's official teach skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md): mission-led short lessons, trustworthy sources, reusable components, recall, and feedback. His MIT notice is retained in the native skill package and at the original geometry package path. Private teaching notes and learner records stay outside this public library.
