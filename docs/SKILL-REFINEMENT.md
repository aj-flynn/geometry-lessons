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

### Independent Claude opinion and bounded corrections

Claude Code completed an independent review on 2026-11-07 using `claude-opus-5-5`, Medium effort, and no session persistence. The returned model usage confirmed `claude-opus-5-5`. Its opinion applies to the lesson bytes in commit af0a8e7, before the corrections described below. Prior scores and conclusions were withheld.

The secondary review scored the exercised process **85.5/100**. Its lesson scores are preserved below without averaging them with Astra or normalizing partial scores. A1 and F2 were unassessed for the eight library lessons because their private original assignments were not authorized for this external reviewer. Public sample scopes were supplied.

| Lesson | Claude assessed points | Assessed maximum |
| --- | ---: | ---: |
| [0001-similar-polygons](../lessons/0001-similar-polygons.html) | 81.75 | 89 |
| [0002-close-reading-dialogue](../lessons/0002-close-reading-dialogue.html) | 81 | 89 |
| [0003-reading-particle-formulas](../lessons/0003-reading-particle-formulas.html) | 78.25 | 89 |
| [0004-electrons-and-bonds](../lessons/0004-electrons-and-bonds.html) | 82.75 | 89 |
| [0005-shape-and-polarity](../lessons/0005-shape-and-polarity.html) | 80.5 | 89 |
| [0006-between-molecules](../lessons/0006-between-molecules.html) | 81 | 89 |
| [0007-aa-triangle-similarity](../lessons/0007-aa-triangle-similarity.html) | 82.5 | 89 |
| [0008-chemistry-evidence-split](../lessons/0008-chemistry-evidence-split.html) | 80.5 | 89 |
| [geometry-perimeter](skill-samples/lessons/geometry-perimeter.html) | 88 | 100 |
| [geometry-similarity-proofs](skill-samples/lessons/geometry-similarity-proofs.html) | 89.25 | 100 |
| [geometry-construction](skill-samples/lessons/geometry-construction.html) | 88 | 100 |
| [chemistry-balancing](skill-samples/lessons/chemistry-balancing.html) | 90.75 | 100 |
| [chemistry-balancing-with-states](skill-samples/lessons/chemistry-balancing-with-states.html) | 89.5 | 100 |
| [chemistry-from-words](skill-samples/lessons/chemistry-from-words.html) | 90.25 | 100 |
| [chemistry-names-formulas](skill-samples/lessons/chemistry-names-formulas.html) | 90.5 | 100 |
| [chemistry-ionic-and-molecular-names](skill-samples/lessons/chemistry-ionic-and-molecular-names.html) | 89 | 100 |
| [chemistry-ionic-equations](skill-samples/lessons/chemistry-ionic-equations.html) | 89.25 | 100 |
| [chemistry-reference-tables](skill-samples/lessons/chemistry-reference-tables.html) | 88.5 | 100 |
| [chemistry-isotope-mass-and-error](skill-samples/lessons/chemistry-isotope-mass-and-error.html) | 93.25 | 100 |
| [english-tone](skill-samples/lessons/english-tone.html) | 90 | 100 |
| [english-two-sources](skill-samples/lessons/english-two-sources.html) | 91 | 100 |
| [science-fair-tests](skill-samples/lessons/science-fair-tests.html) | 88 | 100 |
| [science-map-evidence](skill-samples/lessons/science-map-evidence.html) | 91 | 100 |
| [science-sea-level](skill-samples/lessons/science-sea-level.html) | 90.75 | 100 |
| [spanish-agreement](skill-samples/lessons/spanish-agreement.html) | 91.25 | 100 |
| [spanish-estar](skill-samples/lessons/spanish-estar.html) | 89.25 | 100 |

Claude reported no consequential subject errors in its recomputations. It raised concerns about source separation, coverage, task discovery, model qualifications, labels and review evidence. Its visual scores were based on code and supplied evidence: plan-mode constraints prevented its own browser rendering. It did not measure contrast or perform a screen-reader audit. The secondary packet also omitted existing sample-control receipts and did not fully explain inherited browser evidence or unavailable source media; a separate private evidence supplement repairs that handoff without implying Claude used it.

