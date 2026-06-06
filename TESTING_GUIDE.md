# Testing Guide — Adaptive Learning Path Builder

Complete step-by-step guide to verify the application is running successfully.

---

## Phase 1: Setup & Prerequisites

### 1.1 Install Dependencies
```bash
npm install
```

**Expected Output:**
- All packages install without errors
- No deprecated packages warnings
- Ends with "added X packages"

### 1.2 Verify Environment Variables
```bash
cat .env
```

**Expected Output:**
```
VITE_SUPABASE_URL=https://hyzhutbpcakarmdimjqd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

If missing, the app will still start but API calls will fail.

---

## Phase 2: Code Quality Checks

### 2.1 TypeScript Type Checking
```bash
npm run typecheck
```

**Expected Result:** ✅ No output (0 errors)
```
> tsc --noEmit -p tsconfig.app.json
(silence = success)
```

**If it fails:** Shows list of type errors. Fix before proceeding.

### 2.2 ESLint Code Quality
```bash
npm run lint
```

**Expected Result:** ✅ No output (0 errors, 0 warnings)
```
> eslint .
(silence = success)
```

**If it fails:** Shows linting errors. Must be fixed.

### 2.3 Production Build
```bash
npm run build
```

**Expected Output:**
```
vite v5.4.8 building for production...
✓ 1638 modules transformed
✓ dist/index.html                   0.72 kB │ gzip:   0.40 kB
✓ dist/assets/index-*.css          35.37 kB │ gzip:   6.68 kB
✓ dist/assets/index-*.js          363.79 kB │ gzip: 114.40 kB
✓ built in 6.25s
```

✅ **Success Criteria:**
- No errors
- All modules transformed
- dist/ folder created with HTML, CSS, JS files

---

## Phase 3: Start Development Server

### 3.1 Launch Dev Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.4.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ **Verification:** Open http://localhost:5173 in browser

---

## Phase 4: UI Component Tests

### Test 4.1: Page Load & Header
**What to verify:**
1. Page loads without errors
2. Header shows "Edrevel AI" branding with blue logo
3. Title shows "Untitled Learning Path"
4. Top toolbar visible with buttons

**Steps:**
- Open http://localhost:5173
- Look at the top bar
- See: Logo + Title | Builder/Preview toggle | Save Draft | Publish buttons

✅ **Pass:** All header elements visible, no console errors

❌ **Fail:** Blank page, console errors, missing buttons

---

### Test 4.2: Left Panel Loading
**What to verify:**
1. Left panel shows "Add Components" header
2. Search box visible
3. Filter buttons (All, Units, Assessments) visible
4. Content items load from API

**Steps:**
1. Open Browser DevTools → Console tab
2. Watch the page load
3. Left panel should populate with content items
4. Should see cards with titles like:
   - "Math Module 1 Assessment" (amber badge)
   - "Math Module 2 - Easy" (blue badge)
   - "Reading & Comp Module 1 Assessment"
   - etc.

**Content Details Check:**
- Hover over a card → See duration (e.g., "35 min")
- Click expand arrow → Description appears
- Color coding: Assessment = amber, Unit = blue

✅ **Pass:** 7 items visible, all properly formatted

❌ **Fail:** No items loaded, HTTP error in console, missing badges

---

### Test 4.3: Canvas Display
**What to verify:**
1. Central canvas area shows dot grid background
2. Two system nodes visible (Start, End)
3. Zoom controls in bottom-left
4. MiniMap in bottom-right

**Steps:**
1. Look at the center area
2. Should see:
   - "Start Assessment" node (green) at top
   - "Complete Assessment" node (gray) at bottom
   - Gray dot grid background
   - Controls in corners

✅ **Pass:** Grid visible, both nodes present, controls visible

❌ **Fail:** Blank canvas, no nodes, no controls

---

### Test 4.4: Properties Panel
**What to verify:**
1. Right panel shows "Properties" header
2. Shows "Nothing selected" message
3. Panel ready to accept selection

**Steps:**
1. Look at right panel
2. Should show icon + "Nothing selected" + hint text

✅ **Pass:** Right panel visible with message

❌ **Fail:** Panel missing or error displayed

---

## Phase 5: API Integration Tests

### Test 5.1: Verify Components API
**In Browser Console:**
```javascript
// Test GET /api/components
const res = await fetch(
  'https://hyzhutbpcakarmdimjqd.supabase.co/functions/v1/api-components',
  {
    headers: {
      'Authorization': 'Bearer ' + window.__supabaseKey, // or paste the anon key
    }
  }
);
const data = await res.json();
console.log(data);
```

**Expected Response:**
```json
{
  "items": [
    {
      "id": "cmp-assess-math-1",
      "title": "Math Module 1 Assessment",
      "shortDescription": "Baseline math diagnostic...",
      "type": "assessment",
      "approximateDurationMinutes": 35,
      "metadata": {
        "assessment": {
          "maxScore": 100,
          "passingScore": 50
        }
      }
    },
    // 6 more items...
  ],
  "totalCount": 7
}
```

✅ **Pass:** Returns 7 items, all have required fields, status 200

❌ **Fail:** Network error, wrong format, missing fields, status != 200

---

### Test 5.2: Verify Save API
**Steps:**
1. In the app, drag a component to canvas
2. Click "Save Draft"
3. Watch Console tab for network activity
4. Should see "Saved" message in header

**In Console:**
```javascript
// After clicking Save Draft, check the POST request
// Look at Network tab → Filter "api-learning-paths"
// Should see: POST /api-learning-paths with status 201
```

**Expected Response:**
```json
{
  "id": "lp-cmp-unit-math-2-easy-1717663...",
  "name": "Untitled Learning Path",
  "status": "draft",
  "version": 1,
  "nodes": [...],
  "edges": [...]
}
```

✅ **Pass:** POST successful, returns path with ID, status 201

❌ **Fail:** Network error, status != 201, missing ID

---

## Phase 6: Core Feature Tests

### Test 6.1: Drag & Drop
**What to verify:**
1. Can drag items from left panel
2. Items drop onto canvas
3. New nodes created at drop location

**Steps:**
1. In left panel, find "Math Module 1 Assessment"
2. Click and hold on the card
3. Drag to center of canvas
4. Release mouse

✅ **Pass:**
- Cursor changes to grab icon
- During drag, shows move cursor
- Node appears on canvas with:
  - Title: "Math Module 1 Assessment"
  - Badge: "Assessment"
  - Duration: "35 min"

❌ **Fail:**
- Drag doesn't work
- Node doesn't appear
- Wrong position

---

### Test 6.2: Node Repositioning
**What to verify:**
1. Nodes can be dragged after placement
2. Snap-to-grid alignment works

**Steps:**
1. Drag the "Math Module 1 Assessment" node you just created
2. Move it around the canvas
3. Release it

✅ **Pass:**
- Node follows your mouse
- Snaps to 16px grid when released
- Position saved in memory

❌ **Fail:**
- Can't drag
- Doesn't snap
- Jumps to wrong position

---

### Test 6.3: Drawing Connections
**What to verify:**
1. Can draw edge from one node to another
2. Arrow line appears

**Steps:**
1. Have 2 nodes on canvas (Start and a content node)
2. Find the green handle at bottom of Start node
3. Drag from that handle to the green handle at top of content node
4. Release

✅ **Pass:**
- Drag shows connection line (blue while dragging)
- Edge appears with gray arrow
- Arrow points from Start to content node

❌ **Fail:**
- Can't draw edge
- No arrow appears
- Arrow points wrong direction

---

### Test 6.4: Node Selection & Properties
**What to verify:**
1. Clicking node selects it
2. Properties panel updates
3. Can edit properties

**Steps:**
1. Click on a node on the canvas
2. Node should highlight with blue ring
3. Right panel should show properties:
   - Label (editable)
   - Description (editable)
   - Duration (editable)
   - If assessment: Max Score, Passing Score

**Edit Test:**
1. Change Label from "Math Module 1 Assessment" to "Math Quiz"
2. Type appears on node immediately

✅ **Pass:**
- Node highlights when selected
- Properties show correct fields
- Edits appear instantly on node

❌ **Fail:**
- Node doesn't select
- Properties don't show
- Edits don't update

---

### Test 6.5: Edge Selection & Rules
**What to verify:**
1. Clicking edge selects it
2. Properties panel shows rule editor
3. Can add conditions

**Steps:**
1. Click on the gray arrow line (edge) between nodes
2. Edge should highlight (turn blue)
3. Right panel should show:
   - Source → Target (e.g., "Start Assessment → Math Module 1")
   - Label field
   - Priority field
   - Conditions section with AND/OR toggle
   - "Add Condition Rule" button

**Add Rule Test:**
1. Click "Add Condition Rule"
2. New rule card appears
3. Select source node, metric, operator, value

✅ **Pass:**
- Edge highlights when selected
- Rule editor shows all fields
- Can add/delete rules

❌ **Fail:**
- Edge doesn't select
- Properties don't show
- Rule buttons don't work

---

### Test 6.6: Save Draft
**What to verify:**
1. Clicking "Save Draft" persists to Supabase
2. Path gets unique ID
3. Status shows "Saved" feedback

**Steps:**
1. Create a simple path (Start → Assessment → Unit → End)
2. Click "Save Draft" button
3. Watch for "Saving..." spinner → "Saved" message

**Verification:**
- Header shows path ID (lp-xxxx...)
- "Saved" message appears briefly
- No errors in console

✅ **Pass:**
- "Saved" message appears in header
- Path ID generated and visible
- No console errors

❌ **Fail:**
- Error message instead of saved
- No ID generated
- Console shows network error

---

### Test 6.7: Publish Workflow
**What to verify:**
1. Clicking "Publish" marks path as published
2. Can toggle between Draft and Publish

**Steps:**
1. Click "Publish" button
2. Should save as published status
3. Version increments

✅ **Pass:**
- No error message
- Version increments
- Successfully saved

❌ **Fail:**
- Error displayed
- Network error in console

---

## Phase 7: Browser DevTools Verification

### Test 7.1: Console
**What to verify:**
1. No red error messages
2. No warnings about missing dependencies

**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Perform some actions (drag, click, save)

✅ **Pass:** No red errors, maybe some info messages

❌ **Fail:** Red error messages, network failures

---

### Test 7.2: Network Tab
**What to verify:**
1. API calls succeed
2. Response status codes are correct (200, 201)
3. No failed requests

**Steps:**
1. DevTools → Network tab
2. Perform drag-drop and save
3. Should see:
   - GET api-components (status 200)
   - POST api-learning-paths (status 201)
   - GET api-learning-paths/{id} (if you load)

✅ **Pass:** All requests show status 200/201, no red errors

❌ **Fail:** 4xx/5xx errors, failed requests, CORS errors

---

### Test 7.3: Performance
**What to verify:**
1. App responds quickly to interactions
2. Drag-drop is smooth
3. Save completes in reasonable time

**Steps:**
1. Drag nodes around quickly
2. Click multiple nodes in succession
3. Save and check response time

✅ **Pass:**
- No lag when dragging
- Clicks are responsive (<100ms)
- Save completes in <2 seconds

❌ **Fail:**
- Noticeable lag
- Delayed responses
- Slow save operation

---

## Phase 8: Database Verification

### Test 8.1: Check Seeded Components
**In Browser Console:**
```javascript
const res = await fetch(
  'https://hyzhutbpcakarmdimjqd.supabase.co/functions/v1/api-components',
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);
const data = await res.json();
console.log(`Found ${data.totalCount} components:`, data.items.map(c => c.title));
```

**Expected Output:**
```
Found 7 components:
- Math Module 1 Assessment
- Math Module 2 - Easy
- Math Module 2 - Advanced
- Reading & Comp Module 1 Assessment
- R&C Module 2 - Easy
- R&C Module 2 - Advanced
- Complete Assessment
```

✅ **Pass:** All 7 items returned with correct data

❌ **Fail:** Wrong count, missing items, incorrect data

---

### Test 8.2: Verify Saved Path
**In Browser Console:**
```javascript
// After saving, check the path ID from the header
const pathId = "lp-xxxxx"; // Copy from header

