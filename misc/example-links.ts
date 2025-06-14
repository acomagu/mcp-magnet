import type { MCPManifest } from "./mcpConfigManager";

export const exampleManifests: MCPManifest[] = [
  {
    "name": "slack",
    "displayName": "Slack",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-slack"],
    "env": {
      "SLACK_BOT_TOKEN": {
        "type": "text",
        "description": "Slack Bot User OAuth Token (starts with xoxb-)",
        "required": true
      },
      "SLACK_TEAM_ID": {
        "type": "text",
        "description": "Slack workspace ID (starts with T)",
        "required": true
      },
      "SLACK_CHANNEL_IDS": {
        "type": "text",
        "description": "Comma-separated list of channel IDs to limit access",
        "required": false
      }
    },
    "description": "Interact with Slack workspaces via the Slack API.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-slack"
  },
  {
    "name": "google-drive",
    "displayName": "Google Drive",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-gdrive"],
    "env": {
      "GDRIVE_CREDENTIALS_PATH": {
        "type": "text",
        "description": "Path to saved OAuth credentials JSON",
        "required": true
      },
      "GDRIVE_OAUTH_PATH": {
        "type": "text",
        "description": "Path to Google OAuth keys JSON",
        "required": true
      }
    },
    "description": "Search and access Google Drive files in read-only mode.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-gdrive"
  },
  {
    "name": "google-maps",
    "displayName": "Google Maps",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-google-maps"],
    "env": {
      "GOOGLE_MAPS_API_KEY": {
        "type": "text",
        "description": "Google Maps API key",
        "required": true
      }
    },
    "description": "Geocoding, place search, directions via Google Maps API.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-google-maps"
  },
  {
    "name": "github",
    "displayName": "GitHub",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": {
        "type": "text",
        "description": "GitHub Personal Access Token with repo scope",
        "required": true
      }
    },
    "description": "Manage repositories, issues, and files via GitHub API.",
    "manifestVersion": "1.0",
    "manifestAuthor": "GitHub",
    "url": "https://github.com/github/github-mcp-server"
  },
  {
    "name": "gitlab",
    "displayName": "GitLab",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-gitlab"],
    "env": {
      "GITLAB_PERSONAL_ACCESS_TOKEN": {
        "type": "text",
        "description": "GitLab Personal Access Token",
        "required": true
      },
      "GITLAB_API_URL": {
        "type": "text",
        "description": "GitLab API URL (default https://gitlab.com/api/v4)",
        "required": false
      }
    },
    "description": "Project and repo operations through the GitLab API.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-gitlab"
  },
  {
    "name": "postgres",
    "displayName": "PostgreSQL",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
    "description": "Read-only SQL access to a PostgreSQL database.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres"
  },
  // SQLite package doesn't exist yet in npm registry
  // {
  //   "name": "sqlite",
  //   "displayName": "SQLite",
  //   "command": "npx",
  //   "args": ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/database.sqlite"],
  //   "description": "Run SQL queries against local SQLite files.",
  //   "manifestVersion": "1.0",
  //   "manifestAuthor": "Anthropic",
  //   "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-sqlite"
  // },
  {
    "name": "redis",
    "displayName": "Redis",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-redis", "redis://localhost:6379"],
    "env": {
      "REDIS_URL": {
        "type": "text",
        "description": "Redis connection URL (e.g. redis://localhost:6379)",
        "required": false
      }
    },
    "description": "Key-value operations on a Redis database.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-redis"
  },
  {
    "name": "puppeteer",
    "displayName": "Puppeteer",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
    "env": {
      "PUPPETEER_LAUNCH_OPTIONS": {
        "type": "text",
        "description": "JSON string of Puppeteer launch options",
        "required": false
      },
      "ALLOW_DANGEROUS": {
        "type": "boolean",
        "description": "Permit potentially unsafe launch flags",
        "required": false
      }
    },
    "description": "Headless-Chrome automation and web scraping.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://www.npmjs.com/package/@modelcontextprotocol/server-puppeteer"
  },
  {
    "name": "git",
    "displayName": "Git",
    "command": "uvx",
    "args": ["mcp-server-git", "--repository", "/path/to/git/repo"],
    "description": "Search and modify local Git repositories.",
    "manifestVersion": "1.0",
    "manifestAuthor": "Anthropic",
    "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/git"
  }
];

function createManifestUrl(manifestData: MCPManifest): string {
  const jsonString = JSON.stringify(manifestData);
  const encodedJson = encodeToBase64(jsonString);
  return `mcp-magnet://install?manifest=${encodedJson}`;
}

function encodeToBase64(str: string): string {
  // First encode the string as UTF-8
  const utf8Encoder = new TextEncoder();
  const utf8Bytes = utf8Encoder.encode(str);

  // Convert bytes to base64
  return btoa(
    Array.from(utf8Bytes)
      .map(byte => String.fromCharCode(byte))
      .join('')
  );
}

for (const manifest of exampleManifests) {
  console.log(`[${manifest.displayName ?? manifest.name}](${createManifestUrl(manifest)})`);
}
