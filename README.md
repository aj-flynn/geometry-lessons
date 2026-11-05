# Homework lessons

Turn a private assignment into a public concept lesson that helps a high school freshman return to their own work independently. Geometry, Science, and English lessons use plain explanations, linked glossaries, accurate diagrams, controllable interactions, and genuinely new practice.

[Open the lesson library](https://aj-flynn.github.io/geometry-lessons/).

## Generate a lesson

Open this repository in Codex and use `$homework-teach` with an assignment supplied in the authorized private conversation:

> Teach the concepts in this attachment with different examples. Include a glossary, diagrams, and interactive practice. Do not answer or confirm the assigned work. Publish the reviewed lesson to the authorized library and return its verified link.

The [homework-teach skill](.agents/skills/homework-teach/SKILL.md) identifies the subject and loads its teaching skill from `subjects.json`. An unknown subject gets a new reusable skill before lesson generation. Geometry, Chemistry, English, and general Science have their own guidance. The shared [lesson workflow](.agents/skills/homework-teach/references/lesson-workflow.md) owns review, metadata, and publication.

The [independent refinement loop](.agents/skills/homework-teach/references/independent-refinement.md) tests lessons and skills with fresh Astra reviews to 100/100, then Claude Code Opus 5.5 at high effort to 100/100. Improved lesson and skill revisions are published throughout; final completion requires both reviewers on the same candidate. This maintenance work uses the existing library. Future email libraries retain the separate private routing rules; public indexes contain no email addresses.

Photos, PDFs, Word documents, and text stay outside this public checkout, including ignored folders and Git history. Read diagrams visually; the DOCX helper assists text inspection only. Publish original explanations and examples, never source assignments, identifying details, private learner records, or assigned answers. Answer keys, graded-work completion, student profiles, analytics, public uploads, and inbox automation setup are outside this project's scope.

## Repository map

| Path | Purpose |
| --- | --- |
| `.agents/skills/` | Canonical teaching instructions, subject/routing guidance, DOCX helper, and attribution |
| `templates/` | Lesson scaffold and library-index template |
| `lessons/` | Reviewed concept lessons with stable URLs |
| `assets/` | Shared styles, interactions, and subject models |
| `reference/` | Learner-facing reading and chemistry guides |
| `lessons.json` | Lesson metadata, semantic review attestations, and reviewed HTML/dependency hashes |
| `index.html` | Generated library page; edit the manifest/template instead |
| `scripts/`, `tests/` | Index generation and publication/behavior checks |
| `RESOURCES.md` | Educational source links |
| `docs/` | Review rubric and revision-specific lesson evidence |

## Check and publish

Use Node 22+. On a fresh checkout, install the pinned checker dependency with `npm ci --ignore-scripts`. The checker uses [parse5](https://github.com/inikulin/parse5) to inspect actual HTML attributes and template contents. After semantic review and updating the manifest:

```text
node scripts/build-index.mjs
node scripts/check.mjs
node --test tests/*.test.mjs
```

When changing the DOCX helper, run `python -m unittest discover -s tests -p test_docx.py`. It uses synthetic inputs outside the checkout; `GEOMETRY_QA_TEMP` can select a writable temporary directory. For chemistry browser checks and optional Playwright setup, see [the chemistry review](docs/CHEMISTRY-REVIEW.md#repeat-the-chemistry-checks).

Review the diff and stage only selected safe files. Publish lessons, their assets, the manifest, and generated index together. This library uses GitHub Pages from `main`, `/ (root)`, with `.nojekyll`. Verify the actual live lesson and its library link before returning a URL. Incoming requests for other libraries must first satisfy the skill's private routing rules; this repository does not install a router or send messages during maintenance.

Automated checks supplement semantic review. The [review rubric](docs/REVIEW-RUBRIC.md) preserves the owner's quality targets; [geometry](docs/LESSON-0001-REVIEW.md), [English](docs/ENGLISH-REVIEW.md), and [chemistry](docs/CHEMISTRY-REVIEW.md) records state the assessed revisions and verification limits. Historical scores do not certify later changes.

Adapted from [Matt Pocock's teach process](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md). The [MIT notice](.agents/skills/homework-teach/LICENSE-MATT-POCOCK.txt) is retained.
