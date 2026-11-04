# Setup and routing

## Public library

Repository: `aj-flynn/geometry-lessons`. Expected library URL: `https://aj-flynn.github.io/geometry-lessons/`. Publish from `main`, `/ (root)`, with `.nojekyll`. The root `index.html` is generated from `lessons.json`. An empty index is intentional until real homework is supplied.

The repo contains the reusable `geometry-teach` skill, a lesson scaffold, shared responsive styles, optional interactive angle/practice helpers, and validation scripts. The skill must be loaded in the agent environment used for incoming requests. A file in a GitHub repository does not automatically install a personal dot skill or configure routing.

## Dot, attachments, and Slack

The supported routing depends on the account's actual dot and Slack configuration. Connecting the Slack plugin alone is not proof that an incoming Slack DM or file starts dot work. Do not create a bot token, share an account, invite broad access, subscribe to all messages, or install a listener without explicit authorization and the applicable permission flow.

Official documentation states that only the owner can direct a personal dot; messages from other people, including Slack mentions, do not start work or give them control. That means a child's direct message to a parent's personal dot must not be assumed to trigger this workflow. A parent can submit/forward the input through their own authorized conversation. A separate approved child-facing workflow needs its own confirmed routing and permissions; do not work around ownership controls.

Before claiming end-to-end delivery works, verify in the intended conversation:

1. The authorized sender can actually start the intended dot/task.
2. The agent receives readable attachments for a photo, a PDF (including a scanned page), and a Word document, with diagrams available for visual review.
3. The agent can load this skill and access only the intended repository through authorized GitHub access.
4. The generated concept lesson contains no input/PII or actual homework solution, passes semantic review and technical checks, appears in the root index, and deploys successfully.
5. The link appears in the correct originating chat/thread. Use the actual incoming routing context; never guess a destination.

Use a clearly synthetic, nonpersonal attachment for the first routing test. Test each format through the actual route; a local parser test does not verify chat attachment delivery. Do not publish test fixtures as genuine lessons or record private routing IDs in this public repo.

Until that test succeeds, the supported fallback is for the owner to attach the file in a conversation that can read it, explicitly invoke the repository workflow, and receive the result there. No scheduled automation, Slack webhook subscription, or background worker is configured by these files.

## Relevant official guidance

- [Dots safety and security: ownership and messaging boundaries](https://learn.chatgpt.com/docs/enterprise/dots-security)
- [Manage dots permissions and capabilities](https://learn.chatgpt.com/docs/enterprise/dots-admin-guide)
- [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Account-specific availability and access must be verified in the actual setup. Do not present documentation as proof that this account's route works.

