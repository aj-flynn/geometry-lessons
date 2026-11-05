# Similar polygons: review evidence

These are historical assessments of fixed revisions, consolidated from the baseline and refinement records. They do not attest subsequent changes or meet the owner's current 100/100 lesson target. The [review rubric](REVIEW-RUBRIC.md) owns the targets and criteria.

## Independent results

| Revision | Lesson | Process | Findings |
| --- | --- | --- | --- |
| `5769c410385de1af1b8eefcb38e4e96e8d671081` | 78/100 | — | Accuracy 24/25, sequencing 14/20, practice 8/15, visual clarity 11/15, interaction/accessibility 12/15, privacy/workflow 9/10. |
| `6ea0003cd55e70bb071bd87b5f0e6a6e888df8ef` | 89/100 | 94/100 | Repeated correspondence, grouped checks, text-only stretching, prediction inside the answer reveal, missing anchors/inline definitions. Category breakdowns were supplied by the reviewer; these are the recorded totals. |
| `5c3ed129ce28b62458669c6c5a847893ede7d024` | 95/100 | 96/100 | Fresh interleaved checks, visual shape comparisons, separate prediction, and easy anchors met the then-current threshold. |
| `e6f418ed7e72ccd3238fdc6fbe06de3737c2aa94` | 96/100 | — | One pacing point, one scroll-density point, and two accessibility-evidence points remained. |
| `a437deb63775ad50b001cebae1308a15f458b1b9` | 98/100 | — | Pacing and visual density resolved; actual zoom, print, OS reduced motion, and screen-reader evidence remained incomplete. |

The independent Astra reviews compared the lesson and process with the official teach skill under the repository's privacy and no-answer constraints. The original baseline author check was not independent. No new score was assigned during documentation consolidation.

## Reviewed teaching and behavior

The baseline author review checked ordered correspondence and quarter-turn coordinates, scale-factor direction, proportions, perimeter/area scaling, rectangle aspect ratios, and new practice feedback. It inspected visible content, hidden hints, attributes, SVG descriptions, feedback, metadata, and filenames for privacy and homework separation. Seven Node tests passed at that baseline; browser checks exercised module loading, slider endpoints, keyboard input, play/pause/reset, reduced-motion controls, and wrong-answer/retry feedback. A module MIME issue and slider-step synchronization were corrected.

Later revisions introduced a reversed-endpoint hexagon check; transfer checks immediately after matching, side scaling, area scaling, and shape testing; reduction/reverse-direction mixed practice; and an exit explanation. The original/uniform-scale/one-axis-stretch drawings use a common scale: 108 by 60, 162 by 90, and 162 by 60 represent 18 by 10, 27 by 15, and 27 by 10. A doubling prediction appears outside the closed reveal, with doubling/halving anchors and inline definitions. A follow-up varied correct-choice positions and added private prerequisite calibration and next-session recall guidance; earlier scores did not automatically transfer to those edits.

The pacing revision grouped the concepts, three choice checks, and five numeric checks into three native disclosure paths: Match and scale; Area and shape; Reason and practice. Deep links reveal their containing path. The path helper expands disclosures for printing and restores the reading view. Its regression test covers deep links, malformed/missing fragments, repeated print events, and restoration.

Browser checks verified path selection, keyboard opening, one-open-path behavior, glossary access, keyboard scale changes, explicit reduced-motion playback, and no horizontal overflow at 390px, 768px, and 1440px. Earlier checks verified targeted misconception feedback/retry, separate prediction/reveal, and diagram bounds. A script-free preview retained readable native disclosures and diagrams while hiding enhancement controls. Geometry labels were checked for clipping. The checker and 20 Node tests passed after integration with `a4551729c8f13341fbb9d1098294ff8e56fb9ef2`.

Review covered `lessons/0001-similar-polygons.html`, `assets/similarity.css`, `assets/geometry-paths.js`, and loaded dependencies `assets/site.css`, `assets/lesson.js`, `assets/similarity.js`, and `assets/similarity-model.js`, plus metadata and workflow changes. The manifest records reviewed HTML hashes; the fixed revisions identify dependency bytes. No private input, learner identity, or assigned answer was recorded.

At `da5ecedbf96e639e8f829838c92d89c84d098de8`, each of the six live lessons' library links was activated and reached the root six-lesson shelf. The source checker additionally guards missing, wrong-target, unclear-label, commented, script-only, and directly hidden anchors; browser review remains necessary for actual visibility.

## Remaining verification limits

After the 98/100 assessment, the no-script print instruction was corrected to open and print **one path at a time**, then print the glossary separately. Named disclosures cannot all stay open together. The JavaScript print helper was unchanged. This correction does not claim a new independent score or a native print-preview pass.

Actual 200% browser zoom, native print preview, an operating-system reduced-motion change, and screen-reader operation remain **unverified** in this record. The prior environment could not expose those native surfaces; responsive/CSS evidence is not a substitute.

To close the gaps on the fixed candidate, exercise navigation and controls at native 200% zoom; confirm all paths and hints in print preview and restoration afterward; change the OS animation preference during playback; and use a screen reader to inspect disclosure states, control names/values, and feedback announcements. Record actual observations for independent reassessment. These artifact checks do not establish durable learner mastery or end-to-end email delivery.
