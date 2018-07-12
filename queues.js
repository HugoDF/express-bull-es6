
import Queue from 'bull';

export const NOTIFY_URL = 'NOTIFY_URL';

export const queues = {
  [NOTIFY_URL]: new Queue(
    NOTIFY_URL,
    process.env.REDIS_URL
  )
};
