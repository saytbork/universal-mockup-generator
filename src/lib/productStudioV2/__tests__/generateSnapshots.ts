import fs from 'fs';
import path from 'path';
import { generateStudioPromptV2 } from '../index';
import { getTestStates } from './testStates';

const snapshotsDir = path.join(
  path.dirname(typeof __dirname !== 'undefined' ? __dirname : new URL(import.meta.url).pathname),
  'snapshots'
);
const [wine, coffee, generic] = getTestStates();

function write(name: string, content: string) {
	fs.writeFileSync(
		path.join(snapshotsDir, name),
		content.trimStart(),
		'utf8'
	);
}

write('wine.v4.snapshot.txt', generateStudioPromptV2(wine.state));
write('coffee.snapshot.txt', generateStudioPromptV2(coffee.state));
write('generic.snapshot.txt', generateStudioPromptV2(generic.state));

console.log('Snapshots regenerated cleanly.');
