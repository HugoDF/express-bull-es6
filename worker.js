import { queues } from './queues';
import { processorInitialisers } from './processors';
import { db } from './db';

Object.entries(queues).forEach(([queueName, queue]) => {
  console.log(`Worker listening to '${queueName}' queue`);
  queue.process(processorInitialisers[queueName](db));
});
