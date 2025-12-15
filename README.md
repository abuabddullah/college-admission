# College Booking Platform - Backend API

A complete REST API backend for the college booking platform with MongoDB integration, authentication, college management, booking system, and reviews.

## Features

- **MongoDB Database**: Persistent storage with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Register, login, profile updates
- **College CRUD**: Full CRUD operations for colleges with search and filters
- **Booking System**: Create, read, update, delete bookings with status management
- **Review System**: Rate and review colleges with automatic rating calculations
- **Auto-seeding**: Pre-populated with 6 colleges and demo account

## Installation

\`\`\`bash
cd backend
npm install
\`\`\`

## Configuration

The MongoDB connection URL is already configured in the code:

\`\`\`
mongodb+srv://asifaowadud:sof6vxfRNfUEvdCg@cluster0.gjcwx8p.mongodb.net/pauleynuts_backend?retryWrites=true&w=majority&appName=Cluster0
\`\`\`

You can optionally create a `.env` file to override:

\`\`\`
DATABASE_URL=your-mongodb-connection-string
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
\`\`\`

## Running the Server

### Development Mode
\`\`\`bash
npm run dev
\`\`\`

### Production Mode
\`\`\`bash
npm run build
npm start
\`\`\`

The server will start on `http://localhost:5000`

## Database Collections

The MongoDB database includes:
- **users** - User accounts with hashed passwords
- **colleges** - College information (6 pre-seeded)
- **bookings** - Student admission bookings
- **reviews** - College reviews and ratings

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  \`\`\`json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "address": "123 Main St"
  }
  \`\`\`

- `POST /api/auth/login` - Login user
  \`\`\`json
  {
    "email": "demo@example.com",
    "password": "password"
  }
  \`\`\`

- `GET /api/auth/me` - Get current user (requires auth token)
- `PUT /api/auth/profile` - Update user profile (requires auth token)

### Colleges

- `GET /api/colleges` - Get all colleges
  - Query params: `search`, `type`, `minRating`, `sortBy`
- `GET /api/colleges/:id` - Get single college with reviews
- `POST /api/colleges` - Create college (requires auth token)
- `PUT /api/colleges/:id` - Update college (requires auth token)
- `DELETE /api/colleges/:id` - Delete college (requires auth token)

### Bookings

- `GET /api/bookings` - Get user's bookings (requires auth token)
- `GET /api/bookings/:id` - Get single booking (requires auth token)
- `POST /api/bookings` - Create new booking (requires auth token)
  \`\`\`json
  {
    "collegeId": "college-object-id",
    "studentName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "course": "Computer Science",
    "previousEducation": "High School",
    "grade": "A",
    "address": "123 Main St",
    "guardianName": "Jane Doe",
    "guardianPhone": "+0987654321"
  }
  \`\`\`
- `PUT /api/bookings/:id` - Update booking (requires auth token)
- `DELETE /api/bookings/:id` - Delete booking (requires auth token)

### Reviews

- `GET /api/reviews/college/:collegeId` - Get reviews for a college
- `GET /api/reviews/user` - Get user's reviews (requires auth token)
- `POST /api/reviews` - Create review (requires auth token)
  \`\`\`json
  {
    "collegeId": "college-object-id",
    "rating": 5,
    "comment": "Excellent university!"
  }
  \`\`\`
- `PUT /api/reviews/:id` - Update review (requires auth token)
- `DELETE /api/reviews/:id` - Delete review (requires auth token)

### Admin

- `GET /api/admin/bookings` - Get all bookings (requires auth token)
- `PUT /api/admin/bookings/:id` - Update booking status (requires auth token)

## Authentication

All protected routes require an `Authorization` header with a Bearer token:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Default Demo Account

\`\`\`
Email: demo@example.com
Password: password
\`\`\`

## Testing with cURL

### Register
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

### Create Booking (with token)
\`\`\`bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"collegeId":"...","studentName":"John","email":"john@test.com","phone":"123","course":"CS","previousEducation":"HS","grade":"A","address":"123 St"}'
\`\`\`

## Database Schema

### User
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- phone (String)
- address (String)
- timestamps (createdAt, updatedAt)

### College
- name (String, required)
- location (String, required)
- description (String, required)
- rating (Number, default: 0)
- image (String)
- type (String)
- established (Number)
- affiliations (Array of Strings)
- courses (Array of Strings)
- facilities (Array of Strings)
- tuitionFee (Number)
- gallery (Array of Strings)
- timestamps (createdAt, updatedAt)

### Booking
- userId (ObjectId, ref: User)
- collegeId (ObjectId, ref: College)
- studentName (String, required)
- email (String, required)
- phone (String, required)
- course (String, required)
- previousEducation (String, required)
- grade (String, required)
- address (String, required)
- guardianName (String)
- guardianPhone (String)
- status (enum: pending/approved/rejected)
- timestamps (createdAt, updatedAt)

### Review
- userId (ObjectId, ref: User)
- collegeId (ObjectId, ref: College)
- userName (String, required)
- rating (Number, 1-5, required)
- comment (String, required)
- timestamps (createdAt, updatedAt)

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT authentication with 7-day expiration
- Protected routes requiring valid tokens
- CORS enabled for cross-origin requests
- MongoDB ObjectId validation
- Input validation for all endpoints

## Auto-seeding

On first startup, the database automatically seeds with:
- 1 demo user (demo@example.com / password)
- 6 prestigious universities (Stanford, MIT, Harvard, Oxford, Cambridge, UC Berkeley)
- 1 sample review

## Notes

- Database connection is already configured to MongoDB Atlas
- Data persists across server restarts
- JWT_SECRET should be changed for production
- Consider adding admin role authentication for sensitive operations
- Review system automatically updates college ratings when reviews are added/updated/deleted
