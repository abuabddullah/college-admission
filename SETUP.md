# Backend Setup Guide

Detailed instructions for setting up and running the backend server.

## Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Navigate to backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Configure environment variables in `.env`:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=development
\`\`\`

## Running the Server

### Development Mode
\`\`\`bash
npm run dev
\`\`\`
Server runs on `http://localhost:5000` with auto-reload

### Production Mode
\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

### Health Check
\`\`\`bash
GET http://localhost:5000/health
\`\`\`

### Authentication
\`\`\`bash
# Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

### Colleges
\`\`\`bash
# Get all colleges
GET http://localhost:5000/api/colleges

# Get college by ID
GET http://localhost:5000/api/colleges/:id

# Create college (requires auth)
POST http://localhost:5000/api/colleges
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

### Bookings
\`\`\`bash
# Get user bookings
GET http://localhost:5000/api/bookings
Authorization: Bearer YOUR_JWT_TOKEN

# Create booking
POST http://localhost:5000/api/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

### Reviews
\`\`\`bash
# Get reviews for college
GET http://localhost:5000/api/reviews/college/:collegeId

# Create review
POST http://localhost:5000/api/reviews
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

## Database Seeding

The server automatically seeds the database with sample data on first run:
- Demo user: demo@example.com / password
- 6 sample colleges
- Sample reviews

## Testing with cURL

### Register User
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password"}'
\`\`\`

### Get Colleges
\`\`\`bash
curl http://localhost:5000/api/colleges
\`\`\`

## Troubleshooting

### Port Already in Use
Change PORT in `.env` file or kill the process using port 5000:
\`\`\`bash
# Find process
lsof -i :5000

# Kill process
kill -9 PID
\`\`\`

### MongoDB Connection Error
- Verify MONGODB_URI is correct
- Check network connectivity
- Whitelist your IP in MongoDB Atlas
- Ensure database user has proper permissions

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Secret should be at least 32 characters
- Generate secure secret: `openssl rand -base64 32`

### CORS Errors
CORS is configured to allow all origins in development. For production:
1. Update CORS configuration in index.ts
2. Add your frontend domain to allowed origins

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| PORT | No | Server port | 5000 |
| MONGODB_URI | Yes | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Yes | Secret for JWT signing | min 32 chars |
| NODE_ENV | No | Environment | development/production |

## Production Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed production deployment instructions.

## Support

For issues:
1. Check this guide
2. Review error logs
3. Test endpoints with Postman
4. Open GitHub issue with details
\`\`\`
