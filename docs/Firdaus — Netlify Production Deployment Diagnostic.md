# Firdaus — Netlify Production Deployment Diagnostic

The Firdaus application builds successfully locally, but the deployed Netlify site shows:

> "This page didn't load. Something went wrong on our end. You can try refreshing or head back home."

Your task is to diagnose the actual production deployment failure.

## IMPORTANT

Do NOT modify files initially.

Do NOT commit or push.

Do NOT guess based only on the generic Netlify error page.

Inspect the actual repository, build configuration, Netlify configuration, and deployment/runtime evidence.

The objective is to determine the root cause before proposing a fix.

---

# 1. Repository Environment

Inspect:

```bash
pwd
git status --short
git branch --show-current
git log -5 --oneline

node --version
npm --version
```

Inspect:

```bash
cat package.json
cat vite.config.ts
cat netlify.toml 2>/dev/null || true
cat app.config.ts 2>/dev/null || true
```

Also inspect any other files affecting deployment:

- `.nvmrc`
- `netlify.toml`
- `wrangler.toml`
- `nitro.config.*`
- `vite.config.*`
- deployment scripts
- environment configuration

---

# 2. Framework / Adapter Detection

Determine exactly how this repository currently builds.

Inspect dependencies for:

```text
@tanstack/react-start
@tanstack/react-router
@netlify/vite-plugin-tanstack-start
nitropack
@nirtro/*
@cloudflare/*
netlify
vite
```

Run:

```bash
npm list @tanstack/react-start @netlify/vite-plugin-tanstack-start nitropack netlify
```

If some packages are not installed, report that clearly.

---

# 3. Build Output Analysis

Run:

```bash
npm run build
```

Capture the complete output.

Determine:

- client output
- SSR output
- server/function output
- Nitro preset
- deployment target
- output directory
- generated server entry points

Pay particular attention to whether the build is producing something such as:

```text
cloudflare-module
```

or another runtime that may not correspond to Netlify.

Do not assume the build target is correct merely because the build succeeds.

---

# 4. Netlify Configuration

Inspect all Netlify-related configuration.

Determine:

- build command
- publish directory
- functions directory
- framework detection
- plugins
- environment variables
- redirects
- rewrites
- edge/function configuration

Check whether the project uses the current TanStack Start Netlify integration.

If the repository uses an outdated or incompatible deployment configuration, identify it precisely.

Do NOT install or modify anything yet.

---

# 5. Production Runtime Failure

If deployment/runtime logs are available locally or through configured tooling, inspect them.

Look for:

```text
ERR_MODULE_NOT_FOUND
Cannot find module
Function failed
ReferenceError
TypeError
document is not defined
window is not defined
process is not defined
crypto errors
fetch errors
environment variable errors
SSR errors
module format errors
```

Identify the FIRST meaningful runtime exception, not just the final generic Netlify error.

---

# 6. Search for Cloudflare / Nitro Assumptions

Search the repository:

```bash
grep -R "cloudflare" -n . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist

grep -R "nitro" -n . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist
```

Determine whether the current application was accidentally built for:

```text
Cloudflare
```

while being deployed to:

```text
Netlify
```

If so, explain exactly where that mismatch occurs.

---

# 7. Compare Local Runtime vs Netlify Runtime

Determine:

```text
Local build
↓
Local SSR/runtime
↓
Netlify build
↓
Netlify function/runtime
```

Identify where behavior diverges.

If possible, test the production output locally using the deployment's actual runtime/adapter.

Do not say "works locally" unless you actually run the production server/runtime.

---

# 8. TanStack Start / Netlify Compatibility

Inspect whether the current repository is configured according to the current TanStack Start Netlify deployment model.

Specifically determine:

- whether the Netlify Vite plugin is installed
- whether it is included in `vite.config.ts`
- whether the generated output matches Netlify expectations
- whether the publish directory is correct
- whether server functions are generated correctly

Do not automatically change to the latest recommended configuration.

First compare the current setup with the installed package versions and actual repository architecture.

---

# 9. Environment Variables

Inspect the application for server/client environment variables required at runtime.

Determine whether Netlify needs variables that exist locally but are missing in production.

Look for:

- Supabase URL
- Supabase anon key
- auth configuration
- application URLs
- server secrets
- any runtime-only configuration

Do NOT print secret values.

Report only:

```text
PRESENT
MISSING
POTENTIALLY REQUIRED
```

---

# 10. SSR-Specific Investigation

Because Firdaus recently introduced Experience hydration and TanStack Start SSR logic, inspect:

- `src/routes/__root.tsx`
- initial preferences loader
- cookies
- server loaders
- `ThemeProvider`
- inline bootstrap script
- server/client boundaries

Determine whether production SSR could fail due to:

- browser-only APIs on the server
- localStorage access
- document access
- cookie API mismatch
- loader serialization
- hydration assumptions
- runtime-specific APIs

Do not assume the recent Experience work caused the deployment issue.

Prove or disprove it.

---

# 11. Netlify Error Correlation

The visible error is:

> This page didn't load. Something went wrong on our end.

Determine whether this corresponds to:

- function crash
- SSR exception
- missing deployment artifact
- wrong publish directory
- wrong runtime adapter
- missing environment variable
- routing problem
- build/deploy mismatch

Rank the likely causes.

---

# 12. Root Cause Classification

Classify findings:

### P0
Deployment completely unusable.

### P1
Production runtime failure.

### P2
Configuration problem that will break future deploys.

### P3
Non-blocking cleanup.

Identify the single most likely root cause.

---

# 13. Do Not Modify Anything Yet

This is a diagnosis task.

Do NOT:

- modify `vite.config.ts`
- modify `netlify.toml`
- install packages
- change deployment adapter
- change code
- commit
- push

unless explicitly asked after the diagnosis.

---

# 14. Final Report

Return:

## Executive Verdict

## Current Framework / Runtime

## Current Build Target

## Netlify Configuration

## Runtime Error Evidence

## Environment Variable Findings

## SSR Findings

## Cloudflare / Nitro Findings

## Root Cause

## Secondary Issues

## Recommended Fix

Give the minimum correct fix.

If multiple fixes are possible, rank them:

1. Recommended
2. Alternative
3. Avoid

## Exact Files Likely to Change

## Verification Plan After Fix

Do not implement the fix yet.

The goal is to produce a precise deployment diagnosis.