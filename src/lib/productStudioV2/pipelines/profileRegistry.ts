import { winePipeline } from './winePipeline';
import { coffeePipeline } from './coffeePipeline';
import { genericPipeline } from './genericPipeline';

export const profileRegistry = {
  wine: winePipeline,
  coffee: coffeePipeline,
  generic: genericPipeline,
};
