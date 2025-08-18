# AI-Powered Counseling Platform

An intelligent counseling platform designed specifically for Ghanaian university campuses, providing 24/7 AI-powered emotional support, human counselor appointments, and comprehensive mental health resources.

## 🌟 Overview

This platform serves three types of users:
- **Students**: Access AI counseling, book appointments, and maintain journals
- **Counselors**: Manage student appointments and provide professional support
- **Admins**: Oversee the platform, manage users, and monitor system health

## 🚀 Key Features

### For Students
- **24/7 AI Counseling**: Chat with an AI counselor powered by Google Gemini
- **Human Counselor Booking**: Schedule appointments with professional counselors
- **Private Journaling**: Maintain personal journals with AI insights
- **Crisis Detection**: Automatic flagging of high-risk conversations for immediate help
- **Multi-language Support**: Available in English, Twi, Ewe, Hausa, and others

### For Counselors
- **Student Management**: View and manage assigned students
- **Appointment Scheduling**: Manage availability and appointments
- **Chat Monitoring**: Review flagged conversations when necessary
- **Student Profiles**: Access comprehensive student information

### For Admins
- **System Oversight**: Monitor platform usage and analytics
- **User Management**: Create counselor accounts and manage all users
- **Content Moderation**: Review flagged chats and journals
- **Analytics Dashboard**: Track platform performance and user engagement

## 🔐 User Registration & Login Guide

### 1. Student Registration & Login

#### Registration Process:
1. **Visit the Platform**: Go to the landing page
2. **Click "Get Started Free"** or navigate to `/register`
3. **Fill out the registration form** with:
   - Full Name
   - Student ID (must be unique)
   - Email Address
   - Password (minimum 8 characters)
   - Phone Number
   - Personal Information:
     - Age and Date of Birth
     - Gender (Male/Female/Other)
     - Marital Status
     - Academic Level
     - Programme of Study
     - Residential Status (On-Campus/Off-Campus/Hostel)
   - Support Information:
     - Preferred Language
     - Reason for Counseling
     - Emergency Contact Details
     - Previous Counseling History
   - **Consent**: Must agree to terms and privacy policy

4. **Account Creation**: Upon successful registration, you'll be automatically logged in
5. **Onboarding**: Complete the guided onboarding process

#### Login Process:
1. **Navigate to Login**: Click "Sign In" or go to `/login`
2. **Select User Type**: Choose "Student" from the dropdown
3. **Enter Credentials**: Provide your email and password
4. **Access Dashboard**: You'll be redirected to the student dashboard

#### Student Dashboard Features:
- Quick access to AI chat
- Upcoming appointments
- Recent journal entries
- Resource library
- Profile management

---

### 2. Counselor Registration & Login

**Note**: Counselors cannot self-register. They must be registered by an Admin.

#### Registration Process (Admin-initiated):
1. **Admin Access**: An admin logs into the admin panel
2. **Navigate to Counselor Management**: Go to `/admin/counselors`
3. **Click "Register New Counselor"**
4. **Admin fills out counselor form**:
   - Full Name
   - Staff ID (must be unique)
   - Email Address
   - Password (temporary - counselor should change on first login)
   - Phone Number
   - Gender
   - Department (e.g., Mental Health, Career Guidance)
   - Role (Counselor/Admin/Moderator)
   - Permissions:
     - View Students
     - Edit Profiles
     - Schedule Appointments
     - View Reports
     - Manage Users

5. **Account Creation**: Counselor receives login credentials
6. **First Login**: Counselor should change password immediately

#### Login Process:
1. **Navigate to Login**: Go to `/login`
2. **Select User Type**: Choose "Counselor" from the dropdown
3. **Enter Credentials**: Use provided email and password
4. **Change Password**: Update password on first login
5. **Access Admin Panel**: Redirected to counselor/admin dashboard

#### Counselor Dashboard Features:
- Student appointment management
- Student profile access
- Chat session monitoring
- Availability scheduling
- Reporting tools

---

### 3. Admin Registration & Login

#### Registration Process:
1. **Navigate to Admin Registration**: Go to `/register-admin`
2. **Fill out admin registration form**:
   - Full Name
   - Staff ID (must be unique)
   - Email Address
   - Password (minimum 8 characters)
   - Phone Number
   - Gender
   - Department
   - **Admin Registration Code**: Special code required for admin access
   - Permissions (automatically set for admin role)

3. **Verify Admin Code**: Must provide correct admin registration code
4. **Account Creation**: Admin account is created with full permissions

