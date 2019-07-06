import url from 'url';
import express from 'express';
import Arena from 'bull-arena';

import { db } from './db';
import { queues, NOTIFY_URL } from './queues';

const app = express();

app.use(express.json());

app.post('/webhooks', async (req, res, next) => {
  const { payload, urls } = req.body;
  try {
    const id = await db.setWebhook(payload, urls);
    return res.json({
      id
    });
  } catch (error) {
    next(error);
  }
});

app.post('/webhooks/notify', async (req, res, next) => {
  const { id } = req.body;
  try {
    const { payload, urls } = await db.getWebhook(id);
    urls.forEach(url => {
      queues[NOTIFY_URL].add({
        payload,
        url,
        id
      });
    });
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

app.get('/webhooks/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const { payload, urls } = await db.getWebhook(id);
    return res.json({
      payload,
      urls
    });
  } catch (error) {
    next(error);
  }
});

app.post('/example', (req, res) => {
  console.log(`Hit example with ${JSON.stringify(req.body)}`);
  return res.sendStatus(200);
});

function getRedisConfig(redisUrl) {
  const redisConfig = url.parse(redisUrl);
  return {
    host: redisConfig.hostname || 'localhost',
    port: Number(redisConfig.port || 6379),
    database: (redisConfig.pathname || '/0').substr(1) || '0',
    password: redisConfig.auth ? redisConfig.auth.split(':')[1] : undefined
  };
}

app.use('/', Arena(
  {
    queues: [
      {
        name: NOTIFY_URL,
        hostId: 'Worker',
        redis: getRedisConfig(process.env.REDIS_URL)
      }
    ]
  },
  {
    basePath: '/arena',
    disableListen: true
  }
));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});
