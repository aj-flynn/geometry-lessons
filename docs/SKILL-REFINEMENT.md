# Current shared workflow refinement

| Fixed candidate | Independent assessment | Category scores | Total |
| --- | --- | --- | ---: |
| Initial corrected router | Astra / high | 30, 20, 20, 15, 15 | 100 |
| Same router | Claude Code `claude-opus-5-5` / high | 26, 17.5, 17, 12, 11.5 | 84 |
| Expanded privacy and dependency checks | Astra / high | 30, 20, 20, 15, 13 | 98 |
| Restricted static imports | Astra / high | 30, 20, 20, 15, 13 | 98 |
| Parsed HTML profile and complete static asset checks | Astra / high | 30, 20, 20, 15, 15 | 100 |
| Same parsed-HTML candidate | Claude Code `claude-opus-5-5` / high | 26, 18, 17, 13, 12 | 86 |

Category order is privacy/authority, teaching, subject accuracy, repeatability, validation/delivery. These are shared-process opinions, not individual lesson scores. No average substitutes for either reviewer. Both Claude invocations returned the exact requested model in `modelUsage`; high effort was supplied explicitly. They received public workflow files only, not private homework. The current process is an intermediate improvement, not completion of the owner's dual-100 target.

The first Opus findings led to privacy scans across skills/review records, exact transitive asset hashes, full learner-destination review, explicit read-only reviewers, both-stage plateau handling, cross-subject re-exercise, actual-subject correction, language markup, and generic subject navigation. Subsequent Astra probes found a template-expression import gap and an inline HTML handler gap.

Two independent brainstorming agents each proposed at least three untried approaches. For JavaScript loading, options were a restricted static declaration profile, closed bundles, and a full publication inventory; the static profile was selected. For executable HTML, options were a standards-aware restricted HTML surface, generated browser CSP, and a complete resource inventory; the parsed HTML surface was selected. The implemented guards retain ordinary reviewed scripts and `addEventListener`, restrict imports/resources, and reject executable HTML attributes/URLs, embedded documents and ordinary runtime loaders. They do not claim to prove arbitrary JavaScript safe; semantic and browser review remain mandatory.

The latest Opus report identified concrete remaining work: apply resource guards to non-lesson pages, hash linked reference pages and their dependencies, block ordinary runtime navigation, clarify private evidence pointers and advisory reviewer output, resolve email-triggered subject-creation scope, make optional skill-tool discovery portable, and commit instruction-level routing scenarios. It also expressed reservations about reliance on semantic judgment for teaching/accuracy and manually verified delivery. Those judgments are preserved rather than replaced with Astra's higher score. No actual private leak or unsafe runtime load was found in the six published lessons.

Astra observed 25 passing JavaScript tests, two passing DOCX tests, a passing six-lesson checker, exact generated-index equality, and unchanged scoped hashes. Opus observed the checker and all 25 JavaScript tests passing; its attempts to create synthetic probes were denied by its read-only tool permissions, so those findings were explicitly code-based inference. Neither shared-process review claims private-input alignment, a screen-reader audit, or learner outcomes. Parent publication independently verifies public delivery.

| Shared artifact | SHA-256 |
| --- | --- |
| homework-teach/SKILL.md | da60e72e895939edcbbce254212e0547f9af38e764a593b86f7bba154d4f2212 |
| references/independent-refinement.md | ef6aa98dc664c7c49afdcc378d84b34e32197b8f791bdbcd02a77c024be8d93e |
| references/lesson-workflow.md | 5efce8001cd400055696f3a8d05a31c93e5fb934d3ef7623ddeff595a1a725cb |
| scripts/check.mjs | fe55f078a192a212cd5252a5f394ce0d44607019ae823fb0289454b98cdb9823 |
| scripts/build-index.mjs | 5c2a9ad0db5e2602553afcb99f619ac649dd1291a5b9e963fb1c81391bd6c993 |
| docs/REVIEW-RUBRIC.md | e211e43881ccea2c3d19dd89d5bdeda128f9d053f9bf52c3736b418ac3666d87 |

The following sections retain earlier fixed-candidate history.

---

# Subject-skill refinement

This run restructures the shared homework workflow into subject routing and reusable subject skills. The authorized destination remains the existing lesson library; private email partitioning rules remain in place for separately provisioned incoming libraries. No email integration or new library was installed by this work.

The completion target is 100/100 from independent Astra and then 100/100 from Claude Code Opus 5.5 at high effort, for the same lesson candidate and reusable process. Intermediate improvements may be published with their actual scores; they are not final certifications. The rubric's category weights are unchanged.

## Shared process

