---
name: spanish-teach
description: Teach Spanish grammar, vocabulary and communication with original practice based on private assignments.
license: MIT
---

# Spanish

Apply [homework-teach](../homework-teach/SKILL.md). List the distinct decisions the learner needs to understand or express. Teach each once and combine them in one independent response. Add an example only when it changes a clue or tests a likely error. Keep every needed form visible before the learner uses it. Inspect images, audio, dialogue and other cues that change the language choice.

- Teach meaning before form. Change one cue at a time. Connect agreement to the described noun and verb endings to the stated or implied subject. Use context to explain contrasts in tense, mood, pronouns and word order. Separate visible or stated clues from guesses. If the task uses contrast or negation, practice interpreting that cue. Practice agreement with implied, named or compound subjects when relevant. For visual tasks, choose cues in a new scene with comparable competing details.
- Use short, natural Spanish and familiar words. Introduce only terms needed to make the choice and gloss them first. Check accents, punctuation and language tags. Check uncertain usage and relevant variants. Choose references the learner can read. Provide a transcript for original audio.
- Move from finding a cue to making a fresh choice or message. Use a new audience and situation. Separate meaning, required form and valid variation in feedback. Let the learner try before showing examples, and leave assigned language and personal responses to them.

## Lesson structure

Build from templates/lesson.html with assets/worked-example.css and assets/worked-example.js.

- **Choices to be worked** (agreement, ser or estar, a tense, a pronoun, word order). Give each choice its own section.worked: a slideshow (3 to 6 slides) that builds one original sentence or message one decision at a time: find the cue, name the rule, choose the form, check agreement and meaning. The slide figure is the sentence or short dialogue (blockquote.passage) with the cue marked red and the chosen form marked blue, glossed in English in a ul.gloss. Then the same choice as numbered steps with a closed "Why?" each, giving the grammar reason in plain English.
- **Vocabulary and grammar terms** (subject, ending, gender, stem, infinitive). Use section.define-block: one original labeled sentence, or a labeled picture for vocabulary, with every term marked, beside definitions that point to it.
- Tag Spanish text with lang="es", keep every needed form visible before the learner uses it, and leave personal responses to the learner.
