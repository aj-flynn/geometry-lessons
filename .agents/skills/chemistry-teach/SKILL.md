---
name: chemistry-teach
description: Teach chemistry through original particle models, calculations, and evidence checks.
license: MIT
---

# Chemistry

Apply [homework-teach](../homework-teach/SKILL.md). Teach only the source's needed reasoning. Leave course-specific labels and cutoffs to the course reference. If vocabulary is assigned, let the learner match an original feature to the course term and justify the match.

- **Composition and reactions.** Name the counted unit. Show the task's formulas, arrow and states. In a fresh worked path, mark what the prompt fixes, what the learner can change now and what the move must preserve. Teach a cue for the next valid move. Show the hardest count or charge relationship with aligned notation and an annotated model. Where balancing is taught, let learners vary a coefficient and read all affected totals before comparing. Leave one uncued fresh case with the hardest linked decisions. Check every element, charge and the simplest ratio.
- **Model choice.** Identify particle and scale. Distinguish observations, inferences and uncertainty. When a decision depends on an unstated value or course convention, show whether to derive it or consult a specified source. If neither suffices, name what is missing. Supply lookup data for every required decision. Model finding one entry and let the learner use a different entry at the point of use. Check charge, parentheses and subscripts. Cite a verified, homework-safe source that teaches the method or supplies lookup data, including when you make a local reference table.
- **Electron structure.** Track valence, charge, skeleton, shared and lone pairs, total budget and local shells. Count a shared pair once globally and around both bonded atoms locally. Show the required bond multiplicities and lone-pair patterns in complete fresh structures. When skeleton choice is required, withhold it on the uncued case. State limits of shell shortcuts.
- **Polarity.** Separate bond multiplicity, uneven pull and whole-particle geometry. Use one scale and the applicable convention. Label partial charges and use crossed tails for bond dipoles. Distinguish abstract vector arrows and check direction and cancellation. Keep optional vector arithmetic separate.
- **Attractions and properties.** Separate bonds from interactions among particles. Distinguish one contact from total attraction. Give separate near misses for multiple-condition rules. Compare under relevant conditions, including pressure, size and shape. Distinguish reaction speed, extent and evidence where needed.

Check the full construction, state labels, symbols, units and text equivalents. Test a prediction that changes a decision. Keep practice keys clearly distinct from measured or established chemistry.

## Lesson structure

Build from templates/lesson.html with assets/worked-example.css and assets/worked-example.js; lessons/0004-electrons-and-bonds.html is the reference.

- **Procedures to be worked** (counting atoms, building a dot structure, deciding polarity, choosing an attraction, balancing, a calculation). Give each procedure its own section.worked: a slideshow (3 to 7 slides) that walks one original particle through the procedure, then the same method as numbered steps with a closed "Why?" each. Each slide shows the model at that moment: the formula with the part being read marked, the structure with the pair just placed, the bond dipoles as they are drawn. Mark what the step uses in red and what it finds in blue, and carry a running total (electrons left, atoms counted) in the step's math line. The "Why?" names the rule or the physical reason, not the arithmetic.
- **Definitions and representations** (subscript versus coefficient, bonding versus lone pair, partial charge, bond dipole, intermolecular contact). Use section.define-block: one original formula, structure or particle picture with every defined part drawn and labeled, beside definitions that say where each part is in it.
- Keep lookup data (electronegativity values, valence counts) in the same section as the decision that needs it, and keep each fresh attempt after the procedure it practices.
