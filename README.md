# Homework lessons

[Open the lesson library](https://aj-flynn.github.io/geometry-lessons/). [Browse public skill samples](docs/skill-samples/index.html).

Use [homework-teach](.agents/skills/homework-teach/SKILL.md) with an authorized private assignment. It selects or creates the subject skill in subjects.json. GPT-6.1 Sol High authors focused HTML, checks the lesson, and publishes reviewed output. During [skill refinement](.agents/skills/homework-teach/references/independent-refinement.md), independent Astra and Claude Code reviews test what fresh Sol authors produce across multiple assignments.

This checkout and its history are public. Keep actual inputs, transcriptions, identifying information and learner records elsewhere. Publish original teaching that leaves the assigned work to the learner.

## Check and publish

Use Node 22+. Install dependencies with npm ci --ignore-scripts on a fresh checkout. Update lessons.json after semantic review, then run:

```sh
node scripts/build-index.mjs
node scripts/check.mjs
node --test tests/*.test.mjs
```

Use Python Playwright and Chromium or an installed browser passed via --browser. Run scripts/check-practice-browser.py for per-script feedback and fallback. Run scripts/check-chemistry-browser.py for Chemistry models. Use private output directories. Run the DOCX unit tests when its text helper changes.

Stage selected public files. Publish current maintenance to the existing main branch and Pages root. Run scripts/check-live.py --base-url https://aj-flynn.github.io/geometry-lessons/ against reviewed bytes after deployment. Pass --publication-envelope with the private envelope to check every selected file. Verify live navigation before returning the link.

See the [rubric](docs/REVIEW-RUBRIC.md), [review record](docs/SKILL-REFINEMENT.md), and [sources](RESOURCES.md). The [MIT notice](.agents/skills/homework-teach/LICENSE-MATT-POCOCK.txt) covers the adapted teaching process.
