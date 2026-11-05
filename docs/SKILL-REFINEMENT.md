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
