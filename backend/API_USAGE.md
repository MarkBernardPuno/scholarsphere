# Scholar Sphere API Usage Guide

## Running the API (for deployment and frontend use)

### 1. Using Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed.
2. In the project root, run:

   ```sh
   docker-compose up --build
   ```

3. The API will be available at: http://localhost:8000
4. The PostgreSQL database will be available at: localhost:5432 (user: postgres, password: admin123, db: NewScholarSphere)

### Optional: Bootstrap Database Schema Manually

Run this only when you need to initialize tables from `database/schema.sql`:

```sh
/workspaces/new-scholar-sphere/.venv/bin/python -c "from database.database import init_schema; init_schema('database/schema.sql'); print('schema initialized')"
```

### 2. API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These pages show all available endpoints, request/response formats, and allow you to test the API interactively.

### 3. Example API Usage

- **Base URL:** `http://localhost:8000`
- **Authentication:** Endpoints are public and do not require a token.
- **Headers:**
  - `Content-Type: application/json`

#### Example: Fetch all users

```http
GET /users
````

#### Example: Create a campus

```http
POST /lookups/campuses
Content-Type: application/json

{
  "name": "Main Campus",
  "address": "123 Main St",
  "is_active": true
}
```

---

## For Frontend Developers
- Use the `/docs` endpoint for live API testing and to see all routes.
- All endpoints, request bodies, and responses are documented there.
- All IDs are integer auto-increment values.
- If you need a sample request for a specific endpoint, check Swagger UI or ask the backend team.

### Recommended Frontend Strategy (Best Option)

Use compact per-module GET endpoints for list/bootstrap data, then keep detail CRUD endpoints for create/update/delete.

#### A) Dependent dropdowns (campus -> college -> department)

1. Initial load (campuses only):

```http
GET /lookups/dropdowns?resources=campuses
```

2. When a campus is selected (id=1), fetch colleges:

```http
GET /lookups/dropdowns?resources=colleges&campus_id=1
```

3. When a college is selected (id=2), fetch departments:

```http
GET /lookups/dropdowns?resources=departments&college_id=2
```

4. Optional single-call bootstrap for all three:

```http
GET /lookups/dropdowns?resources=campuses,colleges,departments&campus_id=1&college_id=2
```

#### B) Compact collection endpoints by module

- `GET /research/collections?resources=types,output_types,authors,papers`
- `GET /research-outputs/collections?paper_id=1`
- `GET /research-evaluations/collections?paper_id=1`
- `GET /presentations/collections?paper_id=1`
- `GET /users/collections`

#### C) Frontend flow example (pseudo)

```javascript
// on page mount
const { campuses } = await api.get('/lookups/dropdowns?resources=campuses');

// on campus change
const { colleges } = await api.get(`/lookups/dropdowns?resources=colleges&campus_id=${campusId}`);

// on college change
const { departments } = await api.get(`/lookups/dropdowns?resources=departments&college_id=${collegeId}`);
```

Why this is better:
- Fewer frontend API calls than strict line-by-line endpoints.
- Still modular and maintainable (avoids one giant global endpoint).
- Easy to debug because each module still has explicit CRUD routes.

---

## Troubleshooting
- If the API or DB fails to start, check Docker logs for errors.
- Ensure ports 8000 (API) and 5432 (DB) are not in use by other applications.
- Environment variables can be changed in `docker-compose.yml` as needed.
- Keep `DB_AUTO_CREATE=false` in shared and production environments to avoid accidental schema drift.

---

For further help, contact the backend team or check the README.md.
