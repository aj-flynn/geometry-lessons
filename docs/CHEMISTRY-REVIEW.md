# Chemistry sequence: independent review

Current independent result: **100/100 for the lesson sequence and 100/100 for the reusable process**. The refinement record and current hashes appear below; the earlier scores are retained as review history.

Reviewed content commit: `c45149f`, based on main `77aeb42`. Four Science lessons (`0003` through `0006`) and the chemistry field guide were added; the existing geometry and English lessons and manifest entries were preserved. The exact HTML and dependency hashes below identify the reviewed behavior, including unchanged shared assets.

## Actual review results

The independent reviewer was launched with model `gpt-6-astra`, reasoning effort `high`, and a fresh context. It read the official Matt Pocock teach skill and the repository rubric. The initial content pass identified issues without inventing a runtime score. The first scored integrated candidate received **90/100 for lessons**, with a failed homework-separation gate, and **98/100 for the reusable process**. After fixes, the independently reviewed sequence received **98/100**, and the process **98/100**. The rubric and threshold were unchanged.

| Lesson criterion | Final score |
| --- | ---: |
| Concept accuracy | 25/25 |
| Sequencing and freshman teaching | 19/20 |
| Active practice | 14/15 |
| Visual clarity | 15/15 |
| Interaction, accessibility and resilience | 15/15 |
| Privacy and workflow | 10/10 |
| **Total** | **98/100** |

| Process criterion | Final score |
| --- | ---: |
| Privacy, no-answer and authority boundaries | 30/30 |
| Teaching contract | 20/20 |
| Subject accuracy | 20/20 |
| Repeatability and compatibility | 15/15 |
| Validation and delivery | 13/15 |
| **Total** | **98/100** |

Deductions in that first published version: two advanced phrases would benefit from immediate explanation; numeric retries use general hints rather than distinguishing specific arithmetic misconceptions. Chemistry browser/model checks were run in the authoring environment but are not part of the repository's required Node suite. These are bounded quality gaps, not concealed passing tests.

## Corrections and boundaries

- Replaced a completed electron-layout example with a partial abstract ledger, and removed direct vocabulary mappings that could complete assigned responses. A reviewer privately compared all public prose, hidden feedback, graphics, accessible descriptions, and reference material against the two supplied images. No source image, transcription, private comparison record, identity, or learner result is included here.
- Specified initial neutrality in a charge question, escaped feedback attributes, and corrected electron-budget wording to count bond lines rather than treating every bond as one pair.
- Kept numerical category assignments for the learner's course convention. The lesson explains that thresholds are approximate and that flat Lewis drawings do not establish molecular shape.
- Corrected the vector drawing to use one scale for contributions and their sum. The accessible description follows the current angle and no longer reveals the next observation in advance.
- Preserved prediction/reveal separation, added transfer exit checks and contextual sources, and made print notes readable. Private learning records and automatic reminders are intentionally excluded.

## Evidence and limits

The author executed **83 Chromium checks** (Chromium 151.0.7922.34): layouts at 390, 768 and 1440 CSS pixels; 200% CSS zoom reflow; visible keyboard focus and arrow-key slider input; every authored choice's feedback; numeric wrong-answer/retry behavior; play/pause/reset; reduced-motion endpoints; no-JavaScript reading and expandable notes; and no browser script errors. Vector sums and equal arrow lengths were checked at 60°, 90° and 180°. Mobile, desktop, zoom, print and figure screenshots were inspected.

`node scripts/build-index.mjs` and `node scripts/check.mjs` passed for six indexed lessons and eighteen public files; all thirteen tests from `node --test tests/*.test.mjs` passed. Published Git blob hashes were also compared with every lesson's manifest hash. Checks do not prove learning, privacy, or scientific validity; the semantic reviews supply those judgments within their stated scope.

