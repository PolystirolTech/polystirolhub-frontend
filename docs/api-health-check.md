# API Health Check Implementation

## Frontend Changes

✅ **Completed:**

- Created `src/hooks/use-api-status.ts` - custom hook for monitoring API health
- Updated `src/components/layout/header.tsx` to use real API status check
- Added dynamic color-coded status indicator:
  - 🟢 Green (with pulse) - API online
  - 🟡 Yellow (with pulse) - Checking...
  - 🔴 Red (no pulse) - API offline

## Backend Requirements

⚠️ **Required on Backend:**

The frontend expects a health check endpoint at:

```
GET /health
```

### Expected Response Format

**Success Response (200 OK):**

```json
{
	"status": "healthy"
}
```

**Error Response (5xx):**
Any error status code will mark the API as offline.

### Implementation Example (FastAPI)

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring API status
    """
    return {"status": "healthy"}
```

Then add this router to your main app:

```python
from app.api.routes import health

app.include_router(health.router, tags=["health"])
```

## Configuration

The frontend uses the following environment variable:

- `NEXT_PUBLIC_API_URL` - Base URL of the backend API (default: `http://localhost:8000`)

## Monitoring Behavior

- **Initial Check:** Runs immediately on page load
- **Periodic Checks:** Every 30 seconds
- **Timeout:** 5 seconds per request
- **Error Handling:** Network errors, timeouts, and non-200 responses mark API as offline
