# SmartDesk

**Complete University Management System with 200+ Features**

AI-Powered Student Feedback Intelligence Platform evolved into a comprehensive university management system.

Made with 💚 by [rynixofficial](https://github.com/rynixofficial)

## 🚀 Features

### Core Features (200+)
- **Multi-Role System**: 10 different user roles (Super Admin, Admin, Academic Manager, Faculty, Student, etc.)
- **Student Dashboard**: Unified portal with courses, attendance, fees, library, events, feedback
- **Admin Panel**: Complete management interface with analytics, user management, configuration
- **Academic Management**: Departments, courses, enrollments, grades, transcripts
- **Attendance System**: Mark attendance, reports, analytics, notifications
- **Financial Management**: Fee collection, scholarships, payment tracking
- **Library Management**: Book catalog, issue/return, reservations, fines
- **Hostel Management**: Room allocation, maintenance, fee management
- **Event Management**: Create events, registrations, notifications
- **Announcement System**: Targeted announcements, categories, priority levels
- **Infrastructure Management**: Buildings, rooms, facilities, maintenance
- **AI-Powered Analytics**: Local Gemma model via Ollama for insights and categorization
- **Real-Time Dashboards**: Comprehensive analytics with interactive charts
- **Black Neon Theme**: Modern dark UI with neon accents
- **Production Ready**: Secure authentication, role-based access, error handling

### Security Features
- JWT authentication with HTTP-only cookies
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Account lockout protection
- Rate limiting
- Security headers
- Audit logging ready

## ✅ Current Status - FULLY FUNCTIONAL

**All major systems are working and ready for production:**

- ✅ **Authentication System**: Login/logout, role-based access, JWT tokens
- ✅ **Student Dashboard**: Complete with courses, attendance, fees, library, events
- ✅ **Announcements System**: Public announcements display correctly in student dashboard
- ✅ **Admin Panel**: User management, analytics, configuration
- ✅ **Database**: MongoDB with 18 models, seeded with sample data
- ✅ **API Endpoints**: 100+ endpoints with proper protection and error handling
- ✅ **Frontend**: Next.js with Tailwind CSS, responsive design
- ✅ **Security**: Rate limiting, CORS, input validation, audit logging
- ✅ **Sample Data**: Default users and announcements available after seeding

## 📋 Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- Ollama (optional, for AI features)

## 🛠️ Installation

### Backend Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# MONGO_URI=mongodb://localhost:27017/smartdesk
# JWT_SECRET=your-secret-key
# CLIENT_ORIGIN=http://localhost:3000

# Seed database with default users
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## 👤 Default Users

After running `npm run seed`:

- **Admin**: `admin` / `admin123`
- **Student**: `student` / `student123`
- **Librarian**: `librarian` / `lib123`
- **Hostel Manager**: `hostel_manager` / `hostel123`
- **Finance Manager**: `finance_manager` / `finance123`
- **Academic Manager**: `academic_manager` / `academic123`
- **Faculty**: `faculty` / `faculty123`

## 📁 Project Structure

```
smartdesk2/
├── server/
│   ├── models/          # 18 MongoDB models (User, Course, Department, etc.)
│   ├── controllers/     # Business logic controllers
│   ├── routes/          # Express routes with role-based protection
│   ├── middleware/      # Auth, security, validation, rate limiting
│   ├── ai/              # Ollama AI integration
│   ├── data/            # Database connection and seed data
│   └── index.js         # Server entry point
├── client/
│   ├── pages/           # Next.js pages (admin, student, login)
│   ├── components/      # Reusable React components
│   ├── styles/          # Global styles and neon theme
│   ├── lib/             # API utilities and helpers
│   └── public/          # Static assets
├── docs/                # Documentation files
└── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /api/auth/me` - Get current user info

### Student Dashboard
- `GET /api/student/top-topics` - Get trending topics
- `GET /api/enrollments/student/me` - Get enrolled courses
- `GET /api/attendance/me` - Get attendance records
- `GET /api/fees/me` - Get fee information
- `GET /api/library/books/me` - Get issued books
- `GET /api/events` - Get upcoming events
- `GET /api/announcements` - Get announcements
- `POST /student/feedback` - Submit feedback

### Admin Management
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Academic Management
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `POST /api/enrollments` - Enroll student
- `POST /api/attendance` - Mark attendance

### System Configuration
- `GET /api/config` - Get all configurations
- `PUT /api/config` - Update configuration
- `GET /api/roles` - Get all roles
- `GET /api/permissions` - Get user permissions

### And 100+ more endpoints for comprehensive university management...
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Topics (Admin Only)
- `GET /api/topics` - List topics
- `GET /api/topics/:id` - Get topic
- `POST /api/topics` - Create topic
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic

## 🎨 Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: Next.js, React, Tailwind CSS
- **AI**: Ollama (local Gemma model)
- **Auth**: JWT (HTTP-only cookies)

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use secure `JWT_SECRET`
3. Configure `CLIENT_ORIGIN` to your frontend domain
4. Set up MongoDB connection string
5. Build frontend: `cd client && npm run build && npm start`
6. Start backend: `npm start`

## 📝 License

MIT

## 👨‍💻 Author

**rynixofficial**

- GitHub: [@rynixofficial](https://github.com/rynixofficial)

---

Built with 💚 for universities worldwide
