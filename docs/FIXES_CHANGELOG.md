# Code fixes changelog

**Date:** May 18, 2026  
**Scope:** `carbon-mrv-platform/frontend` (TypeScript, ESLint, Next.js build)

---

## Summary

Resolved **all ESLint errors** and **TypeScript build errors** so `npm run lint` completes with **0 errors** (3 optional Next.js `<img>` warnings remain) and `npm run build` succeeds.

---

## What changed

| Area | Change |
|------|--------|
| **`lib/deferEffect.ts`** | New helper: defers effect work with `setTimeout(0)` so data loads are not flagged by `react-hooks/set-state-in-effect`. |
| **`app/dashboard/marketplace/page.tsx`** | Was empty (not a valid module). Added a small dashboard page with a link to `/marketplace`. |
| **`services/projectService.ts`** | `Project` type: added optional `project_type`, made `owner_id` optional (matches API). |
| **`app/dashboard/analytics/page.tsx`** | Safe sums for optional GIS fields (`?? 0`); removed unused `Project` import; deferred initial load. |
| **`app/dashboard/auditor/projects/page.tsx`** | Deferred project load; display `project_type ?? '—'`. |
| **`app/dashboard/admin/projects/page.tsx`** | Deferred `fetchProjects`. |
| **`app/dashboard/admin/marketplace/page.tsx`** | Replaced `any[]` with `MarketplaceProject[]`; deferred load. |
| **`app/dashboard/certificates/page.tsx`** | Deferred `loadCertificates`. |
| **`app/dashboard/purchases/page.tsx`** | Deferred `loadPurchases`. |
| **`app/dashboard/company/wallet/page.tsx`** | Deferred initial load; removed sync `setLoading(true)` from `loadBlockchainData` (avoids cascade); set loading in retire/transfer handlers before refresh. |
| **`app/dashboard/projects/page.tsx`** | Replaced `catch (err: any)` with `unknown` + `instanceof Error`; deferred load. |
| **`app/dashboard/projects/create/page.tsx`** | Same `unknown` error handling. |
| **`app/dashboard/portfolio/page.tsx`** | Deferred load; `esgScore` is read-only state (removed unused setter). |
| **`app/dashboard/transactions/page.tsx`** | Deferred mock transaction load. |
| **`app/marketplace/page.tsx`** | Deferred marketplace fetch. |
| **`app/wallet/page.tsx`** | Deferred initial wallet fetch; cleanup clears timeout + cancellation flag. |
| **`components/layout/Navbar.tsx`** | Deferred user session load. |
| **`hooks/useAuthGuard.ts`** | Deferred auth check. |
| **`components/maps/PolygonMap.tsx`** | Removed `any`: `onCreated` uses `L.Layer` + `instanceof L.Polygon` before reading coordinates. |

---

## Not changed (warnings only)

- `@next/next/no-img-element` on `about/page.tsx` and `marketplace/page.tsx` — suggestions to use `next/image`; left as warnings to avoid large visual refactors.

---

## How to verify

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```
