# Reliable homework orchestration

This runbook describes orchestration, not permission. The owner’s current instructions,
verified private routing, current subject skills and independent review remain authoritative.
It does not authorize new recipients or expose source material. The helper never downloads,
launches workers, publishes, or sends messages. The coordinator performs those actions only
within its existing authorization.

## Preflight before authoring

1. Read current main and its applicable skills. Read unfinished jobs before new messages.
2. The coordinator downloads and opens every ordinary and inline source attachment. Keep
   originals, body instructions, page counts, source limitations and hashes in a private
   package outside every public checkout. Never publish that package, including to previews,
   branches, CI artifacts or public logs. Confirm actual sender and private library mapping.
3. Keep input preparation, authoring and browser QA on the same capable cloud computer when
   possible. Before costly work, verify the consumer opens the original images and hashes
   the package, and that a real browser renders a harmless representative page. A path from
   another computer is not a transfer receipt. If transfer is required, use the current
   supported private transfer API and verify bytes on the consumer before delegation.
4. In a managed Linux Sites environment, use the current official `sites-preview` workflow
   from the Sites skill. The managed daemon owns the preview process. Do not substitute a
   separately launched HTTP server or guess its port. Serve only a separately assembled,
   sanitized candidate directory. Never serve the source workspace. Verify the returned
   preview URL in the actual browser and identify the unique probe before using it for QA.
   After an executor/session reset or connection-refused navigation, check
   `sites-preview status` before diagnosing a lesson defect. If it reports stopped, verify the sanitized
   candidate's hashes, restart through `sites-preview start` with that same candidate,
   and recheck the exact returned URL. Do not assume the old port remains valid or spin
   navigation retries. Record the restart and any changed candidate/environment; apply
   the normal invalidation or repreflight rules when either changes.
   This is a local preview, not publication. Do not use a denied file URL or change security
   settings. Elsewhere, select a supported private preview and prove it works first.
5. Require actual source intake and browser preflight receipts. A queued thread, installed
   browser, running server, or successful upload alone is not a capability pass. Reuse the
   existing assignment thread; replace it only after confirming the former owner stopped.
   Preflight every capability required by the current review contract, including print
   pagination or no-JavaScript testing when required. Use supported browser controls, not
   blocked developer tools. Restore temporary per-site test settings. A disabled print
   feature or other missing required capability remains an explicit blocker; a passing
   interaction test does not certify the untested criteria or earn a full review score.

## Private authoritative state

Run `python scripts/homework-job.py ACTION` with a JSON object on stdin. The default private
state directory is `/workspace/shared/homework-automation`; `HOMEWORK_STATE_DIR` may select
an explicitly configured private directory on the same coordinator computer. Runtime data
is never committed. The helper refuses an absent ledger until explicit `init`, and rejects
state/evidence inside a Git checkout. Do not use eventually consistent notes as locks.

The same durable computer and ledger must serve all polls. If the ledger is missing,
unavailable, or unexpectedly empty, fail closed: reconcile original messages, prior threads,
remote publication and sent-mail evidence before initializing or restoring it. Do not start
an empty ledger as a shortcut. Preserve historical exclusions, duplicates and confirmed sends.
Back up the private ledger through the supported private storage workflow; restore only after
reconciling events that may have occurred since the backup. Never put it in this repository.

Every command returns private JSON. It may include addresses, message IDs, paths and state;
do not expose output in public logs or artifacts. Keep lease tokens local to the coordinator.

### Commands

- `init`: `prior_state_reconciled: true`, `receipt`. One-time ledger creation after inspecting
  existing history; refuses an already initialized ledger; a failed initialization can be repaired only after renewed reconciliation. `receipt` is `{path, sha256}` for an existing
  private evidence file. Every substantive stage uses a verified private evidence receipt.
- `enqueue`: `mailbox`, original `message_id`, verified `sender`, opaque `library`, canonical HTTPS `site_root`, optional
  input context. The mailbox/message pair is idempotent. A different sender/library on the
  same ID fails rather than silently rerouting. A duplicate message is not inferred only
  from equal attachment hashes: compare sender, body instructions, sources and prior outcome.
- `import-handled`: same identity plus verified `disposition` (`sent_confirmed`, `duplicate`,
  or `excluded`) and `receipt`. Imports reconciled historical outcomes only, never an attempted
  or uncertain send. Existing processing state cannot be replaced.
- `list` / `get` (`job`): reconcile unfinished jobs before discovering new work. A blocked
  job is unfinished, not handled. Inspect the saved thread and immutable source references.