The source-aware Astra reviewers revisited the concrete findings against the unchanged rubric. They accepted several bounded corrections, including structurally distinct geometry and reference-table practice, intact positive ion groups and oxide naming, an equal-energy stopping-rule decision, clearer discovery of staged repair, precise control/color labels, and an explicit bond-arrow model limitation. They also identified screen/print false positives and distinguished optional additions from requirements. Their earlier approvals were too generous on the accepted issues; those reports remain historical rather than being silently rewritten.

The combined chemistry lesson remains a full combined alternative, as requested. Shared skills now explicitly test whether substituting labels or numbers would reproduce assigned solution steps, advertise required actions inside disclosures, and require complete review-evidence handoffs with explained dependency changes. Rubric weights and acceptance standards were not lowered.

Six original Astra reviewers completed bounded rechecks of the affected lessons, carrying forward explicitly unchanged judgments. Each affected lesson has **97/97 assessed points**, with F3's three delivery points unassessed for these new bytes. The exercised correction process has **85/85 assessed points**, with its fifteen validation/delivery points unassessed. These are incomplete totals, not normalized 100s. Publication and live verification follow this recorded local acceptance.

The corrected candidate passed the repository checker and all 26 automated tests in a private validation copy with locked dependencies installed using scripts disabled. Integration covered 29 pages in 87 wide/narrow/enlarged-text/script-disabled modes and checked 563 local links. The final proof prerequisite and compound-name wrapping changes received six additional affected layout checks. Independent reviewers inspected the changed task attempts, keyboard behavior and actual paginated print; the ordinary-name wrapping fix preserved all six print pages pixel for pixel. Earlier failed probes and their corrections remain in private evidence.

The following lesson hashes supersede the corresponding earlier entries. Other lesson HTML is unchanged; the selected release receipt binds all dependencies and the revised shared contract.

| Corrected lesson | SHA-256 |
| --- | --- |
| [chemistry-ionic-and-molecular-names](skill-samples/lessons/chemistry-ionic-and-molecular-names.html) | `df951c64c6b36053b4dca05d4c8e5c13261e70f3b0c0dc30a0f6a7a36d6bbf0b` |
| [chemistry-ionic-equations](skill-samples/lessons/chemistry-ionic-equations.html) | `93ebf97d07e6f8cc9b5a8d42a010a178754d486ac16f4ee2820e1a558ac2b5d5` |
| [chemistry-names-formulas](skill-samples/lessons/chemistry-names-formulas.html) | `029dcf698cc7fcffbdb5d38444b7014b28cdeaef8253b05cc5b996d9b8f6618e` |
| [chemistry-reference-tables](skill-samples/lessons/chemistry-reference-tables.html) | `8f00fbc83b8d232019ce76ea9a11256401a55d952a5fa1af32e0632ab3a17ea3` |
| [english-tone](skill-samples/lessons/english-tone.html) | `b2a0ebb62243399061fbafaa361908c193ce666f2ffec6ecfb287e0e9f75a53b` |
| [geometry-perimeter](skill-samples/lessons/geometry-perimeter.html) | `1b4080dbf5e326e5bd10db55ddc982e959c1e25608ab94aa4623b96eb2a61c90` |
| [geometry-similarity-proofs](skill-samples/lessons/geometry-similarity-proofs.html) | `f902d3fae1f7b0496c3cbab3d634ad925c764f580ddbebf106100263a7927960` |
| [science-fair-tests](skill-samples/lessons/science-fair-tests.html) | `350a4295c4211c5914cc531f60f844b147f6a5ff0449dacf8b0d91af65cf997b` |
| [science-sea-level](skill-samples/lessons/science-sea-level.html) | `6d8fdafa41e6e9b9ff73851a22f01b0d50ac590f9d5a6a1ae486a3e013d80343` |
| [0003-reading-particle-formulas](../lessons/0003-reading-particle-formulas.html) | `aa5845c8cc376622b2eeb6b929f0162a8ad4a5c93179edfb09bbee53d531bad8` |
| [0005-shape-and-polarity](../lessons/0005-shape-and-polarity.html) | `31bda595409571fe6798504cd795b37d2e7d1088c04070a09c56c83abf50568e` |
| [0008-chemistry-evidence-split](../lessons/0008-chemistry-evidence-split.html) | `8b42a614c892bdc8a4869cdf7f111df1829fe275f1c368ec90351f7340c10120` |
