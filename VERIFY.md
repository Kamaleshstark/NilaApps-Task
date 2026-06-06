# How to Verify Application is Running Successfully

Simple step-by-step verification guide.

---

## ✅ STEP 1: Verify Dependencies

```bash
npm install
```

Look for:
- ✅ All packages installed
- ✅ No "deprecated" warnings
- ✅ Ends with "packages in X"

---

## ✅ STEP 2: Verify Code Quality

```bash
npm run typecheck
```

Expected: No output (silence = success)

```bash
npm run lint
```

Expected: No output (silence = success)

---

## ✅ STEP 3: Build the Project

```bash
npm run build
```

Expected output:
```
✓ 1638 modules transformed.
✓ built in 6.25s
```

Look for: ✅ No errors, ✅ dist/ folder created

---

## ✅ STEP 4: Start Development Server

```bash
npm run dev
```

Expected:
```
  VITE v5.4.8  ready in 123 ms
  ➜  Local:   http://localhost:5173/
```

Copy the URL and **open it in your browser**.

---

## ✅ STEP 5: Browser Verification

### Check 1: Page Loads
- ✅ No blank page
- ✅ No errors in DevTools Console (F12)
- ✅ "Edrevel AI" visible in top-left

### Check 2: Header Elements
Should see:
- ✅ Blue logo
- ✅ Title "Untitled Learning Path"
- ✅ Builder/Preview toggle buttons
- ✅ Save Draft button
- ✅ Publish button

### Check 3: Left Panel
Should show:
- ✅ "Add Components" header
- ✅ Search box
- ✅ Filter buttons (All, Units, Assessments)
- ✅ List of 7 content items with:
  - Title
  - Type badge (blue for units, amber for assessments)
  - Duration ("35 min", etc.)

### Check 4: Canvas
Should show:
- ✅ Dot grid background
- ✅ "Start Assessment" node at top (green)
- ✅ "Complete Assessment" node at bottom (gray)
- ✅ Zoom controls in bottom-left corner
- ✅ MiniMap in bottom-right corner

### Check 5: Right Panel
Should show:
- ✅ "Properties" header
- ✅ "Nothing selected" message

---

## ✅ STEP 6: Test Drag & Drop

1. In left panel, hover over "Math Module 1 Assessment"
2. Click and hold the card
3. Drag to the middle of the canvas
4. Release the mouse

**Expected:**
- ✅ Cursor changes to grab hand icon
- ✅ Animated connection line while dragging
- ✅ New node appears on canvas with assessment details
- ✅ No console errors

---

## ✅ STEP 7: Test Node Selection

1. Click on the node you just created
2. Look at right panel

**Expected:**
- ✅ Node has blue ring around it (selected)
- ✅ Right panel shows properties:
  - Label field
  - Description field
  - Duration field
  - Assessment config (Max Score, Passing Score)

---

## ✅ STEP 8: Test Connection

1. Find the green handle at the **bottom** of the Start node
2. Drag from that handle to the green handle at the **top** of your new node
3. Release

**Expected:**
- ✅ Blue line appears while dragging
- ✅ Gray arrow line appears when released
- ✅ Arrow points from Start → Your node
- ✅ No console errors

---

## ✅ STEP 9: Test Save

1. Click "Save Draft" button
2. Wait for response

**Expected:**
- ✅ Button shows "Saving..." briefly
- ✅ "Saved" message appears next to button
- ✅ Path ID appears in header (e.g., "lp-cmp-assess-math-1-1717...")
- ✅ No error message

---

## ✅ STEP 10: Verify Browser Console

Press **F12** to open DevTools, go to **Console** tab.

Look for:
- ✅ No red error messages
- ✅ No "Failed to fetch" warnings
- ✅ May see blue info messages (normal)

---

## ✅ Final Verification Checklist

| Check | Pass | Status |
|-------|------|--------|
| npm install succeeds | ✅ | |
| npm run typecheck (0 errors) | ✅ | |
| npm run lint (0 errors) | ✅ | |
| npm run build succeeds | ✅ | |
| Dev server starts at localhost:5173 | ✅ | |
| Page loads without errors | ✅ | |
| Header visible | ✅ | |
| Left panel shows 7 items | ✅ | |
| Canvas shows Start/End nodes | ✅ | |
| Can drag item to canvas | ✅ | |
| Can select node | ✅ | |
| Can draw edge between nodes | ✅ | |
| Can save draft | ✅ | |
| Console has no red errors | ✅ | |

---

## ✅ Application is Successfully Running!

If all checks above are marked ✅, then:

**The application is 100% working correctly!**

---

## 🔴 Something Not Working?

### Problem: Page shows blank

**Solution:**
1. Hard refresh: Ctrl+Shift+R
2. Check browser console (F12)
3. Look for error messages
4. Verify .env file exists with Supabase credentials

### Problem: Left panel shows no content

**Solution:**
1. Check network tab (F12 → Network)
2. Look for failed requests
3. Verify Supabase URL in .env is correct
4. Check API endpoint status

### Problem: Drag-drop not working

**Solution:**
1. Hard refresh browser
2. Check console for React Flow errors
3. Verify CSS loaded (should see styled nodes)

### Problem: Save fails with error

**Solution:**
1. Check error message in console
2. Verify .env credentials
3. Check Supabase project is active
4. Reload page and try again

### For More Help:
See **TESTING_GUIDE.md** for detailed troubleshooting

---

## Terminal Output Examples

### ✅ Successful npm install
```
added 1024 packages in 45s
```

### ✅ Successful typecheck
```
> tsc --noEmit -p tsconfig.app.json
(no output = success)
```

### ✅ Successful lint
```
> eslint .
(no output = success)
```

### ✅ Successful build
```
✓ 1638 modules transformed.
rendering chunks...
✓ built in 6.25s
```

### ✅ Successful dev start
```
  VITE v5.4.8  ready in 123 ms
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

**All done! Your application is ready to use.** 🎉
