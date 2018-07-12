import { NOTIFY_URL } from './queues';
import axios from 'axios';

export const processorInitialisers = {
  [NOTIFY_URL]: db => job => {
    console.log(`Posting to ${job.data.url}`);
    return axios.post(job.data.url, job.data.payload);
  }
}