| Assessment | Model / effort | Score | Findings and status |
| --- | --- | ---: | --- |
| Initial shared routing/refinement review | `gpt-6-astra` / high, fresh context | 94/100 | Boundaries 30/30, teaching 20/20, accuracy safeguards 20/20, repeatability 12/15, validation/delivery 12/15. Required explicit regeneration from changed skills and executable checks for actual registered skill artifacts. This was a procedural assessment, not a lesson score. |
| Revised shared routing/refinement review | `gpt-6-astra` / high, fresh context | 99/100 | Boundaries 30/30, teaching 20/20, accuracy safeguards 20/20, repeatability 15/15, validation/delivery 14/15. Regeneration and registered-artifact checks resolved the earlier findings. The checker still permits a separate library without its own registry through a legacy-fixture fallback; removing that fallback is pending. Current-library checks do validate its registry. |

The first revision explicitly requires regeneration or re-exercising affected teaching sequences using the revised skill and the original private input. Registry validation now checks publishable skill artifacts, frontmatter names, links to the shared contract, and resolving local references. Twelve focused registry/workflow tests passed, including missing-skill and broken-reference cases. Subject lessons and skills are undergoing separate independent reviews; final scores and delivery remain pending.

Claude Code returned `claude-opus-5-5` in `modelUsage` for a minimal availability probe with `--effort high`. This establishes availability, not a review result. Full prompts, source comparisons, and raw reviewer output remain outside this public repository.

## Baseline lessons

| Scope | Independent reviewer | Score | Reviewed HTML |
| --- | --- | ---: | --- |
| Geometry | Astra / high, fresh context | 88.5/100 | `ec1cdc1343cb1397f5b4cc59c304ab19eca6e1042b0ebb270674cedb525bd613` |
| English | Astra / high, fresh context | 86.25/100 | `bfd1bec929f3575ee30832ffd1b1ed5c76a2d197b5efaf545a970ab99d239b4d` |
| Chemistry: particle formulas | Astra / high, fresh context | 84/100 | `6f07606319c772494c30a30b615199b6e069ffe8e0c1ddf88934e7b70dea5aa9` |
| Chemistry: electrons and bonds | Astra / high, fresh context | 76/100 | `da8ca9a7bd2d822d3d7545811d203e3128102a830481c4bc442b8b6e462bf138` |
| Chemistry: shape and polarity | Astra / high, fresh context | 84/100 | `24d5d1d67f4388aec0ff380bc747cf820d755fa44d9f3a527b02f52a14ffa33c` |
| Chemistry: between molecules | Astra / high, fresh context | 82.5/100 | `bba376e9c84eeb650c0f8769fee671f6c3967b1a49f8ae757a394b94ff82e11f` |

These baseline scores are judgments about the inspected artifacts and evidence, not learner measurements. Detailed subject evidence is maintained in the corresponding lesson review records as improved candidates are published. Historical reviews under earlier rubric editions do not certify this run.


## First incremental delivery

Commit `b15c62fe3c47181bc3151226eed73627c63238e0` published the independently assessed shared-skill restructuring. Git normalizes text line endings; working-file hashes in assessments identify the inspected source. The live index returned HTTP 200 with six lesson links and Chemistry grouping. This was an intermediate shared-process update, not dual-model completion.

The next frozen publication includes English at 98.5/100 and Chemistry pages at 97.5, 97.5, 100, and 100 from fresh Astra/high reviews; English process 97 and Chemistry process 98. Geometry's 94-point candidate remains unpublished because the reviewer identified a learner-source homework-separation concern. The selected publication snapshot passed the checker and all 22 Node tests. Strict per-library registry validation, dynamic subject navigation, and English annotated-passage validation resolve the integration findings. Shared-process re-review and all final Opus reviews remain pending.


Publication line endings were normalized to LF by Git. This changes byte hashes, not teaching content. The prepublication score tables retain the exact inspected working-file hashes; the manifest records the canonical published bytes below. These intermediate reviews are not final dual-model certifications.

- `0003-reading-particle-formulas.html`: `b98a810cbb0ced5ce95199b12bea31d8d35cc56bfef4421149f3720e7ac09041`
- `0004-electrons-and-bonds.html`: `32b650c8e04e1764852fc2b3c6769374fa082d5a382e383d3cda46b90f795222`
- `0005-shape-and-polarity.html`: `f7f2fb14d0546d89be3a99ba5ac08b49fa73db35ee3311e92d9b93273f6053bd`
- `0006-between-molecules.html`: `bde337b15a20982daee3c5d93db839b1fafaf393482a55618d94ac01577ca24b`
