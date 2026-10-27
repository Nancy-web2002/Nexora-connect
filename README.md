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

## NVIDIA Nemotron Integration

Nexora Connect's chat workflow executes the NVIDIA Nemotron model `nvidia/nemotron-3.5-bolt-e4b` through the **Ask Nemotron** node.

**Execution evidence:** n8n execution 169 shows the Ask Nemotron node output for `nvidia/nemotron-3.5-bolt-e4b`. This confirms that the model executes in the chat workflow. It does not, by itself, establish that every chat response or opportunity-discovery operation uses Nemotron.

## H-MEM Preference Memory

Nexora Connect includes a vendored H-MEM reference implementation and a service for saving and retrieving opportunity preferences.

The current integration:

1. Saves explicit user preferences.
2. Retrieves relevant saved preferences.
3. Passes retrieved preferences to the chat workflow as context when available.

The vendored H-MEM test suite currently passes **10 tests**. This confirms those reference implementation tests pass; it does not by itself establish official Meterless conformance.

### Known Limitations

End-to-end testing has shown that the AI assistant may still ask for information already saved and may make incorrect assumptions about a user's study level. Recent testing has also exposed an intent-routing issue: requests for specific opportunity categories, such as virtual-assistant internships, may return results based on older scholarship preferences.

These findings indicate that preference retrieval, conversation context, and opportunity-search intent handling require further verification.

### Verification Status

- **Nemotron execution:** Confirmed in n8n execution 169 for the Ask Nemotron node.
- **H-MEM reference tests:** 10 tests passing.
- **Preference-aware chat behavior:** Implemented, but end-to-end behavior has known limitations.
- **Official Meterless conformance:** Not established by the available test results.


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

   ## Real-World Test Examples

These examples document the Nexora Connect user journey using the deployed application. Results are recorded from actual app interactions; screenshots are included as supporting evidence.

### Example 1: Opportunity Credibility and Verification

*User actions:*
1. Searched for an opportunity.
2. Initiated verification in Nexora Connect.
3. Opened the company's website to inspect the source.

*Purpose:*  
Demonstrate opportunity discovery, the displayed verification result, and source inspection.

*Evidence:*
- Screenshot 1: Opportunity search.
<img width="1089" height="597" alt="Screenshot 2026-10-27 074529" src="https://github.com/user-attachments/assets/22425d04-5a65-45cc-92c7-8a74b295a9fe" />
- Screenshot 2: Verification result.
<img width="1009" height="521" alt="Screenshot 2026-10-27 074624" src="https://github.com/user-attachments/assets/4e65f84a-f5a8-4ef0-9978-a1ee0c342dd3" />
- Screenshot 3: Company website opened.
<img width="1098" height="679" alt="Screenshot 2026-10-27 074646" src="https://github.com/user-attachments/assets/2ba67c16-46a0-410c-aebf-852cf088cd25" />

*Limitation:*  
Opening a company website alone does not establish that an opportunity is legitimate. Verification conclusions depend on the available evidence.

### Example 2: Application Action Plan

*Test input:*  
“Create an action plan for applying to this opportunity.”

*Purpose:*  
Test whether Nexora Connect can turn an opportunity into practical next steps.

*Evidence:*  
<img width="1069" height="602" alt="Screenshot 2026-10-27 080140" src="https://github.com/user-attachments/assets/23d437a8-717e-4346-aced-5c4b4890cde8" />

### Example 3: Opportunity Recommendations from Saved Preferences

**User preference:** The user is looking for remote virtual assistant internships suitable for beginners in Nigeria.

**User request to the AI Advisor:** “Find opportunities that match my saved preferences.”

**Expected behavior:**
1. Retrieve the user's relevant saved preferences.
2. Use those preferences to guide opportunity discovery.
3. Prioritize relevant remote virtual assistant internships for beginners in Nigeria.
4. Return results with source links, eligibility information, and verification evidence where available.
5. Explain when a result cannot be confirmed as a match.

**Known limitation:** Saved preferences may not always be applied correctly. Search results can include unrelated opportunities, so relevance must be verified during testing.
