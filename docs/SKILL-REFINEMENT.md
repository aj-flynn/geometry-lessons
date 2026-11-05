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
