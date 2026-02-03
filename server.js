#!/usr/bin/env node
'use strict';

const { createConnection } = require('@playwright/mcp');
const { chromium } = require('playwright');
const mcpBundle = require('playwright/lib/mcp/sdk/bundle');

const envBool = (value) => {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const buildEndpointFromEnv = () => {
  const user = process.env.LT_USERNAME;
  const accessKey = process.env.LT_ACCESS_KEY;
  if (!user || !accessKey) return undefined;

  const capabilities = {
    browserName: process.env.LT_BROWSER_NAME || 'Chrome',
    browserVersion: process.env.LT_BROWSER_VERSION || 'latest',
    'LT:Options': {
      platform: process.env.HYPEREXECUTE_PLATFORM || process.env.LT_PLATFORM,
      build: process.env.LT_BUILD || 'Playwright MCP Build',
      name: process.env.LT_TEST_NAME || 'Playwright MCP Session',
      user,
      accessKey
    }
  };

  const video = envBool(process.env.LT_VIDEO);
  const consoleLog = envBool(process.env.LT_CONSOLE);
  const network = envBool(process.env.LT_NETWORK);
  if (video !== undefined) capabilities['LT:Options'].video = video;
  if (consoleLog !== undefined) capabilities['LT:Options'].console = consoleLog;
  if (network !== undefined) capabilities['LT:Options'].network = network;

  const baseUrl = process.env.LT_CDP_URL || 'wss://cdp.lambdatest.com/playwright';
  return `${baseUrl}?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;
};

const cdpEndpoint =
  process.env.LT_CDP_ENDPOINT ||
  process.env.PLAYWRIGHT_MCP_CDP_ENDPOINT ||
  buildEndpointFromEnv();

if (!cdpEndpoint) {
  console.error('Missing CDP endpoint. Provide LT_CDP_ENDPOINT (or LT_USERNAME/LT_ACCESS_KEY to build capabilities).');
  process.exit(1);
}

(async () => {
  const server = await createConnection({}, async () => {
    const browser = await chromium.connect({ wsEndpoint: cdpEndpoint });
    const context = await browser.newContext();

    const originalClose = context.close.bind(context);
    context.close = async (...args) => {
      await originalClose(...args);
      await browser.close().catch(() => {});
    };

    return context;
  });

  await server.connect(new mcpBundle.StdioServerTransport());
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
