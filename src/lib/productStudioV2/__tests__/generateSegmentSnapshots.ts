import fs from 'fs';
import path from 'path';

import { winePipeline } from '../winePipeline';
import { coffeePipeline } from '../coffeePipeline';
import { genericPipeline } from '../genericPipeline';
import { getTestStates } from './testStates';

const snapshotsDir = path.join(__dirname, 'snapshots');
const [wine, coffee, generic] = getTestStates();

function write(name: string, data: unknown) {
  fs.writeFileSync(
    path.join(snapshotsDir, name),
    JSON.stringify(data, null, 2),
    'utf8'
  );
}

write('wine.v4.segments.json', winePipeline.__buildSegmentsForTest(wine.state));
write('coffee.segments.json', coffeePipeline.__buildSegmentsForTest(coffee.state));
write('generic.segments.json', genericPipeline.__buildSegmentsForTest(generic.state));

console.log('Segment snapshots generated.');