const res = await fetch(
  `https://hyzhutbpcakarmdimjqd.supabase.co/functions/v1/api-learning-paths/${pathId}`,
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);
const data = await res.json();
console.log('Saved path:', data);
```

**Expected Output:**
```json
{
  "id": "lp-xxxxx",
  "name": "Untitled Learning Path",
  "status": "draft",
  "version": 1,
  "nodes": [...],
  "edges": [...]
}
```

✅ **Pass:** Path retrieved with all data intact

❌ **Fail:** 404 error, corrupted data, missing fields

---

## Phase 9: Full Workflow Test

### Complete End-to-End Test
This test verifies the entire user workflow:

**Steps:**
1. ✅ App loads with default Start/End nodes
2. ✅ Search for "Math" in left panel
3. ✅ Filter to "Assessments" only
4. ✅ Drag "Math Module 1 Assessment" to canvas
5. ✅ Drag "Math Module 2 - Easy" below it
6. ✅ Drag "Math Module 2 - Advanced" to the right
7. ✅ Draw edge from Start to Assessment
8. ✅ Draw edge from Assessment to Easy Unit
9. ✅ Draw edge from Assessment to Advanced Unit
10. ✅ Click Assessment node → edit label to "Diagnostic Quiz"
11. ✅ Click edge (Assessment → Easy) → add condition: "score < 50"
12. ✅ Click edge (Assessment → Advanced) → add condition: "score >= 80"
13. ✅ Click "Save Draft"
14. ✅ See path ID appear in header
15. ✅ See "Saved" message
16. ✅ Reload page (path structure lost, but data is in Supabase)
17. ✅ No console errors throughout

✅ **Pass:** All 17 steps complete without errors

❌ **Fail:** Any step fails or shows error

---

## Quick Checklist for Success

Print this checklist and verify each item:

```
SETUP PHASE:
☐ npm install completes
☐ .env file exists with Supabase credentials
☐ npm run typecheck shows 0 errors
☐ npm run lint shows 0 errors
☐ npm run build succeeds

