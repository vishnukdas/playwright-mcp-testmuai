# LambdaTest MCP setup guide

This guide captures the exact steps and changes used to run the custom Playwright
MCP server on LambdaTest via a CDP endpoint.

## Step-by-step: run MCP on LambdaTest

1. Create or update your MCP config file (`mcp.json`).
2. Configure env vars so `server.js` can build and encode the CDP endpoint.
3. Start the MCP server.
4. Use MCP tools (for example, navigate to a URL).
5. End the session by closing the Playwright context.

## Step-by-step changes from the Playwright MCP server

Use this when starting from the stock Playwright MCP server and you want to
run on LambdaTest using the env-based approach.

1. Copy the custom server file
   - Place `server.js` in a stable local path you control
     (for example: `/path/to/playwright-mcp-custom/server.js`).
2. Point MCP to the custom server
   - In your `mcp.json`, set:
     - `"command": "node"`
     - `"args": ["/path/to/playwright-mcp-custom/server.js"]`
3. Add LambdaTest env vars
   - In the same `mcp.json` entry, add:
     - `LT_USERNAME`, `LT_ACCESS_KEY`
     - `LT_BROWSER_NAME`, `LT_BROWSER_VERSION`
     - `LT_PLATFORM`, `LT_BUILD`, `LT_TEST_NAME`
4. Reload MCP servers
   - Restart your agent or reload MCP servers so it picks up the new config.

## MCP config (env-based, no manual encoding)

`server.js` will build the endpoint and URL-encode the capabilities if you set
the LambdaTest env vars. This avoids double-encoding mistakes.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["/path/to/playwright-mcp-custom/server.js"],
      "env": {
        "LT_USERNAME": "YOUR_LT_USERNAME",
        "LT_ACCESS_KEY": "YOUR_LT_ACCESS_KEY",
        "LT_BROWSER_NAME": "Chrome",
        "LT_BROWSER_VERSION": "latest",
        "LT_PLATFORM": "Windows 10",
        "LT_BUILD": "Playwright HyperExecute Build",
        "LT_TEST_NAME": "Playwright HyperExecute Test"
      }
    }
  }
}
```

## What changed vs the default Playwright MCP server

The default server connects to a local Playwright browser. The custom
`server.js` adds LambdaTest support by:

- Building the CDP endpoint from env vars (`LT_USERNAME`, `LT_ACCESS_KEY`,
  `LT_BROWSER_NAME`, `LT_BROWSER_VERSION`, `LT_PLATFORM`, `LT_BUILD`,
  `LT_TEST_NAME`) and URL-encoding the capabilities payload.
- Connecting via `chromium.connect({ wsEndpoint: cdpEndpoint })`.
- Closing the browser when the context closes, ensuring the LambdaTest
  session ends.

## Optional LambdaTest flags

You can toggle these with env vars:

- `LT_VIDEO=true|false`
- `LT_CONSOLE=true|false`
- `LT_NETWORK=true|false`