The independent reviewer read the artifacts, inspected selected screenshots, checked the science/model mathematics, matched the nine evidence hashes, and independently ran the repository checker. It inspected the 83-check browser report; it did not execute that browser suite itself. Actual screen-reader operation and native browser 200% zoom were not tested. CSS zoom and responsive widths are the bounded reflow evidence.

The teaching approach follows the [official teach skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md): focused linked lessons, trustworthy sources, reusable components, immediate feedback, later recall, mixed practice, and a compact reference. Public learner records and direct assigned-answer mappings are excluded by the owner's stricter rules. Immediate practice is not evidence of durable mastery.

## First published version hashes

Line endings were normalized without changing reviewed text before the final browser pass. These hashes match the first published version, `da5eced`. The refinement hashes appear below.

| File | SHA-256 |
| --- | --- |
| `lessons/0003-reading-particle-formulas.html` | `3a8cdffb92f5adce50fa68ae22dead2065623e34c1f60a27a56095dc8031d2a5` |
| `lessons/0004-electrons-and-bonds.html` | `465874bf1524143b2348f4150d8c8905f2b767c3b10c862e9b8d9cf4597da00a` |
| `lessons/0005-shape-and-polarity.html` | `b53b45301363b657fbaea068157f08ebd2326a41ddb6e0b04d831845e10ce069` |
| `lessons/0006-between-molecules.html` | `bba376e9c84eeb650c0f8769fee671f6c3967b1a49f8ae757a394b94ff82e11f` |
| `reference/chemistry-field-guide.html` | `454c9108e2be949382dfef5a22ec93b189b4710ce826c0516d58b66c3bac4877` |
| `assets/chemistry.js` | `5cb78dead3dd27efe188d37664cf2bbf448f5c4fabba22cccd5649e7c8bafdb3` |
| `assets/chemistry.css` | `40bd795c07feb9942cc6cbf694ad3072cf4eca8fdd28efe6f40d3b8e95e65fd5` |
| `assets/site.css` | `9fc107f9225c00cd17075f52d776f2ecf61982d53b0eec24fac1cc0043d78f5a` |
| `assets/lesson.js` | `b3b3f5341a3bb095f3f5ddc70ae4604df345c18e9aec7df12e657742cad74d6c` |

## Publication verification

The release must serve the four lesson URLs, their linked assets and field guide, and the six-entry subject index through GitHub Pages. Successful push alone is not a live-deployment check. Verify the served lesson hashes against this record before returning a link; the originating conversation handles any message delivery.

## Repeat the chemistry checks

The repository now preserves the chemistry regression checks in `tests/chemistry.test.mjs`, run by the standard `node --test tests/*.test.mjs` command. They verify vector addition and scale, current-state descriptions, stage visibility, particle separation, motion controls, reduced motion, and misconception-specific numeric feedback using the actual shipped scripts and authored forms.

For browser evidence, use `scripts/check-chemistry-browser.py`. Install Python Playwright with `python -m pip install playwright`, then its browser with `python -m playwright install chromium`, and run `python scripts/check-chemistry-browser.py` from the repository. Dependencies are optional for the Node suite. `CHEMISTRY_BROWSER` may point to an existing compatible Chromium executable. `CHEMISTRY_QA_OUTPUT` may choose an evidence directory; by default a new temporary directory outside the checkout holds screenshots and JSON results. Do not place private input in that directory or in the public repository.

The browser script uses only the original public lesson files and local assets. It checks 390/768/1440 widths, CSS 200% zoom, keyboard focus, every authored choice, general and specific numeric retries, step and angle controls, reduced motion, vector endpoints, static reading, and print screenshots. It records the browser version and exact artifact hashes. It does not claim native zoom or a human screen-reader assessment. Re-run affected checks when lessons or shared dependencies change and inspect the screenshots before publication.


## Refinement to the requested 100-point target

A fresh independent `gpt-6-astra` reviewer with `high` reasoning assessed the refinement. It initially scored the lessons **98/100** and the process **100/100**: the process deduction was resolved by preserved regression and browser checks, while it found two additional teaching issues in lesson 0005. The difference exercise came after a second concept, and one arrow exercise repeated a demonstrated case.

