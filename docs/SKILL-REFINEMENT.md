# Skill refinement record

GPT-6.1 Sol High generates lessons and performs author checks. A fresh Astra reviewer checks the source, teaching and browser experience before publication. Skill refinement also preserves first-author scores and obtains a separate Claude Code Opus 5.5 Medium opinion. See the [refinement workflow](../.agents/skills/homework-teach/references/independent-refinement.md) and [scoring rubric](REVIEW-RUBRIC.md).

## Assignment focus and grade-level benchmark

Astra assessed eight public sample lessons and six lessons from three private assignments. The [sample gallery](skill-samples/index.html) lists the public assignment links, scope and latest accepted lesson scores. The Grade 10 two-reading argument sample earned 100/100 for the lesson and 100/100 for the exercised English process. The assembled release restored a references file missing from the isolated author packet. Those scores use the assignment-focus and grade-level edition. The current edition also evaluates notation in worked and interactive examples and links from first-use terms to individual glossary entries.

On that English release, Opus 5.5 Medium scored the lesson 80/100 and the exercised process 78/100. It found a missing qualification in the worked paraphrase and a mismatch between the model argument and the assignment’s argument type. Its review packet lacked lesson-specific browser evidence.

The revised word-to-equation Chemistry lesson earned 100/100 from Astra and 82.8/100 from Opus 5.5 Medium. Opus found the notation and glossary links consistent in the supplied evidence, and identified missing ion-charge lookup instruction and learner control of coefficients.

A prior published word-to-equation sample scored 100/100 with Astra after bounded revisions and 83.5/100 with Opus 5.5 Medium on the same candidate. The fresh first-run draft scored 92.5/100. Two additional public transfer assignments from different courses tested how well the skill transfers. They are linked in the gallery.

A prior published word-to-equation sample scored 100/100 with Astra after bounded revisions and 83.6/100 with Opus 5.5 Medium on the same candidate. The fresh first-run draft scored 97.2/100. Two additional public transfer assignments from different courses tested how well the skill transfers. They are linked in the gallery.

A prior word-to-equation revision earned 100/100 from Astra and 85/100 from Opus 5.5 Medium. It replaced a browser-blocked ion chart, modeled an in-page lookup, explained reaction cues, and distinguished the ion diagram by shape. These scores apply to the bounded revision.

The latest published word-to-equation sample scored 100/100 with Astra after bounded revisions and 86.25/100 with Opus 5.5 Medium on the same candidate. The first independently assessed output from a fresh Sol author scored 91.8/100 after its own checks.

