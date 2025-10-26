# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Mwaslatak Website"
}
```

### Test Endpoint
```http
GET /api/test
```

**Response:**
```json
{
  "message": "API working successfully 🚀",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented, but it can be added using express-rate-limit middleware.

## CORS

CORS is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:5000`
- `https://mwaslatak.com`
- `https://www.mwaslatak.com`

## Future Endpoints

The following endpoints can be added as needed:

### User Management
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Content Management
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Contact Form
- `POST /api/contact` - Submit contact form

## Authentication

Currently no authentication is implemented. JWT tokens can be added for protected routes.

## Database Integration

Database models can be added in `src/server/models/` using Mongoose or your preferred ODM/ORM.
