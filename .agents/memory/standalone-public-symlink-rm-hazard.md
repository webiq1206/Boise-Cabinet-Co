---
name: Never rm -rf .next/standalone/public — it symlinks into the repo
description: How a manual standalone reassembly deleted all 5,333 files in public/.
---

**Rule:** `build.sh` links the standalone bundle's public dir at the real one:

    ln -s ../../public .next/standalone/public

`.next/standalone/../../public` resolves to the repo-root `public/`. So
`rm -rf .next/standalone/public` can delete THROUGH the link and empty the real
directory. Use `rm -f` (no `-r`) on that path, or `unlink`, and never point a
recursive delete at anything under `.next/standalone` that build.sh symlinks.

**Why:** 2026-08-21, while reproducing a deploy start failure by assembling the
standalone artifact by hand and iterating, `rm -rf .next/standalone/public`
followed the link and removed all 5,333 files (355 MB) from `public/` - brand
kit, catalog PDF, every marketing/catalog image, favicons, web manifest. It was
committed and pushed in edc1543b before anyone noticed, and restored in ef632bab
via `git checkout <last-good-sha> -- public/`.

**How to apply:** To rebuild the standalone artifact locally, prefer running
`bash build.sh` (it handles this correctly) over hand-rolled cp/ln/rm loops. If
you must do it by hand, delete the link with `rm -f .next/standalone/public` and
verify with `ls -la` that you are looking at a symlink, not a directory, before
any recursive delete. After any such session run `git status` and check for
unexpected deletions under `public/` BEFORE committing - `git add -A` will
happily stage 5,000 deletions.

**Related:** standalone-public-not-served.md explains why the symlink exists at
all (a second 290 MB copy gets dropped during deploy image assembly).
