# Setup verification

Verified 2026-11-04. This records setup evidence, not a learner's progress.

## Completed

- Public repository `aj-flynn/geometry-lessons` created under the authorized account.
- GitHub Pages configured for `main`, `/ (root)`, with HTTPS enforced and `.nojekyll`.
- Initial build reported `built` with no build error. The live root page loaded at https://aj-flynn.github.io/geometry-lessons/ and displayed the intended empty library.
- Published page inspected in a browser at 1440px, 768px, and 390px. The triangle remains inside the page, the content stacks on the phone, and no horizontal content overflow was observed. Navigation to the learning guidance works. The inline SVG has a descriptive title and text alternative; body/controls have readable text, and the stylesheet includes visible focus, print, and reduced-motion rules.
- Source style lint passed with zero findings. Browser inspection used the supported browser tools; the design skill's separate browser-driver inspector was not run.
- Five Node tests pass: safe index metadata/filenames, rejection of common embedded-input/network/storage patterns, reviewed file hashes and index consistency, mathematical angle endpoints plus stop/reset/reduced-motion behavior, and local practice feedback.
- Two Python tests pass using synthetic DOCX files in a temporary directory outside the repository: body/equation/media reporting without extraction; macro/entity rejection. No real student attachment was used or committed.

## Still requires a real end-to-end test

- Photo, PDF (including scanned diagrams), and Word attachment visibility through the intended chat route. Native visual reading is required for geometry marks and layout; the DOCX helper is only a text inspection aid. PDF ingestion and OCR were not tested in this setup.
- Creating a concept lesson from actual supplied homework, including semantic privacy/no-answer review, mathematical diagram review, and browser checks of that lesson's animation and feedback. The library has zero lessons intentionally.
- Loading/installing the skill in the dot's execution environment. The repository package is ready, but no successful personal-dot skill installation has been verified.
- Confirming who can start the workflow and verifying that its result returns to the original chat/thread. No listener, event subscription, or scheduled task was created. Official documentation says only the owner can direct a personal dot.
- Live operating-system reduced-motion, JavaScript-disabled, print, 200% zoom, and assistive-technology checks for a real lesson. Source fallbacks and synthetic behavior tests are present; these device/browser modes were not all exercised.

## Execution limitations encountered

The restricted executor could not use its GitHub/network login, but the authorized GitHub connection and signed-in browser completed creation/publication. A later read-only GitHub CLI check outside the restricted sandbox confirmed the existing login works; no reauthentication was needed.

The local preview HTTP connection timed out and file-protocol browser navigation was denied. No file-protocol workaround was used. The intended public Pages site was inspected after its authorized publication.

Writing the default personal-skills directory was denied. A fallback clone of the personal-skills remote did not finish and was stopped; no personal skill was saved or pushed by that attempt. The reusable skill remains available in this repository. Its installation is separate from website publication.

