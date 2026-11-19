---
name: science-teach
description: Teach integrated science inquiry through evidence, quantities, and bounded models.
license: MIT
---

# Integrated science

Apply [homework-teach](../homework-teach/SKILL.md). Route specialized relationships to their discipline and link needed continuations. Teach the mechanism needed to justify each tested condition as well as the inquiry method.

- For experiments, draw one causal path from question through setup and mechanism to measurement, calculation and bounded claim. Show how a competing cause reaches the same response. Have the learner predict what would happen if one condition differed, then justify a repair by naming the affected link. Connect warming and cooling when relevant. Use familiar direct observations before introducing a calculated measure.
- For data, keep the task's scale type and spatial cues. On original continuous maps, find a point by landmarks, estimate from the legend, compare regions and match dates. Have the learner point to the cue that disproves a plausible wrong claim and repair it. Distinguish a broad change from a local shift and test competing causes. Check units and baselines. Derive the diagram, legend, text alternative and accepted answer range from the same values. Try both the visual and text versions through feedback. When height is a proxy, show how redistribution, added material or volume change at fixed amount can produce different patterns. State what the model leaves out.
- For models, name the system and limits. Test one boundary. If a property is unknown, compare plausible outcomes and ask what measurement would settle them. Label synthetic data. Check signs, units, ranges and conservation. Leave assigned measurements and conclusions to the learner.

## Lesson structure

Build from templates/lesson.html with assets/worked-example.css and assets/worked-example.js.

- **Reasoning to be worked** (designing a fair test, reading a map or graph, explaining with a model, a calculation). Give each kind its own section.worked: a slideshow (3 to 7 slides) that walks one original setup or data set, one link of the causal path per slide: question, variable changed, mechanism, measurement, bounded claim. Each slide's figure is the setup, map or graph at that moment, with what the step uses in red and what it finds in blue. Then the same reasoning as numbered steps with a closed "Why?" each, giving the scientific reason.
- **Vocabulary and model parts** (independent and dependent variable, control, legend, baseline, system boundary). Use section.define-block: one labeled diagram of an original setup or graph where every term is drawn and labeled, beside definitions that point to it.
- Label synthetic data as synthetic, and keep each fresh attempt after the reasoning it practices.