RUNTIME PHASE:
☐ npm run dev starts without errors
☐ App loads at http://localhost:5173
☐ Header visible with logo and title
☐ Left panel shows 7 content items
☐ Canvas shows Start/End nodes
☐ Properties panel shows "Nothing selected"

INTERACTION PHASE:
☐ Can drag items from left panel
☐ Dragged items create nodes on canvas
☐ Nodes snap to grid
☐ Can draw edges between nodes
☐ Clicking node selects and shows properties
☐ Can edit node label (updates instantly)
☐ Clicking edge selects and shows rules
☐ Can add condition rules to edges

API & PERSISTENCE:
☐ Components load from GET /api/components
☐ Save Draft sends POST to /api/learning-paths
☐ Path ID appears in header after save
☐ "Saved" message appears
☐ No console errors after any action

FINAL CHECKS:
☐ Browser Console has no red errors
☐ Network tab shows 200/201 status codes
☐ Save completes in <2 seconds
☐ All 7 components visible and draggable
☐ Drag-drop is smooth and responsive
```

---

## Troubleshooting

### Issue: "Failed to load components"
**Cause:** API not responding or bad credentials
**Fix:**
1. Check .env file has correct SUPABASE_URL and SUPABASE_ANON_KEY
2. Verify network connection
3. Check browser console for CORS errors
4. Verify api-components edge function is deployed

### Issue: Drag-drop not working
**Cause:** React Flow not initialized or CSS not loaded
**Fix:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check console for React Flow errors
3. Verify CSS loaded (check Network tab)

### Issue: Save fails with 400 error
**Cause:** Validation error or malformed data
**Fix:**
1. Check console for error message
2. Verify path has at least Start and End nodes
3. Verify edges have valid source/target nodes

### Issue: Properties panel blank
**Cause:** Node/edge not properly selected
**Fix:**
1. Click directly on node/edge, not background
2. Look for blue highlight around selected element
3. Check console for JavaScript errors

### Issue: No data saved
**Cause:** Supabase not connected or RLS policy blocking
**Fix:**
1. Verify Supabase credentials in .env
2. Check Supabase project status
3. Verify learning_paths table exists
4. Check RLS policies allow INSERT

---

## Success Criteria

✅ **Application is working successfully if:**

1. **All code checks pass:**
   - TypeScript: 0 errors
   - ESLint: 0 errors
   - Build: successful, no warnings

2. **App starts and displays:**
   - Header with branding
   - Left panel with 7 items
   - Canvas with Start/End nodes
   - Properties panel

3. **Core features work:**
   - Drag-drop from left to canvas
   - Node repositioning
   - Edge drawing
   - Node property editing
   - Edge condition editing

4. **APIs respond:**
   - GET /api/components returns 7 items
   - POST /api/learning-paths saves successfully
   - GET /api/learning-paths/{id} retrieves saved path

5. **No errors:**
   - Browser console has no red errors
   - Network requests all succeed
   - All save operations complete

**If all above are true → Application is 100% working ✅**
