# AI-Powered Counseling Platform API

This is the backend API for an AI-powered counseling platform designed specifically for Ghanaian university campuses. It provides virtual counseling through AI chatbots, allows human counselor appointment scheduling, student journaling, and comprehensive administrative oversight.

## Features

- **AI Counseling Chat**: 24/7 support through Gemini AI integration
- **Student Journaling**: Private journaling with AI insights
- **Human Counselor Appointments**: Schedule in-person or virtual sessions
- **Administrative Dashboard**: Monitor usage, flagged content, and analytics
- **Role-Based Access**: Different permissions for students, counselors, and admins
- **Crisis Detection**: Automatic flagging of high-risk conversations

## Tech Stack

- **Node.js & Express**: API framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication and authorization
- **Google Gemini AI**: Powering the AI counseling features
- **bcrypt**: Password hashing

## Prerequisites

- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd counselling-project/backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/counseling-platform
   MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/counseling-platform

   # JWT Secret Keys
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_EXPIRES_IN=7d

   # Google Gemini AI API Keys
   GEMINI_API_KEY=your_gemini_api_key

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   EMAIL_FROM=support@counseling-platform.com

   # Security
   BCRYPT_SALT_ROUNDS=10
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register/student`: Register a new student
- `POST /api/auth/register/counselor`: Register a new counselor (admin only)
- `POST /api/auth/login`: Login for students/counselors
- `POST /api/auth/refresh-token`: Refresh authentication token
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password with token
- `POST /api/auth/change-password`: Change password when logged in
- `POST /api/auth/logout`: Logout

### Counseling

- `POST /api/counseling/chat`: Send message to AI counselor
- `GET /api/counseling/chats`: Get all chat sessions for current student
- `GET /api/counseling/chats/:id`: Get specific chat session
- `PATCH /api/counseling/chats/:id/end`: End a chat session

### Journaling

- `POST /api/counseling/journal`: Create a journal entry
- `GET /api/counseling/journals`: Get all journal entries
- `GET /api/counseling/journals/:id`: Get a specific journal entry
- `PATCH /api/counseling/journals/:id`: Update a journal entry
- `DELETE /api/counseling/journals/:id`: Delete a journal entry

### Appointments

- `POST /api/appointments`: Create a new appointment
- `GET /api/appointments/student`: Get student's appointments
- `GET /api/appointments/counselor`: Get counselor's appointments
- `GET /api/appointments/:id`: Get specific appointment
- `PATCH /api/appointments/:id`: Update an appointment
- `PATCH /api/appointments/:id/cancel`: Cancel an appointment
- `GET /api/appointments/counselor/:id/timeslots`: Get available time slots

### Admin

- `GET /api/admin/dashboard`: Get dashboard analytics
- `GET /api/admin/students`: Get all students
- `GET /api/admin/students/:id`: Get specific student
- `PATCH /api/admin/students/:id`: Update student info
- `PATCH /api/admin/students/:id/status`: Toggle student status
- `GET /api/admin/counselors`: Get all counselors
- `PATCH /api/admin/counselors/:id`: Update counselor info
- `PATCH /api/admin/counselors/:id/status`: Toggle counselor status
- `GET /api/admin/flagged/chats`: Get flagged chats
- `GET /api/admin/flagged/journals`: Get flagged journals
- `PATCH /api/admin/flagged/chats/:id/review`: Review flagged chat
- `PATCH /api/admin/flagged/journals/:id/review`: Review flagged journal

## License

This project is licensed under the ISC License.

## Contributors

- Your Name

## Acknowledgements

- Google Gemini API for powering the AI counseling features
- MongoDB Atlas for database hosting