#### How to Get Admin Registration Code:

**Option 1: Default Code (For Development)**
- The system has a default admin registration code: `admin123`
- This works if no custom code is set in the environment variables

**Option 2: Custom Code (Recommended for Production)**
1. **Set in Environment Variables**: In your backend `.env` file, set:
   ```env
   ADMIN_REGISTRATION_CODE=your_secure_admin_code_here
   ```
2. **Choose a Secure Code**: Use a strong, unique code (recommended: 12+ characters with mixed case, numbers, symbols)
3. **System Administrator**: Contact the system administrator who deployed the application

**Option 3: Check Current Code (If you have backend access)**
1. Check the `.env` file in the backend folder
2. Look for `ADMIN_REGISTRATION_CODE=your_code`
3. If not set, the default code `admin123` is used

**Security Note**: 
- Never share the admin registration code publicly
- Change the default code before deploying to production
- Use a strong, unique code for security

#### Login Process:
1. **Navigate to Login**: Go to `/login`
2. **Select User Type**: Choose "Admin" from the dropdown
3. **Enter Credentials**: Provide email and password
4. **Access Admin Panel**: Full administrative dashboard access

#### Admin Dashboard Features:
- System analytics and metrics
- User management (students and counselors)
- Content moderation tools
- Flagged conversation reviews
- Platform configuration
- Counselor registration interface

## 💻 Technical Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/counseling-platform
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
ADMIN_REGISTRATION_CODE=your_admin_code
```

Run backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/counselor` - Counselor registration (admin only)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Counseling
- `POST /api/counseling/chat` - AI chat messaging
- `GET /api/counseling/chats` - Get chat history
- `POST /api/counseling/journal` - Create journal entry
- `GET /api/counseling/journals` - Get journal entries

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/student` - Student appointments
- `GET /api/appointments/counselor` - Counselor appointments
- `PATCH /api/appointments/:id` - Update appointment

### Admin
- `GET /api/admin/dashboard` - Admin analytics
- `GET /api/admin/students` - All students
- `GET /api/admin/counselors` - All counselors
- `GET /api/admin/flagged/chats` - Flagged conversations

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for all passwords
- **Role-Based Access**: Different permissions for each user type
- **Crisis Detection**: AI-powered flagging of concerning content
- **Data Privacy**: GDPR-compliant data handling
- **Rate Limiting**: API protection against abuse

## 🌍 Ghanaian Context Features

- **Multi-language Support**: English, Twi, Ewe, Hausa
- **Cultural Sensitivity**: AI trained on Ghanaian cultural context
- **Local Resource Integration**: University-specific resources and contacts
- **Academic Calendar Integration**: Aligns with Ghanaian university schedules

## 📱 User Experience Flow

### New Student Journey:
1. **Discovery**: Land on homepage → Learn about features
2. **Registration**: Click "Get Started" → Complete registration
3. **Onboarding**: Guided tour of features
4. **First Chat**: Immediate access to AI counselor
5. **Exploration**: Discover journaling, appointments, resources

### Counselor Workflow:
1. **Admin Invitation**: Receive account from admin
2. **First Login**: Secure login and password change
3. **Setup**: Configure availability and preferences
4. **Student Management**: Access assigned students
5. **Daily Operations**: Manage appointments and monitor chats

### Admin Operations:
1. **System Login**: Secure admin authentication
2. **Dashboard Overview**: System health and metrics
3. **User Management**: Create counselor accounts
4. **Content Moderation**: Review flagged content
5. **Analytics**: Monitor platform performance

## 🚨 Crisis Management

The platform includes sophisticated crisis detection:
- **AI Monitoring**: Automatic scanning for concerning language
- **Immediate Alerts**: Real-time notifications to counselors
- **Escalation Protocols**: Built-in emergency response procedures
- **Resource Linking**: Direct connection to crisis hotlines

## 📞 Support & Resources

- **Technical Support**: Contact system administrator
- **Counseling Resources**: Integrated resource library
- **Emergency Contacts**: Built-in crisis hotlines
- **User Guides**: In-app help and tutorials

## 🤝 Contributing

This platform is designed for Ghanaian university mental health support. For contributions or customizations, please follow established development patterns and maintain cultural sensitivity.

## 📄 License

ISC License - See backend/package.json for details

---

**Remember**: This platform provides AI-assisted counseling but does not replace professional mental health care. In crisis situations, always contact emergency services or professional counselors immediately. 