# Architecture Fix - Eliminating Logic Divergence

## Problem: Split Reality

**Current State:**
- Mobile app: `lib/cycleUtils.ts` (correct, fixed implementation)
- Web app: `web/src/lib/cycleUtils.ts` (old, broken implementation)

**Impact:** Same card shows different due dates and urgency levels on mobile vs web.

---

## Immediate Fix (Completed)

### Web Now Uses Shared Module

Updated `web/src/lib/cycleUtils.ts` to become a **re-export** of the mobile implementation:

```typescript
// web/src/lib/cycleUtils.ts
export * from '../../../lib/cycleUtils';
export * from '../../../lib/dateValidation';
export * from '../../../lib/colorThresholds';
```

**Result:** Single source of truth for all financial calculations.

---

## Long-term Solutions (Choose One)

### Option 1: Monorepo with Shared Workspace Package ⭐ (Recommended)

**Structure:**
```
credit-card-status/
├── packages/
│   ├── finance-core/          # Shared logic
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── cycleUtils.ts
│   │   │   ├── dateValidation.ts
│   │   │   └── colorThresholds.ts
│   │   └── tsconfig.json
│   ├── mobile/                 # React Native app
│   └── web/                    # Next.js app
├── package.json               # Root package.json with workspaces
└── pnpm-workspace.yaml        # or npm workspaces
```

**Root package.json:**
```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**Usage in apps:**
```typescript
import { getCurrentCycle } from '@credit-card-status/finance-core';
```

**Benefits:**
- TypeScript gets full type checking across packages
- Single `npm install` for all packages
- Can version the core package independently
- Easy to add more apps (CLI, desktop, etc.)

---

### Option 2: Symlinked Shared Folder

**Structure:**
```
credit-card-status/
├── shared/
│   └── finance-core/
│       ├── cycleUtils.ts
│       ├── dateValidation.ts
│       └── colorThresholds.ts
├── mobile/
│   └── lib/ -> ../shared/finance-core (symlink)
└── web/
    └── src/lib/finance/ -> ../../shared/finance-core (symlink)
```

**Setup:**
```bash
ln -s ../../../shared/finance-core mobile/lib/finance-core
ln -s ../../../shared/finance-core web/src/lib/finance-core
```

**Benefits:**
- Simpler than monorepo
- No build tools needed
- Git tracks one copy

**Drawbacks:**
- Symlinks can be fragile
- Different TypeScript configs may conflict

---

### Option 3: Private NPM Package (Later)

When ready to scale:

```bash
# In finance-core/
npm publish --access private
```

```json
// In mobile/package.json and web/package.json
{
  "dependencies": {
    "@yourorg/finance-core": "^1.0.0"
  }
}
```

**Benefits:**
- Versioned releases
- Can share with other teams
- Standard npm workflow

**Drawbacks:**
- Requires npm organization or private registry
- More complex development workflow

---

## Current Interim Solution

**UPDATE:** Due to Next.js/Turbopack limitations with imports outside the web directory, we now **copy** the shared files:

### Files Copied to `web/src/lib/`:
- `colorThresholds.ts` (from root `lib/`)
- `dateValidation.ts` (from root `lib/`)
- `cycleUtils.ts` (contains full implementation, synced from root `lib/`)

### Sync Process
When updating financial logic:
1. Make changes in root `lib/` directory (mobile)
2. Run: `cp lib/colorThresholds.ts lib/dateValidation.ts web/src/lib/`
3. Update `web/src/lib/cycleUtils.ts` with changes from root `lib/cycleUtils.ts`
4. Run tests: `npm test` (ensures mobile logic is correct)
5. Test web app: `cd web && npm run dev`

**⚠️ This is temporary** - The files are duplicated but content must stay identical.

**Why This Approach:**
- Next.js/Turbopack doesn't handle imports outside the web directory well
- Re-exporting caused module resolution errors
- Copying is simple and works immediately

**Limitation:**
- Must manually sync changes between mobile and web
- Risk of divergence if sync is forgotten

**Solution:** Cross-boundary tests in `lib/__tests__/cross-boundary.test.ts` verify both platforms produce identical outputs.

**Next Step:** Migrate to monorepo structure (Option 1) before launch to eliminate manual syncing.

---

## Migration Checklist

- [x] Identify logic divergence
- [x] Fix mobile implementation (completed previously)
- [x] Update web to use mobile implementation
- [ ] Set up monorepo structure
- [ ] Move `lib/` to `packages/finance-core/`
- [ ] Update imports in both apps
- [ ] Add cross-boundary tests
- [ ] Document the architecture

---

## Rule Going Forward

> **There must be exactly ONE implementation of cycle + due math.**
> 
> Any deviation from this rule is a critical bug.

**Enforcement:**
1. Code review: Flag any new `cycleUtils` files
2. Tests: Cross-boundary tests compare outputs
3. CI: Fail build if web/mobile logic diverges

---

## Testing Strategy

See `lib/__tests__/cross-boundary.test.ts` for tests that ensure mobile and web produce identical outputs for identical inputs.