The revised lesson places the numerical difference check directly after its explanation. The primary arrow practice now transfers the equal-arrow demonstration to unequal opposing contributions, with misconception feedback and retry. The exit task asks for the evidence missing from a flat drawing. Earlier refinements replace unexplained advanced phrases with plain language and add nine specific arithmetic-misconception responses across three lessons.

The independent reassessment scored **lesson sequence 100/100 and reusable process 100/100**. Lesson breakdown: accuracy 25/25, sequencing 20/20, active practice 15/15, visual clarity 15/15, interaction/accessibility/resilience 15/15, privacy/workflow 10/10. Process breakdown: boundaries 30/30, teaching 20/20, accuracy 20/20, repeatability 15/15, validation/delivery 15/15. No remaining concrete deduction or gate failure was identified within the focused review scope. We did not change rubric weights or convert unavailable checks into passing claims.

The reviewer assessed fixed content before integration; the same lesson and dependency bytes are in integrated commit `38fe17f`, rebased onto `e6f418e`. All nine hashes were compared against the originally assessed commit. The upstream integration preserves the geometry and English work and adds the owner's latest library-link, routing, and target instructions.

After integration, the author reran the checker and all **19 Node tests**, including the newly added upstream library-navigation regression. They passed; the chemistry browser evidence still identifies the unchanged 92-check artifact set.

The fresh reviewer independently ran the checker and 18 Node tests, inspected the **92-check Chromium report**, matched its nine hashes to committed bytes, and viewed the revised mobile lesson. Its second pass focused on the demonstrated deductions and regression risk. Original homework separation relies on the earlier private two-image review: the fresh reviewer did not inspect those deleted temporary photos. The refinements introduce no real substance, assigned classification, or private learner record. The limited accessibility evidence remains CSS zoom, keyboard interaction, responsive layouts, reduced motion, text equivalents and static/print reading; no screen-reader or native-zoom pass is claimed. The score expresses rubric conformance, not guaranteed learner mastery.

### Refinement artifact hashes

| File | SHA-256 |
| --- | --- |
| `lessons/0003-reading-particle-formulas.html` | `6f07606319c772494c30a30b615199b6e069ffe8e0c1ddf88934e7b70dea5aa9` |
| `lessons/0004-electrons-and-bonds.html` | `da8ca9a7bd2d822d3d7545811d203e3128102a830481c4bc442b8b6e462bf138` |
| `lessons/0005-shape-and-polarity.html` | `24d5d1d67f4388aec0ff380bc747cf820d755fa44d9f3a527b02f52a14ffa33c` |
| `lessons/0006-between-molecules.html` | `bba376e9c84eeb650c0f8769fee671f6c3967b1a49f8ae757a394b94ff82e11f` |
| `reference/chemistry-field-guide.html` | `454c9108e2be949382dfef5a22ec93b189b4710ce826c0516d58b66c3bac4877` |
| `assets/chemistry.js` | `5cb78dead3dd27efe188d37664cf2bbf448f5c4fabba22cccd5649e7c8bafdb3` |
| `assets/chemistry.css` | `40bd795c07feb9942cc6cbf694ad3072cf4eca8fdd28efe6f40d3b8e95e65fd5` |
| `assets/site.css` | `9fc107f9225c00cd17075f52d776f2ecf61982d53b0eec24fac1cc0043d78f5a` |
| `assets/lesson.js` | `b3b3f5341a3bb095f3f5ddc70ae4604df345c18e9aec7df12e657742cad74d6c` |
| `tests/chemistry.test.mjs` | `27564f7a537e3d14fe0b77b0b0e2cc64563ab962ad88ca7c16803c60b9c27f2b` |
| `scripts/check-chemistry-browser.py` | `deafaead18390c746f775655620e8f61a3a27d2b637ed494f958201423529a4a` |
