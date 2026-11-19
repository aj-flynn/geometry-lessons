---
name: geometry-teach
description: Teach geometry from private assignments with justified relationships, accurate diagrams, and fresh practice.
license: MIT
---

# Geometry

Apply [homework-teach](../homework-teach/SKILL.md). Read stated givens, order, ticks, angle arcs, arrows and right-angle boxes. Explain what the marks prove. Verify essential illegible marks. Treat appearance and handwriting as insufficient evidence.

Use only the relevant reasoning.

- **Correspondence and similarity.** Pair all vertices and edge endpoints, including the closing edge. Derive an order from fresh marks before using it. To establish polygon similarity, check corresponding angles and a common side factor. Apply triangle shortcuts with their hypotheses. Have the learner find a new mapping or compare ratios before revealing the matching order or verdict.
- **Measure and scale.** Show the boundary for perimeter and the region for area. For elementary assignments mixing methods, offer short picture jobs the learner can choose by a visible clue. Put one small worked example, a fresh attempt and a stopping point in each job. Trace each edge once, group matching lengths in a strip, then write the calculation in short lines. Infer equal sides from givens. If the whole boundary is known, subtract known lengths and show the equal shares of what remains before dividing. Show the split for a compound area. In scaling, name original and target, keep ratio order, and use the reciprocal to undo a scale. Label corresponding dimensions in a scale drawing. Use a boundary trace and a tile comparison to explain why perimeter scales once and area twice. Show substitution with readable fractions, units and rounding. Offer a smaller arithmetic example if needed.
- **Class claims.** For always, reason from properties every allowed example has. For sometimes, show both a case and a counterexample. For never, find incompatible necessary conditions. Draw contrasting marked cases and verify they satisfy the givens.
- **Drawings.** Derive drawings and labels from feasible givens. Check that each conventional mark attaches to its intended side or angle, and that lengths agree with parallel, equal and right-angle cues; flag schematics. Keep text equivalents consistent. Use the learner’s familiar landmarks and marks in text alternatives. Reuse the shared scale model where it fits. Check the actual shape, labels and numerical result at each state and reset. Use a visual at each step where spatial structure changes the choice, including auxiliary lines used in a spatial justification. In final mixed practice, let the learner choose among the required methods, including inside versus around when both are assessed. Ask for a clue and explanation as well as the number.

## Lesson structure

Build every geometry lesson from templates/lesson.html with assets/worked-example.css and assets/worked-example.js; lessons/0011-equal-sides-equal-angles.html is the reference.

- **Problems to be worked.** Give each problem type its own section.worked: a step-by-step slideshow (div.deck[data-deck], 3 to 7 slides) that walks one original example, then a numbered list of the same method (ol.steps, 3 to 6 steps). Each step is an imperative action, its math line, and a closed details.why that gives the theorem, definition or reason in one to three sentences. Each slide's diagram marks what that step uses in red, what it finds in blue, and fades what to ignore. Follow each type with its own fresh attempt.
- **Definitional knowledge.** When a task tests naming parts, vocabulary or recognizing a relationship, use section.define-block: one accurate diagram in which every defined term is drawn and labeled (leader lines, color key swatches), beside a dl.define-list whose plain definitions say where each term is in that diagram. Put the governing theorem or rule in a .rule box.
- The slideshow must work with the keyboard (Back/Next, arrow keys, Home/End), show every slide as a numbered list without scripts, never animate under reduced motion, and print every slide. Review checks each of these.
