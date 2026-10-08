---
name: Temporary-storage quota diagnostics
description: Filesystem free space does not exclude quota exhaustion in isolated build checks.
---

Treat disk quota separately from filesystem free space when diagnosing isolated build failures. A successful archive checksum followed by extraction exit 2 with empty stderr is not sufficient evidence of a packaging-source defect.

**Why:** In this environment, temporary archive extraction encountered `Disk quota exceeded` while `df` still reported ample free space. Partial output exhausted the same storage used for stderr files, obscuring the actual error. Memory-backed stderr capture exposed the quota failure; xz integrity testing and decompression succeeded.

**How to apply:** Capture small diagnostic logs on a separate available filesystem when quota exhaustion may suppress errors. Distinguish current resource readings from historical evidence. Remove only explicitly authorized, agent-owned temporary outputs; do not delete previous artifacts or user files without permission. Never install or execute a partial extracted runtime. Kernel logs may be permission-denied; accessible cgroup OOM counters are not timestamped attribution.