- `claim`: `job`, coordinator `owner`, optional `ttl` (30–7200 seconds; default 1800).
  SQLite serializes claims. Only the authoritative coordinator may perform external Git/email actions; workers never send directly. Lease fencing protects state writes, not a previously launched external process. The result includes `token` and monotonic `generation`.
  Reclaiming an expired active lease also requires `previous_work_reconciled: true` after
  verifying no prior worker remains active. Lease expiry does not stop a worker or permit
  duplicate work. Send intents and completed/uncertain/manual-blocked jobs cannot be claimed.
- `renew`: `job`, `token`, `generation`, optional `ttl`. Renew while a worker is active.
  All mutations require the current unexpired lease; stale workers are fenced out.
- `checkpoint`: `job`, `token`, `generation`, next `stage`, and `evidence`. The next stage
  must be contiguous; an assertion alone is not verification. Evidence file hashes are
  checked. Store actual tool receipts and observations, not invented passes.
- `repreflight`: current ownership, `reason`, `previous_work_reconciled: true`, and `receipt`.
  Before publication only, stop/reconcile the old worker and return to source_ready, clearing
  old environment and downstream review evidence. Then verify actual source/browser access
  on the replacement environment before the next checkpoint.
- `invalidate`: current ownership and `reason`. Returns pre-publication work to `drafting`
  when candidate or contract changes. Regenerate affected evidence and obtain fresh review.
- `block`: current ownership, exact `reason`, `retryable`. Releases the lease while preserving
  the completed stage. Transient failures get at most three scheduled retries with backoff.
  Denials, missing permission, incomplete source requirements and unsupported capabilities
  are nonretryable. Do not repeatedly attempt them. `reconcile-block` requires `job`, specific
  `new_evidence` and its `receipt` before reopening a manual blocker. Elapsed time alone is
  not new evidence. Report material changes, not unchanged reminders every poll.
- `resolve-publish`: current ownership, matching `operation`, `outcome` and `receipt`. Use
  `definitely_not_executed` only after remote evidence establishes no push took effect; it
  releases the library reservation and returns to drafting for rebase/review. `unknown` keeps
  the reservation. Confirmed publication uses the normal published checkpoint.
- `send-result`: `job`, original `operation`, `outcome` (`confirmed` or `uncertain`), `receipt`;
  confirmed also requires `provider_confirmation`. An uncertain intent never becomes retryable
  on lease expiry. A later provider receipt can confirm it, but no second send is authorized.
  A known failed send must remain stopped until the coordinator reconciles it rather than
  treating a generic exception as proof that nothing was sent. Accepted is not delivered.

### Stages and evidence

Every stage includes `receipt`. The helper validates presence/consistency of these fields;
only independent observations can establish that the statements are true. Drafting must use the preflighted environment; a new environment requires repreflight and fresh verified intake/browser evidence.

|Stage|Additional evidence|
|---|---|
|source_ready|source_sha256, attachment_count, package_verified=true|
|environment_ready|environment_id, sources_opened=true, browser_preflight_passed=true, preview_recipe|
|drafting|thread_id, environment_id, repository_revision|
|review_pending|candidate_sha256, contract_sha256|
|review_passed|same candidate/contract hashes, independent_score=100, unassessed=0, browser_verified=true|
|publish_intent|operation, base_commit, same candidate/contract hashes|
|published|same operation and candidate/contract hashes, commit, remote_verified=true|
|live_verified|same candidate/contract hashes and commit, canonical url/library_url within site_root, live_bytes_verified=true, index_verified=true|
|send_intent|operation, original_thread_verified=true, sent_items_checked=true|
|sent_confirmed|recorded only by send-result with provider confirmation|

The package hash can identify an immutable manifest with per-source hashes. The candidate
hash must identify the complete frozen file manifest, not just the HTML. The contract hash
identifies the actual governing skill/rubric revision. New bytes invalidate affected review.

A `publish_intent` atomically reserves the library until the remote outcome is verified.
Before pushing, compare the actual current branch head with `base_commit`; safely merge
concurrent index changes and rerun affected checks if it differs. Never force-push. After a
crash or uncertain push, inspect the remote before any retry. Resume the recorded operation.
Do not clear the publication reservation merely because a timeout passed.

A `send_intent` is persisted before calling the provider. Reconcile the original thread,
Sent Items and current ledger first. After a crash or ambiguous provider result, do not send
again. Publication, a reply attempt and an accepted reply are distinct from confirmed sending
and from delivery. Keep the original reply destination; no fallback outreach is authorized.

## Recovery tests

Run `python -m unittest discover -s tests -p test_homework_job.py -v` and the repository’s
normal checks. Tests use synthetic identities and private temporary ledgers. They exercise
concurrent claims, expired-owner fencing, stage/hash/review gates, library publication locks,
uncertain-send crash recovery, bounded retries, receipt changes and private-path constraints.
These tests validate coordination logic, not the external inbox, browser, deployment or email.
Perform a full real assignment through the actual integrations before claiming end-to-end
reliability. No process can guarantee availability of third-party services at all times.
