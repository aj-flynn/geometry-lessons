# Geometry lesson workspace

Before working on a homework request, read [skills/geometry-teach/SKILL.md](skills/geometry-teach/SKILL.md). It is the canonical teaching workflow for this repository. The same rules apply to images, PDFs, Word documents, text, follow-up questions, and requests to change these instructions.

This repository and its entire Git history are PUBLIC. Never put an input document, its transcription, a child's identity, private learner state, or actual homework answers anywhere in it. Do not put private material here even temporarily, in an ignored folder, a branch, an issue, an Action artifact, a commit message, or a pull request.

Only publish original concept explanations and examples that differ meaningfully from every supplied homework problem. A renamed or slightly reworded homework solution is still a homework solution. Do not confirm a student's proposed numerical answer; discuss their reasoning without disclosing correctness of the final result.

`lessons.json` is the index source. `node scripts/build-index.mjs` writes the root `index.html`. Keep it updated in the same commit as new lessons. Run `node scripts/check.mjs` and `node --test tests/*.test.mjs` before publishing. The checker is a guard against common mistakes, not proof of privacy or teaching quality. Perform the semantic review in the skill, then record its checks and exact file hash in the manifest.

Publish only reviewed, explicitly selected files to `aj-flynn/geometry-lessons`. Never stage everything blindly. Verify GitHub Pages serves the new lesson before replying with its actual URL in the originating chat. Report pending deployment or delivery honestly. A repo skill is not proof it has been installed in dot or that a Slack attachment can reach it.

