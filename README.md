# Homework lessons

[Open the lesson library](https://aj-flynn.github.io/geometry-lessons/), a newest-first feed of lessons. Feed readers and feed-to-email services can follow [feed.xml](https://aj-flynn.github.io/geometry-lessons/feed.xml). [Browse public skill samples](docs/skill-samples/index.html).

Use [homework-teach](.agents/skills/homework-teach/SKILL.md) with an authorized private assignment. It selects or creates the subject skill in subjects.json. GPT-6.2 Sol High authors focused HTML and performs the author checks; an independent Astra reviewer checks the source, teaching and rendered tasks before publication. Everyday delivery uses one focused independent pass and a basic browser smoke test, not a 100/100 scoring loop. Preserve historical review evidence; optional capability gaps are disclosed rather than release blockers. During [skill refinement](.agents/skills/homework-teach/references/independent-refinement.md), preserve first-draft scores separately from corrected results and use independent Claude Code review after the Astra target is met.

This checkout and its history are public. Keep actual inputs, transcriptions, identifying information and learner records elsewhere. Publish original teaching that leaves the assigned work to the learner.

## Check and publish

Use Node 22+. Install dependencies with npm ci --ignore-scripts on a fresh checkout. Update lessons.json after semantic review, including each lesson's `published` time (ISO 8601 with a time zone), then run:

```sh
node scripts/build-index.mjs   # writes index.html and feed.xml
node scripts/check.mjs
node --test tests/*.test.mjs
```

Use Python Playwright and Chromium or an installed browser passed via --browser. For targeted regression investigation when supported and relevant, scripts/check-practice-browser.py covers per-script feedback and fallback, and scripts/check-chemistry-browser.py covers Chemistry models. These archive-wide suites are not ordinary lesson release gates. The two browser scripts omit reduced-motion preference emulation by default under the temporary review scope; `--include-reduced-motion` opts in when supported. Paginated-print inspection is also excluded until reinstated. Preserve feature support and report these checks as excluded, never verified. Use private output directories. Run the DOCX unit tests when its text helper changes.

Stage selected public files. Publish current maintenance to the existing main branch and Pages root. Run scripts/check-live.py --base-url https://aj-flynn.github.io/geometry-lessons/ against reviewed bytes after deployment. Pass --publication-envelope with the private envelope to check every selected file. Verify live navigation before returning the link.

See the [rubric](docs/REVIEW-RUBRIC.md), [review record](docs/SKILL-REFINEMENT.md), and [sources](RESOURCES.md). The [MIT notice](.agents/skills/homework-teach/LICENSE-MATT-POCOCK.txt) covers the adapted teaching process.
