# Nexora Connect

**AI-powered opportunity discovery and evidence-based verification.**

Nexora Connect helps users discover relevant opportunities, review credibility evidence, and generate actionable next steps.

## Core Features

- **Opportunity discovery:** Search for relevant opportunities through the discovery API.
- **Evidence-based verification:** Review available sources and six evidence checks to assess an opportunity.
- **Action plans:** Generate practical next steps for pursuing an opportunity.
- **AI assistant:** Chat with an AI assistant powered through the configured n8n workflow.
- **Preference memory (H-MEM):** Save and retrieve user opportunity preferences using the vendored H-MEM reference implementation.
- **Authentication:** Sign up and sign in using Supabase authentication.

## Technology Stack

- React 19
- Vite 8
- TypeScript
- Express
- React Router
- Supabase
- n8n AI workflow
- NVIDIA Nemotron through the configured workflow
- H-MEM reference implementation

## Application Routes

| Route | Purpose |
|---|---|
| `/` | Get started |
| `/signup` | Create an account |
| `/signin` | Sign in |
| `/verification` | Email verification |
| `/signin/resetpassword` | Password reset |
| `/dashboard` | Main dashboard |
| `/welcome` | Welcome screen |
| `/discover` | Discover opportunities |
| `/opportunity/details` | Opportunity details |
| `/opportunity` | My opportunities |
| `/ai-assistant` | AI assistant |
| `/settings` | Account settings |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| POST | `/api/chat` | Send a message to the AI assistant |
| POST | `/api/discover` | Discover opportunities |
| POST | `/api/generate-plan` | Generate an opportunity action plan |
| POST | `/api/memory/preferences` | Save an authenticated user's preference |
| GET | `/api/memory/preferences` | Retrieve an authenticated user's preferences |

## H-MEM Preference Memory

Nexora Connect includes a vendored H-MEM reference implementation and a service for saving and retrieving opportunity preferences.

The current integration:
1. Saves explicit user preferences.
2. Retrieves relevant saved preferences.
3. Passes retrieved preferences to the chat workflow as context when available.

The vendored H-MEM test suite currently passes **10 tests**. This confirms those reference implementation tests pass; it does not by itself establish official Meterless conformance.

**Known limitation:** End-to-end testing has shown that the AI assistant may still ask for information already saved and may make incorrect assumptions about a user's study level. The workflow's use of saved preference context requires further verification.

## Local Development

### Requirements

- Node.js and npm
- Supabase project credentials
- Configured n8n webhook and required secrets for AI workflow functionality

### Setup

1. Clone the repository and enter the project directory.
2. Install dependencies:

   ```bash
   npm install
