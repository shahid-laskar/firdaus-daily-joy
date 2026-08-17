Firdaus Netlify 404 Diagnostic

The new Netlify deployment is live, but opening the site shows:

# Page not found
Looks like you’ve followed a broken link or entered a URL that doesn’t exist on this site.

The local production build succeeds.

Do NOT modify anything yet.

Inspect the actual repository and determine why Netlify is serving a static 404 instead of the TanStack Start application.

1. Inspect:
   - package.json
   - vite.config.ts
   - netlify.toml
   - app.config.ts
   - any Netlify/Vite/Nitro configuration
   - current build scripts
   - generated dist/ output

2. Run:
   npm run build

3. Determine EXACTLY:
   - TanStack Start version
   - whether @netlify/vite-plugin-tanstack-start is installed
   - whether the Netlify plugin is registered in vite.config.ts
   - build command
   - publish directory
   - generated SSR/server/function output
   - whether the current build is still targeting Cloudflare/Nitro

4. Inspect Netlify output expectations.

For current TanStack Start on Netlify, verify whether the project should use:

vite.config.ts:
  tanstackStart()
  netlify()

and:

netlify.toml:
  [build]
    command = "vite build"
    publish = "dist/client"

Do NOT apply this blindly. Compare it against the installed TanStack Start version and actual repository.

5. Determine whether the application is:
   A. TanStack Start SSR
   B. SPA mode
   C. incorrectly mixed between SSR/Nitro/SPA/Netlify configuration

6. Check whether the deployed root URL "/" should invoke a Netlify SSR function or serve a static index.

7. Check whether a netlify.toml or redirect rule is incorrectly sending requests somewhere else.

8. Check whether the current publish directory is wrong, especially if Netlify is publishing:
   - dist
   - dist/client
   - .output/public
   - another directory

9. Do NOT add:
   /*
   /index.html
   200

unless you confirm the application is intentionally SPA mode. TanStack Start SSR should not be converted to an SPA merely to hide this 404.

10. Report:

## Root Cause
## Current TanStack Start Version
## Current Build Target
## Current Netlify Configuration
## Actual Build Output
## Expected Netlify Configuration
## Exact Files That Need Changing
## Minimal Fix
## Verification Commands

Do NOT modify or commit anything.