Earlier scores apply to their own revisions and rubric editions. See the [archived refinement record](https://github.com/aj-flynn/geometry-lessons/blob/b858e1112942f353513e508e80920735248dde96/docs/SKILL-REFINEMENT.md). Private inputs, comparisons and raw review evidence stay outside the repository.

## 2026-11-07: activity layout and usable evidence

Regenerated all eight library lessons and all fifteen existing public samples. Three additional public assignments tested transfer: geometric construction, a poem's tone shift, and reasoning from a map. The [sample gallery](skill-samples/index.html) now contains eighteen lessons. Existing library lesson URLs are preserved.

The shared skill chooses layout per activity. A split keeps the current problem, diagram or givens alongside reasoning that repeatedly refers to them. Extended reading and writing stay in ordinary reading flow. The rubric now explicitly assesses whether requested objects and activities exist, whether closed-answer attempts have sufficient evidence, and whether directions and navigation make sense in both wide and narrow layouts. Its twenty-three category weights are unchanged.

Browser review requires attempting the tasks, not merely opening controls. The revised process checks actual text enlargement, keyboard-accessible tables, script failure, accessible descriptions, and printed task/evidence grouping. Blank attempts precede their comparisons on paper. Other refinements address prerequisites in combined lessons, meaningful error repairs and fresh retries, subject-specific notation, and the first use of glossary terms. Independent Astra review is now a normal pre-publication gate after the author's checks.

Fresh Sol High author outputs were frozen before independent review. Their first scores and all subsequent assessments remain separate. For example, the first particle-formula lesson scored 92/100, the first combined chemistry lesson 86/100, and the first Spanish agreement lesson 93.2/100. Later fresh chemistry drafts exposed additional source-separation and missing-evidence problems, so earlier favorable scores were not treated as permanent passes. Bounded repairs were reattempted by the original reviewers. Supported findings changed the skills and lessons; disputed deductions were checked against the existing rubric, with differing opinions and withdrawn rationales retained privately.

The final content reviews award each of the twenty-six lessons **97/97 assessed** and each exercised subject-process review **85/85 assessed**. These are not normalized totals out of 100. Lesson F3 (3 points) and process validation/delivery (15 points) remain unassessed until the integrated release is published and verified. First-draft scores do not establish reliable first-draft perfection; the result describes the exercised author, independent-review and correction process.

Integration repaired glossary navigation, legacy section links, enlarged-text tables in two lessons, formula and calculation wrapping, and subject navigation on the library. These additional findings remain recorded even though their earlier isolated reviews passed. The practice browser checker now recognizes an explicit adjacent link to a comparison section as well as an adjacent disclosure; it still rejects missing or empty fallbacks and tests that failed enhancement cannot submit responses. Sources, private comparisons and raw browser evidence remain outside the repository.

Assessment limits: Chrome on Windows, bounded keyboard/accessibility checks, native 100/200/400% zoom, enlarged text, script-failure fallbacks and paginated print. This is not an exhaustive assistive-technology or cross-browser audit, a learner study, or proof of lasting learning. Coverage is limited to supplied source material; unavailable course material and unavailable Spanish media were not inferred.

### Reviewed lesson bytes

These hashes identify the integrated lesson HTML; dependency and review-contract hashes for library lessons are in lessons.json. Private release receipts bind the entire selected file set.

| Lesson | SHA-256 |
| --- | --- |
| [Balance the atoms, then label the states](skill-samples/lessons/chemistry-balancing-with-states.html) | `f82a26a9747181bace918e6eb154ab1b7e86ca74b86ebf170db95c88dc2a52c8` |
| [Balance a chemical equation](skill-samples/lessons/chemistry-balancing.html) | `5157e286b5fc2987478d3cb59a4a57849fea9cd57349af14d88f013edf6cd53f` |
| [From reaction words to equations](skill-samples/lessons/chemistry-from-words.html) | `5d59a613d7ae0dd6acedf758342cf95eadcaa9e3a3982269ef40a526a2bc61a1` |
| [What a compound name counts](skill-samples/lessons/chemistry-ionic-and-molecular-names.html) | `6fdfa9a745f52ae8f6016e97935ad745b87539e99855a47ac40de933f5cb14e3` |
| [From formulas to ionic equations](skill-samples/lessons/chemistry-ionic-equations.html) | `a63db58ec3aec31af70e7573d9b67d066abdd0122cb4da0f9dae374c17a9c7e3` |
| [Two calculations from an isotope table](skill-samples/lessons/chemistry-isotope-mass-and-error.html) | `a6678e4364969135122e51bfffa2e550e60cb58c20dae9695a3430844213eeaf` |
| [Chemical names and formulas](skill-samples/lessons/chemistry-names-formulas.html) | `1900c9628d7018eaf8f69f25833e3f0af5398c1afdba936ce623753ec32f9f4e` |
| [From table to prediction](skill-samples/lessons/chemistry-reference-tables.html) | `e37bf09efc7c869538244144c20f6683db4ca76d5bd759d90e4cd7ec5aa7f981` |
| [When a poem changes tone](skill-samples/lessons/english-tone.html) | `f9dc16de5a2fb1f1167f9639f1b8391162694ce9b6259588f509110567a37397` |
| [Build an argument from two readings](skill-samples/lessons/english-two-sources.html) | `a8c7905e8a20e7a1499b37c96f4b88d4d7c321bcef0f9130123f2458de7e2070` |
| [Build a reflection with two arcs](skill-samples/lessons/geometry-construction.html) | `79cc3e739b04f1aa246efd0cd6a170fd1a19a5e65b6a457ad392c27904df9be9` |
| [Around the edge or across the middle?](skill-samples/lessons/geometry-perimeter.html) | `9608fbcc852bc686b54aa1b8bbd87fa8a848894a41697bede49dbd57f1c5cb98` |
| [From a diagram to a proof](skill-samples/lessons/geometry-similarity-proofs.html) | `29439e9db6816d78a5caaaffac676164d5a048cd09ee7de0b29e56204a76f3e7` |
| [What made it cool faster?](skill-samples/lessons/science-fair-tests.html) | `c709d933816beb88869269503694eb5abafbd3100bf9082148d69b29fdf4c78e` |
| [Follow the traces on a map](skill-samples/lessons/science-map-evidence.html) | `d01d772e7eec19dfe4854276d47e1b096cd84da060e37255c58cb8b81923e35e` |
| [Reading sea surface height maps](skill-samples/lessons/science-sea-level.html) | `26ed03b396028ef3b92a70cb81d1065db67631c65b8fcbfb4597ee8758b59365` |
| [Describe it in Spanish](skill-samples/lessons/spanish-agreement.html) | `d18bb3f4e6fa3b904067b060feef957ddc0ca3c46dfeca465cf00b0cce3dcb33` |
| [Feelings and places with estar](skill-samples/lessons/spanish-estar.html) | `d9c0deb84d558338c7dc90fc70c500e32a0c5dd8f7f80e50d49a2b4b68ed9226` |
| [Similar polygons](../lessons/0001-similar-polygons.html) | `fddc62a26950046be121bbc7e379fc3833cf9272f7036656c9e2e06a8e0c0dc9` |
| [Read between the lines](../lessons/0002-close-reading-dialogue.html) | `6a77d5f1f875133e94490bffc65e53e73f538801adf60027ead32dff37f77ce2` |
| [Read particle formulas](../lessons/0003-reading-particle-formulas.html) | `e0b95ee04830ec40e10ff6109e82aea70bc9b19dc3bab5a1b403b1d13e1185df` |
| [Account for electrons in a drawing](../lessons/0004-electrons-and-bonds.html) | `909b0efe465b745e8aa5a29ab71ccc9ec5a19f6c4be39c85314d2cd8e65f9d2c` |
| [Trace pull through a molecule](../lessons/0005-shape-and-polarity.html) | `d779ca5b39a2512063ab02e556f3597dc5d5db8cb071d4b9d344699595e63aa3` |
| [Compare attractions between molecules](../lessons/0006-between-molecules.html) | `ad427cd9aa66622bef343e467fc631535e5d2a265c203c92a6bcc750a016d774` |
| [Two angles, one shape](../lessons/0007-aa-triangle-similarity.html) | `8e90e640394b5c6fe044271468638e1eb1ddb85b06b01e61b83263ebaf629e86` |
| [From particle formulas to physical properties](../lessons/0008-chemistry-evidence-split.html) | `3d0b3eaf006febd4a1bb64a081344ccd2dbdacdd449b008ffbe7f2972fe86db8` |

### Verified publication and final Astra scores

The reviewed lessons were published in [commit af0a8e7](https://github.com/aj-flynn/geometry-lessons/commit/af0a8e7a91c0f6b15fcc6bafb53eb35e2157a6f6). Live verification on 2026-11-07 at 21:29:54 UTC matched all **147 selected public files** to the publication envelope. Keyboard checks covered all eight library returns, all eighteen sample-gallery entries and returns, five subject links, and twelve local reference links. The actual library and gallery URLs were delivered in the originating chat.

The original Astra reviewers then completed F3 and process validation/delivery. **All twenty-six corrected lessons score 100/100, with all twenty-three categories assessed. Each of the nine scoped exercised-process assessments also scores 100/100.** These are completed category sums, not a conversion of 97/97 into 100. The scores apply to the reviewed, corrected and delivered release; they do not replace the first-author scores or establish universal first-draft reliability.

Validation included a clean locked dependency installation with scripts disabled, rebuilding the index, the repository checker, and **26 passing automated tests**. The clean validation copy preserved all 147 selected files byte for byte. The practice browser check passed 24 page/mode cases and 12 form cases; the chemistry browser check passed 40 cases. Integration checked all twenty-six lessons in wide and narrow layouts with verified doubled body text and scripts disabled. The two final formula/calculation overflow findings were corrected and rechecked; their earlier failures remain in the private evidence. Independent reviewers also verified affected live bytes, navigation, and layout behavior. The clean-install evidence is a transcript of the execution tool result, distinguished from the separately captured build/check/test log.

The separate Claude Code review is in progress against the same lesson files and public source slices. Private original assignments and earlier reviewers' scores are withheld from that reviewer. Its opinion will be recorded separately, without averaging it with Astra's scores.
