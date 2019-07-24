'use strict';

const express = require('express');
const sync = require('./sync.js');

const app = express();

let issueCache;

app.get('/issues', async (req, res) => {
  // if the request came in before filling the cache, just kinda hang out
  // here and wait until something is there.
  while (!issueCache) {
    console.log('Waiting for initial cache to be loaded.');
    await new Promise(r => setTimeout(r, 5000));
  }
  res.json(issueCache);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});

// refresh the cache every 5 minutes
sync();
setInterval(async () => {
  issueCache = await sync();
}, 1000 * 60 * 5);
