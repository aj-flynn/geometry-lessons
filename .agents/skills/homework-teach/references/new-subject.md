# Create a missing subject skill

Use a course discipline or language as the boundary. Algebra and Geometry differ, as do French and Spanish. Ordinary subtopics and regional language variants stay in their discipline. Use Science for integrated inquiry, and create a distinct Physics or Biology skill when needed.

1. Consult available skill-authoring guidance. Create .agents/skills/<subject-id>-teach/SKILL.md with matching YAML name and a specific description. Link the [shared contract](../SKILL.md). Teach reusable prerequisites, notation, errors, useful visuals, transfer, and domain-specific ways to avoid answering the assignment. Give it a "Lesson structure" section like the other subject skills: the walkthrough that teaches each kind of task (slideshow, then steps with a "Why?") and the display used when a task tests definitions. Use a public subject ID unrelated to any person.
2. Register its lowercase hyphenated id, public label, and skill path in the selected library's subjects.json. The registry drives index grouping and validation. Check the artifact, and retain existing URLs.
3. Generate from the actual assignment. Verify the route, exercise the new skill, and check the lesson before publishing. A new subject follows the existing library's verified route. It does not authorize a new library or recipient.
