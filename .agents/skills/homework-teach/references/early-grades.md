# Early-grades lessons (K-4)

Some libraries teach young children. Their lessons.json entry carries the settings, for example `{ "id": "<library id>", "theme": "early", "grades": "K-4" }`. Read that entry, found through the [routing](routing.md) map, before you draft. Every lesson filed under such a library follows this page as well as the [shared skill](../SKILL.md) and the subject skill. Where a subject skill assumes secondary students, these rules win.

## Build

- Start from templates/lesson-early.html, not templates/lesson.html. It loads ../assets/early-grades.css last and gives the body the theme-early class; the checker refuses a lesson in an early library without both. Keep the shared worked-example kit, the glossary and the return link `../<library id>/index.html`.
- Write for the assignment's own grade inside the library's band. Infer it from the sheet's skills and vocabulary when it is not stated, and state that grade in the lead in words a grown-up reads ("For grades 1–2").
- Early elementary subjects get their own subject skill and registry entry, made with [new-subject](new-subject.md): for example Math (`math`) for counting, number, operations, measurement and shapes, Reading (`reading`) for phonics and comprehension, and Writing, Science or Social Studies as needed. A shape lesson for this band is Math, not the secondary Geometry skill. Add a new subject only to this library's `subjects` list when the entry has one; never add it to the root library's list.

## Write so it can be read aloud

- One idea per lesson, taught in three to five small steps. One action per step.
- Short sentences: about 10 words for K-1 and 15 for grades 2-4. Common words. Introduce at most one or two new words, each with a picture and a glossary entry in the same plain words.
- Every step must make sense when a grown-up reads it out loud. Spell out what a symbol means the first time ("+ means put together"). For K-1, give numbers as digits and words ("3, three").
- Each "Why?" is one sentence a child could say back.
- Address the child as "you". Add one short closed "For grown-ups" disclosure near the top: what the idea is, one way to help with things at home, and a reminder to let the child do their own sheet.

## Show it concretely

- Teach with things a child can see and touch: counters, ten frames, number lines, base-ten blocks, coins, shape cut-outs, picture cards. Suggest household stand-ins (buttons, cereal, crayons).
- Draw big, labeled pictures for every step, with large text in the diagram, a text equivalent, and labels as well as color so no step depends on color alone.
- Interactions are simple taps or drags with buttons at least 48px tall, an undo or reset, and no timers, scores or streaks.

## Practice without giving answers

- Two to four practice items, each with a picture hint before any word hint. Keep comparisons closed until the child tries.
- Young children's homework uses small numbers and familiar objects, so changed numbers can still map straight onto the sheet. Use different quantities, a different picture context and, where it matters, a different arrangement. Never solve, count or circle anything from the assignment, and never show its answers.
- End with "Now try your own page" and a two-item checklist a child can follow.

## Review

The reviewer reads this page with the rubric. Grade-level fit (B3) is judged against the library's grade band and the sheet's grade: read the core steps aloud, and flag any sentence, word or step a child in that grade could not follow with a grown-up's help. Check the lesson at phone width, where it is most often opened.
