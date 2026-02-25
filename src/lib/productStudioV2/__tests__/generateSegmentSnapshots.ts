import fs from 'fs';
import path from 'path';

import { winePipeline, __buildSegmentsForTest as __buildWineSegmentsForTest } from '../pipelines/winePipeline';
import { coffeePipeline, __buildSegmentsForTest as __buildCoffeeSegmentsForTest } from '../pipelines/coffeePipeline';
import { genericPipeline, __buildSegmentsForTest as __buildGenericSegmentsForTest } from '../pipelines/genericPipeline';
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

write('wine.v4.segments.json', __buildWineSegmentsForTest(wine.state));
write('coffee.segments.json', __buildCoffeeSegmentsForTest(coffee.state));
write('generic.segments.json', __buildGenericSegmentsForTest(generic.state));

console.log('Segment snapshots generated.');
