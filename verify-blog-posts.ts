/**
 * @deprecated Use: npx tsx scripts/verify-content.ts
 */
import { execSync } from 'child_process';
execSync('npx tsx scripts/verify-content.ts', { stdio: 'inherit' });
