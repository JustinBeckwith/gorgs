'use strict'

const parseLinkHeader = require('parse-link-header');
const {Gaxios} = require('gaxios');

const token = process.env.GH_TOKEN;
const org = process.env.GH_ORG;

if (!token) {
  throw new Error('Please set the `GH_TOKEN` environment variable.');
}

if (!org) {
  throw new Error('Please set the `GH_ORG` environment variable.');
}

let gaxios;
function getClient(token) {
  if (!gaxios) {
    gaxios = new Gaxios({
      headers: {
        Authorization: `token ${token}`
      }
    });
  }
  return gaxios;
}

async function sync(url, allIssues = []) {
  const gaxios = getClient(token);
  url = url || `https://api.github.com/orgs/${org}/issues`;
  console.log(url);
  const res = await gaxios.request({
    url,
    retry: true,
    params: {
      filter: 'all',
      per_page: 100,
    },
  });
  allIssues.push(...res.data);
  console.log(`Found ${res.data.length} items, ${allIssues.length} total`);
  const linkHeader = res.headers['link'];
  if (linkHeader) {
    const linkHeaderParts = parseLinkHeader(linkHeader);
    if (linkHeaderParts.next && linkHeaderParts.next.url) {
      await sync(linkHeaderParts.next.url, allIssues);
    }
  }
  return allIssues;
}

module.exports = sync;
