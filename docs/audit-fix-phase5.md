Phase 5 Final Hardening

Fix ONLY the following:

1. Home Tonight meal lookup:
   Use the same `${dayName}-Dinner` key used by the daily thread so the Vibrant Home dinner tile displays the actual planned dinner.

2. Deen deep-link:
   Make `/deen?tab=salah` correctly select the Salah tab using the existing shared navigation/query model.
   Preserve existing `/deen` default behavior.

3. Destructive controls:
   Remove hover-only discoverability for delete/clear actions.
   Ensure actions are visible/usable on touch and keyboard while remaining visually restrained.

4. Tone correctness:
   Correct invalid/misleading tone assignments on Notes, Deeds, Calendar, and Reminders.
   Use only the defined semantic tones or `space-accent` where appropriate.

5. Remove unused `btn-tone` CSS if it has no real consumer.

6. Improve the Kids empty-state icon to a family/child-appropriate existing icon.

7. Do NOT refactor all Calm/Vibrant JSX trees.
   Record that duplication as future technical debt.

8. Do NOT add features.
9. Do NOT alter domain architecture.
10. Do NOT modify the Theme model.

Verification:
- npx tsc --noEmit
- npm test
- npm run build

Then perform actual cold-load browser verification of:
- Calm + cookie
- Vibrant + cookie
- Calm + localStorage only
- Vibrant + localStorage only

Report whether the SSR/client/data-experience states match and whether any visual flash occurs.

Do NOT commit yet.