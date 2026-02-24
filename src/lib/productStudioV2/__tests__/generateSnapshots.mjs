import { generateStudioPromptV2 } from '../index.js';
import { getTestStates } from './testStates.js';
import fs from 'fs';
import path from 'path';

const [wine, coffee, generic] = getTestStates();
const outDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'snapshots');

fs.writeFileSync(path.join(outDir, 'wine.v4.snapshot.txt'), generateStudioPromptV2(wine.state));
fs.writeFileSync(path.join(outDir, 'coffee.snapshot.txt'), generateStudioPromptV2(coffee.state));
fs.writeFileSync(path.join(outDir, 'generic.snapshot.txt'), generateStudioPromptV2(generic.state));

console.log('Snapshots generated.');
