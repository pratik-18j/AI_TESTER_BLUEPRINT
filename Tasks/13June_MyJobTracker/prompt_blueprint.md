# Job Interview Command Center Blueprint

Create a local-first Job Interview Command Center as a single-page React 18+ application scaffolded with Vite. All application state data must persist seamlessly in the client's browser using IndexedDB via the `idb` npm package wrapper. The architecture must remain 100% serverless and client-bound; no backend services, cloud storage integrations, or authentication layers are allowed.

### Core Architecture & State Management
- Implement an explicit custom React context provider (`JobProvider`) to wrap the application and encapsulate all asynchronous IndexedDB transactions cleanly.
- Ensure all UI CRUD actions initiate an optimistic structural update in React state, synchronizing immediately with IndexedDB transactions behind the scenes.

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

### UI/UX & Interaction Layout (Tailwind CSS)
1. **Dashboard Minimalism:** Style a clean dashboard inspired by Trello-minimal or Linear. All Kanban cards (except in 'interview' status) must stay highly compact and minimally styled.
2. **Dynamic Interview Card Coloring:** When a card is in the 'interview' column, dynamically compute a unique background gradient and accent border color based strictly on its current `interviewRoundNumber` (e.g., Round 1 = Light Blue/Azure; Round 2 = Subtle Purple/Indigo; Round 3+ = Deep Orange/Teal). Cards for 'Company X' and 'Company Y' must visually differ if they occupy different round numbers within the same lane.
3. **Funnel Analytics Hero:** Place a summary row above the board tracking: total application throughput count, total active interviewing pipelines, and conversion metrics.
4. **6 Fixed Kanban Columns:** Wishlist, Applied, Follow-up, Interview, Offer, Rejected. Each column must be structurally fixed to 100vh height and scrollable independently along the Y-axis.
5. **Interactive Slide-over Panel (Drawer):** Clicking a Kanban card must NOT open a standard modal. Instead, implement an elegant slide-over panel that glides smoothly from the right edge of the viewport. This side view isolates the editing tools, recruiter log details, the step-by-step interactive `prepChecklist` checkboxes, an integer input to set the `interviewRoundNumber`, and a dropdown to select the `interviewRoundType`.

### Core Functional Blueprint
- **Drag-and-Drop Operations:** Implement accessible, modern drag-and-drop mechanics across the 6 Kanban lanes using exclusively `@dnd-kit/core`. Dropping a card updates its `status` attribute, overwrites `lastStatusChangeDate` to the current time, and saves state instantly.
- **Filtering & Search:** Attach a global keyword filter header input component enabling users to perform instantaneous search indexing across company names or explicit engineering role keywords.
- **Data Mobility APIs:** Expose functional settings components providing single-click file schema export functions producing system standard raw text `.json` local downloads containing state snapshots, alongside a backup import process using file readers to restore tables.
- **Sorting Methods:** Include toggles within columns to instantly switch card sorting arrangements by execution date hierarchy order (`newest` or `oldest`).
