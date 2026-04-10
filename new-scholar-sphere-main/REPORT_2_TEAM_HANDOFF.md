# Report 2: Team Handoff and Integration Checklist

Date: March 23, 2026
Project: Scholar Sphere API

## 1. Integration Artifacts to Share

Share these files with teammates:
- API_CONTRACT.md
- .env.example
- README.md

These describe active endpoints, auth usage, environment setup, and run flow.

## 2. Active Endpoint Groups

- Root: health/info
- Auth: signup, login, me
- Users: list, get
- Research: statuses, keywords, authors, researchers, papers, agendas
- Research Outputs: full CRUD + filters
- Integrations: default seeding and email test (API key protected)

## 3. Environment Checklist

Each teammate should configure:
- DATABASE_URL
- JWT_SECRET
- JWT_ALGORITHM
- JWT_EXPIRE_MINUTES
- API_KEY
- CORS_ALLOW_ORIGINS

## 4. Client Integration Rules

### JWT Protected Routes
- Send Authorization header as Bearer token.

### Integration Routes
- Send X-API-Key header.

### Pagination
- Use skip and limit on list endpoints.
- Keep limit at 100 or less.

### Validation Expectations
- Signup rejects unknown fields.
- Research outputs enforce allowed output type values.
- DOI must be unique when provided.

## 5. Suggested Team Testing Flow

1. Start backend and verify docs endpoint.
2. Create account via signup.
3. Login and store access token.
4. Call protected endpoint with Bearer token.
5. Test research outputs create/list/get/update/delete.
6. Test integrations endpoint using X-API-Key.

## 6. Merge and Coordination Notes

- Backend contract is now stable enough for frontend integration.
- Any changes to route paths or payload fields should be versioned and announced to the team.
- Keep API contract and README updated when endpoint behavior changes.

## 7. Recommended Next Team Actions

- Frontend team maps forms and filters to API_CONTRACT.md.
- QA team creates endpoint smoke checklist from this report.
- Backend team adds CI tests for auth and research outputs.
