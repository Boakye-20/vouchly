# Context7 MCP Setup for Vouchly

This guide explains how to set up Context7 MCP (Model Context Protocol) for the Vouchly project to get up-to-date documentation and code examples directly in your AI coding assistant.

## What is Context7?

Context7 MCP provides real-time access to current library documentation and code examples, eliminating outdated information and hallucinated APIs that don't exist.

## Setup Instructions

### 1. MCP Configuration

The project includes a `.cursor/mcp.json` file that configures Context7 for Cursor:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### 2. Alternative Configurations

#### For Remote Server (No Local Installation)
```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

#### For Other Editors

**VS Code:**
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Windsurf:**
```json
{
  "mcpServers": {
    "context7": {
      "serverUrl": "https://mcp.context7.com/sse"
    }
  }
}
```

### 3. Usage

Once configured, you can use Context7 in your prompts by adding `use context7`:

**Examples:**
- "Create a Next.js middleware that checks for a valid JWT in cookies and redirects unauthenticated users to `/login`. use context7"
- "Configure a Cloudflare Worker script to cache JSON API responses for five minutes. use context7"

### 4. Auto-Invocation (Optional)

To automatically invoke Context7 on code-related questions, add this rule to your Cursor settings:

```json
[[calls]]
match = "when the user requests code examples, setup or configuration steps, or library/API documentation"
tool = "context7"
```

### 5. Library-Specific Usage

For specific libraries, you can use the library ID directly:

```
implement basic authentication with supabase. use library /supabase/supabase for api and docs
```

## Available Tools

Context7 MCP provides these tools:

- **resolve-library-id**: Resolves general library names to Context7-compatible IDs
- **get-library-docs**: Fetches documentation for specific libraries

## Troubleshooting

### Common Issues

1. **Module Not Found Errors**: Ensure Node.js >= v18.0.0
2. **ESM Resolution Issues**: Check your TypeScript/Node configuration
3. **TLS/Certificate Issues**: May occur with corporate firewalls
4. **General MCP Client Errors**: Restart your editor after configuration changes

### Verification

To test if Context7 is working:
1. Restart your editor after adding the MCP configuration
2. Try a prompt with `use context7`
3. Check that you receive up-to-date documentation instead of generic responses

## Benefits for Vouchly

Context7 will help with:
- Getting current Next.js 14+ documentation
- Firebase/Firestore best practices
- Tailwind CSS latest features
- TypeScript configuration
- Authentication patterns
- And much more...

## Resources

- [Context7 Website](https://context7.com)
- [GitHub Repository](https://github.com/upstash/context7)
- [Discord Community](https://discord.gg/context7)

## License

Context7 is MIT licensed. See the [original repository](https://github.com/upstash/context7) for full license details. 