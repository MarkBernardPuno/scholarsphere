# Scholar Sphere API Contract

Integration contract for teammates consuming this backend.

## Service Basics

- Base URL: http://localhost:8000
- Swagger: /docs
- ReDoc: /redoc

## Access Rules

- All endpoints are public for frontend integration.
- No Bearer token is required on CRUD endpoints.
- No API key is required on integrations endpoints.

## Global Request Rules

- Content-Type: application/json for JSON bodies
- Pagination (where supported):
  - skip >= 0
  - 1 <= limit <= 100

## Endpoint Groups

### Root

- GET /
  - Auth: None
  - Success: 200

### Auth

- POST /auth/signup
  - Auth: None
  - Body: first_name, middle_initial?, last_name, email, password, campus_id, college_id, department_id?
  - Rules: unknown fields rejected, minimum password length 8, campus/college/department relationships validated
  - Success: 201
- POST /auth/login
  - Auth: None
  - Body: email, password
  - Success: 200 (access_token, token_type)
- GET /auth/me
  - Auth: None
  - Query: user_id (int)
  - Success: 200

### Users

- GET /users/
  - Auth: None
  - Query: skip, limit
  - Success: 200
- GET /users/{user_id}
  - Auth: None
  - Success: 200

### Research

- POST /research/types
- GET /research/types
- POST /research/output-types
- GET /research/output-types
- POST /research/authors
- GET /research/authors
- POST /research/papers
- GET /research/papers
- GET /research/papers/{paper_id}
- PUT /research/papers/{paper_id}
- DELETE /research/papers/{paper_id}

Rules:
- All /research/* endpoints are public.
- List endpoints support global pagination rules.

### Research Outputs

- POST /research-outputs/
- GET /research-outputs/
- GET /research-outputs/{publication_id}
- PUT /research-outputs/{publication_id}
- DELETE /research-outputs/{publication_id}

Rules:
- Auth: None.
- List filter query params: paper_id, doi, search, skip, limit
- Backed by publications table (`publications`).
- doi is unique when provided.

### Presentations

- POST /presentations/
- GET /presentations/
- GET /presentations/{presentation_id}
- PUT /presentations/{presentation_id}
- DELETE /presentations/{presentation_id}

Rules:
- Auth: None.
- Backed by presentations table (`presentations`).
- paper_id must reference existing research paper.

### Research Evaluations

- POST /research-evaluations/
- GET /research-evaluations/
- GET /research-evaluations/{evaluation_id}
- PUT /research-evaluations/{evaluation_id}
- DELETE /research-evaluations/{evaluation_id}

Rules:
- Auth: None.
- paper_id must reference an existing `research_papers` record.
- List filter query params: paper_id, status_value, search, skip, limit

Create/Update payload fields:
- paper_id
- status
- document_links
- authorship_from_link
- journal_conference_info

### Lookups

- POST /lookups/campuses
- GET /lookups/campuses
- GET /lookups/campuses/{campus_id}
- PUT /lookups/campuses/{campus_id}
- DELETE /lookups/campuses/{campus_id}
- POST /lookups/colleges
- GET /lookups/colleges
- GET /lookups/colleges/{college_id}
- PUT /lookups/colleges/{college_id}
- DELETE /lookups/colleges/{college_id}
- POST /lookups/departments
- GET /lookups/departments
- GET /lookups/departments/{department_id}
- PUT /lookups/departments/{department_id}
- DELETE /lookups/departments/{department_id}
- POST /lookups/school-years
- GET /lookups/school-years
- GET /lookups/school-years/{school_year_id}
- PUT /lookups/school-years/{school_year_id}
- DELETE /lookups/school-years/{school_year_id}
- POST /lookups/semesters
- GET /lookups/semesters
- GET /lookups/semesters/{semester_id}
- PUT /lookups/semesters/{semester_id}
- DELETE /lookups/semesters/{semester_id}

Rules:
- Auth: None.
- Parent FK references are enforced: colleges.campus_id and departments.college_id.

### Integrations

- POST /integrations/populate-defaults
  - Auth: None
- POST /integrations/email/test
  - Auth: None
  - Query: recipient

## Environment Contract

- DATABASE_URL
- JWT_SECRET
- JWT_ALGORITHM (default: HS256)
- JWT_EXPIRE_MINUTES (default: 60)
- API_KEY
- CORS_ALLOW_ORIGINS (comma-separated list or *)
- DB_AUTO_CREATE (true/false)

## Team Handoff Steps

1. Share this file and .env.example with teammates.
2. Use integer IDs in all request path params and relationship fields.
3. Validate integration with a smoke test: signup, login, auth/me?user_id=<id>, research-outputs CRUD, research-evaluations CRUD.
