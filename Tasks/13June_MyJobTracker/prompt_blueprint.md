# Job Interview Command Center - Production Blueprint

Create a local-first Job Interview Command Center as a single-page React 18+ application scaffolded with Vite. All application state data must persist seamlessly in the client's browser using IndexedDB via a native browser transaction wrapper or the `idb` npm package. The architecture must remain 100% serverless and client-bound; no backend services, cloud storage integrations, or authentication layers are allowed.

### Core Architecture & State Management
- **State Provider Wrapper:** Implement an explicit custom React context provider (`JobProvider`) to wrap the application, managing loading lifecycles, global theme state, and asynchronous IndexedDB transactions cleanly.
- **Optimistic Architecture:** Ensure all UI CRUD actions initiate an optimistic structural update in React state, synchronizing immediately with IndexedDB transactions behind the scenes for instantaneous user feedback.
- **Sync Drawer Boundary:** Ensure the slide-over editing panel binds dynamically to the primary reactive array stream (`jobs`), updating the layout board instantly when internal properties (such as pipeline lane shifts or round counts) change.

### Interview Data Model Constraints
Each job record object must contain:
- `id` (string, unique UUID)
- `companyName` (string, required)
- `jobTitle` (string, required)
- `linkedinUrl` (string, validated URL format)
- `resumeUsed` (string, selectable value mapping to user resume tag variants)
- `dateApplied` (ISO timestamp, editable)
- `salaryRange` (optional string notation, e.g., "₹25-30 LPA")
- `notes` (optional string paragraph field for free-text logs)
- `status` (string enum matching Kanban columns exactly: 'wishlist' | 'applied' | 'follow-up' | 'interview' | 'offer' | 'rejected')
- `interviewRoundType` (string enum: 'screening' | 'technical' | 'manager' | 'system-design' | 'hr' | 'none')
- `interviewRoundNumber` (integer field, required, initialized to 0; increments as user updates interview progress)
- `prepChecklist` (array of objects containing `{ id, task, isCompleted }` to allow step tracking)
- `lastStatusChangeDate` (ISO timestamp tracking column shifts to evaluate stagnation rules)

### UI/UX, Interaction Layout & Theme Control (Tailwind CSS)
1. **Dual-Theme Adaptive System:** Implement an edge-to-edge light/dark theme module utilizing Tailwind's `dark:` variant utilities. Bind a Sun/Moon toggle button to a persistence provider that injects or removes the `.dark` class selector directly over the HTML root element while caching user selection to `localStorage`.
2. **Dashboard Minimalism:** Style a clean dashboard inspired by Trello-minimal or Linear. All Kanban cards (except in 'interview' status) must stay highly compact and minimally styled with subtle borders and clear typography adaptive to light/dark background switching.
3. **Adaptive Round-Based Color Engine:** When a card is in the 'interview' column, dynamically compute a unique background gradient and border configuration based strictly on its current `interviewRoundNumber`. These color spaces must be fully fine-tuned to ensure high typographic legibility across both Light and Dark modes:
   - **Round 1:** Light Sky Blue / Azure profile gradients mapping to deep contrast text profiles (`from-blue-50 to-sky-50` / `dark:from-sky-950/50 dark:to-blue-900/40`).
   - **Round 2:** Subtle Violet / Indigo spectrum combinations (`from-violet-50 to-indigo-50` / `dark:from-violet-950/50 dark:to-indigo-900/40`).
   - **Round 3+:** Deep accent Amber / Orange gradients to flag urgent late-stage pipelines (`from-orange-50 to-amber-50` / `dark:from-orange-950/50 dark:to-amber-900/40`).
4. **Funnel Analytics Hero:** Place a summary row above the board tracking: total application throughput count, total active interviewing pipelines, live interview slots, offers claimed, and a calculated closed outcome win-rate conversion percentage.
5. **6 Fixed Kanban Columns:** Wishlist, Applied, Follow-up, Interview, Offer, Rejected. Each column must be structurally fixed to a viewport height container (`h-[calc(100vh-14rem)]`) and scrollable independently along the Y-axis.
6. **Interactive Slide-over Panel (Drawer):** Implement an elegant slide-over panel that glides smoothly from the right edge of the viewport over a soft backdrop blur layer. This view isolates editing tools, textareas for recruiter log text tracking, custom checklist injection fields, and responsive round tracking selectors.

### Core Functional Blueprint
- **Drag-and-Drop Operations:** Implement accessible, modern drag-and-drop mechanics across the 6 Kanban lanes using exclusively `@dnd-kit/core`. Dropping a card updates its `status` attribute, overwrites `lastStatusChangeDate` to the current time, and saves state instantly.
- **Filtering & Search:** Attach a global keyword filter header input component enabling users to perform instantaneous search indexing across company names, engineering roles, or internal notebook log entries.
- **Data Mobility APIs:** Expose functional settings components providing single-click file schema export functions producing system standard raw text `.json` local downloads containing state snapshots, alongside a backup import process using file readers to restore tables.
- **Sorting Methods:** Include toggles within columns to instantly switch card sorting arrangements by execution date hierarchy order (`newest` or `oldest`).