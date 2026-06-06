# Quick Test — 5 Minute Verification

Fast way to verify the application is working correctly.

---

## Step 1: Code Quality (30 seconds)

```bash
npm run typecheck && npm run lint && npm run build
```

**Expected:** All commands complete with no errors
```
✓ 1638 modules transformed
✓ built in 6.25s
```

**Result:** ✅ Pass | ❌ Fail

---

## Step 2: Start Dev Server (1 minute)

```bash
npm run dev
```

**Expected:** Opens at `http://localhost:5173`
- Page loads without errors
- No blank screen

**Result:** ✅ Pass | ❌ Fail

---

## Step 3: Verify UI Components (2 minutes)

In the browser, check these elements exist:

1. **Header** — Top bar with "Edrevel AI" logo and title
2. **Left Panel** — Shows content items with "Add Components" header
3. **Canvas** — Dot grid with Start and End nodes
4. **Right Panel** — Shows "Nothing selected" message
5. **Toolbar** — Save Draft and Publish buttons visible

**Result:** ✅ Pass (all visible) | ❌ Fail (missing elements)

---

## Step 4: Test Drag & Drop (1 minute)

1. In left panel, find "Math Module 1 Assessment"
2. Drag it to the center of the canvas
3. Release the mouse

**Expected:**
- Node appears on canvas with assessment badge
- Node shows "35 min" duration
- No console errors

**Result:** ✅ Pass | ❌ Fail

---

## Step 5: Test Save (1 minute)

1. Click "Save Draft" button
2. Wait for response

**Expected:**
- "Saving..." spinner appears briefly
- "Saved" confirmation message
- Path ID appears in header (e.g., lp-xxxx...)
- No error messages

**Result:** ✅ Pass | ❌ Fail

---

## Summary

Run this command to see overall status:

```bash
echo "=== Code Quality ===" && \
npm run typecheck 2>&1 | tail -1 && \
npm run lint 2>&1 | tail -1 && \
npm run build 2>&1 | grep "built in"
```

---

## If All 5 Steps Pass ✅

**The application is working successfully!**

- Frontend loads correctly
- Components render properly
- API integration works
- Database persistence works
- No critical errors

---

## If Any Step Fails ❌

**Common issues:**

| Issue | Solution |
|-------|----------|
| TypeScript errors | Run `npm run typecheck` and fix reported errors |
| ESLint errors | Run `npm run lint` and fix reported issues |
| Build fails | Check Node.js version (need 18+), reinstall dependencies |
| App doesn't load | Check browser console for errors, verify ports not blocked |
| Drag-drop doesn't work | Hard refresh browser (Ctrl+Shift+R), check console |
| Save fails | Verify .env has correct Supabase credentials |

---

## Detailed Testing

For comprehensive testing, see **TESTING_GUIDE.md**
