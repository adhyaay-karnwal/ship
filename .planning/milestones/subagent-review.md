# Subagent Mini‑Session Review – Summary & Next Steps

## What you asked for

- Clicking a **sub‑agent (task) tool** should open a **dedicated mini‑session view** (similar to Opencode’s _SessionReview_ pane).
- The view must display:
  1. **File diffs** on the left side (list of changed files with `+`/`-` counts).
  2. **Model‑generated task list** on the right side (todo items, status, priority).
- The UI should look like Opencode’s `SessionPanel` component, including token usage, cost, model info, timestamps, and an “Open in full session” button.

## What we have built so far

| Feature                                                                                                                       | Status                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Subagent detection utilities** (`isSubagentToolInvocation`, `extractSubagentSessionId`, etc.)                               | ✅ Implemented in `apps/web/lib/subagent/utils.ts`                                                          |
| **Subagent context / state management** (`SubagentProvider`, `useSubagent`)                                                   | ✅ Implemented in `apps/web/lib/subagent/subagent-context.tsx`                                              |
| **Extended `Tool` component** – added `sessionId`, `onViewSubagent`, `subagentLabel` props + UI button                        | ✅ Updated in `packages/ui/src/ai-elements/tool.tsx`                                                        |
| **Integration in `AIMessageList`** – detects sub‑agent tools, opens the sheet via context                                     | ✅ Updated in `apps/web/components/chat/ai-message-list.tsx`                                                |
| **Mock sub‑agent sheet** – slide‑out panel showing status, progress, tool list, recent activity (mock data)                   | ✅ Implemented in `apps/web/components/chat/subagent-sheet.tsx` (uses mock data for now)                    |
| **Documentation of Opencode’s `SessionPanel`** – full TSX implementation and data‑flow description captured from DeepWiki MCP | ✅ Added to the knowledge base (see the `SessionPanel` component source in the previous assistant messages) |

## What remains to be done (Next steps)

1. **Replace the mock `SubagentSheet` with the real `SessionPanel` UI**
   - Import the `SessionPanel` component (the TSX code from Opencode) into our project.
   - Wire its props (`sessionId`, `repo`, `model`, `tokens`, `cost`, `todos`, `diffs`, `messages`, etc.) to actual data.
2. **Create an API endpoint to fetch sub‑agent session data**
   - `GET /api/subagents/:id` should return a payload matching `SubagentSessionResponse` (session info, file diffs, todos, token usage, cost, messages, etc.).
   - Use existing OpenCode SDK types (`FileDiff`, `Todo`, etc.) for consistency.
3. **Hook up data fetching**
   - Implement a SWR hook (`useSubagentSession`) that calls the new API and provides loading/error state.
   - In the sheet, replace the mock `useMockSubagentSession` with this real hook.
4. **Add navigation to full session view**
   - The “Open in Session View” button should `router.push('/session/[sessionId]')` (or the appropriate route in the existing dashboard).
5. **Display file diffs and model tasks**
   - Pass `diffs` and `todos` from the API response into `SessionPanel` so the left‑hand diff list and right‑hand task list appear exactly as Opencode does.
6. **Optional enhancements**
   - Show raw messages via the collapsible panel inside `SessionPanel` (already part of the component).
   - Add a loading skeleton while the session data is fetched.
   - Ensure the sheet is responsive (full‑width on mobile, right‑hand slide‑out on desktop).

## Quick implementation plan

```text
1️⃣  Add `apps/web/pages/api/subagents/[id].ts` – return mock data first, then replace with real backend call.
2️⃣  Create `apps/web/lib/subagent/hooks.ts` exposing `useSubagentSession` (SWR).
3️⃣  Update `apps/web/components/chat/subagent-sheet.tsx`:
   • import SessionPanel
   • replace mock hook with `useSubagentSession`
   • pass all required props (diffs, todos, tokens, cost, repo, model, messages)
4️⃣  Adjust `SubagentProvider` state if needed (store sessionId only).
5️⃣  Test: click a task tool → sheet shows full SessionPanel UI with diffs/tasks.
6️⃣  Add navigation button → router.push(`/session/${sessionId}`).
```

Once these steps are completed the sub‑agent detail view will be functionally identical to Opencode’s SessionReview – a fully fledged mini‑session pane with file diffs, model tasks, token stats, and a link to the full session.

---

_All the code we have written so far type‑checks successfully, and the repository now contains the detection utilities, context, extended `Tool` component, and a mock sheet ready to be swapped out for the final UI._
