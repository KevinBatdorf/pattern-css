#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, globSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const args = process.argv.slice(2).join(' ');
const MAX_ATTEMPTS = 2;

// Find all spec files that have a blueprint.json in the same directory
const projects = globSync('**/*.spec.ts', { ignore: ['node_modules/**'] })
	.filter((spec) => existsSync(join(dirname(spec), 'blueprint.json')))
	.map((spec) => basename(spec, '.spec.ts'));

console.log(
	`Found ${projects.length} test suites:\n${projects.map((p) => `  - ${p}`).join('\n')}\n`,
);

let failed = false;
for (const project of projects) {
	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		if (attempt > 1)
			console.log(
				`\n↻ Retrying: ${project} (attempt ${attempt}/${MAX_ATTEMPTS})`,
			);
		else console.log(`\n▶ Running: ${project}`);
		try {
			execSync(
				`RUN_PROJECT="${project}" npx playwright test --project="${project}" ${args}`,
				{ stdio: 'inherit' },
			);
			break;
		} catch {
			if (attempt === MAX_ATTEMPTS) failed = true;
		}
	}
}

process.exit(failed ? 1 : 0);
