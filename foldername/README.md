# ToggleNest - Collaborative Task Management Platform

A comprehensive MERN stack application for collaborative project management with Kanban boards, real-time chat, role-based access control, and advanced analytics.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based login and registration
- **Project Management**: Create, join, and manage projects with unique codes
- **Kanban Boards**: Drag-and-drop task management with real-time updates
- **Real-time Chat**: Team communication with mentions and reactions
- **Role-Based Access Control**: Owner, Admin, SDE, Contributor, Viewer roles
- **Activity Logging**: Comprehensive audit trail for all project activities
- **Member Management**: Invite, remove, and change member roles
- **Dashboard Analytics**: Charts and insights for project progress

### Advanced Features
- **Task Management**: Labels, subtasks, blockers, priorities, assignees
- **Responsive Design**: Mobile-first approach with touch support
- **Real-time Updates**: Socket.io integration for live collaboration
- **File Attachments**: Support for project and task attachments
- **Git Integration**: Link projects to GitHub repositories
- **Notifications**: Real-time notifications for mentions and updates

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** for RESTful APIs
- **MongoDB** with **Mongoose** for data modeling
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with **Vite** for fast development
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **React Query** for data fetching
- **React Beautiful DnD** for drag-and-drop
- **Recharts** for data visualization
- **Framer Motion** for animations

### UI Components
- **Radix UI** primitives
- **shadcn/ui** components
- **Lucide React** icons

## 📁 Project Structure

```
togglenest/
├── backend/
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Authentication & authorization
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── index.js             # Server entry point
│   ├── seed.js              # Database seeding
│   └── .env                 # Environment variables
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   ├── stores/              # Zustand state stores
│   ├── hooks/               # Custom React hooks
│   ├── assets/              # Static assets
│   └── styles/              # Global styles
├── public/                  # Public assets
└── package.json             # Dependencies
```

## 🗄️ Database Models

### Core Models
- **User**: User accounts with authentication
- **Project**: Project information and settings
- **Task**: Kanban tasks with subtasks and labels
- **Membership**: User-project role relationships
- **Message**: Chat messages with mentions
- **ActivityLog**: Audit trail for all actions

### Extended Models (Stubs)
- **Sprint**: Agile sprint management
- **Channel**: Chat channels
- **File**: File attachments
- **CalendarEvent**: Meeting scheduling
- **AutomationRule**: Workflow automation
- **AIInsight**: AI-powered insights

## 🔐 Roles & Permissions

| Permission | Owner | Admin | SDE | Contributor | Viewer |
|------------|-------|-------|-----|-------------|--------|
| Create Project | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Project Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit All Tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Own Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send Invites | ✅ | ✅ | ❌ | ❌ | ❌ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or Atlas account)
3. **npm** or **yarn**

### MongoDB Setup

#### Option 1: Local MongoDB
1. Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb/brew/mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get connection string
3. Update `backend/.env` with your Atlas connection string

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd togglenest
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ..
   npm install
   ```

4. **Environment Setup**
   - Copy `backend/.env.example` to `backend/.env`
   - Update MongoDB connection string
   - Set JWT secret key

5. **Seed Database** (Optional)
   ```bash
   cd backend
   npm run seed
   ```

6. **Start Development Servers**

   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend:**
   ```bash
   npm run dev
   ```

7. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📊 Sample Data

After running the seed script, you can login with these accounts:

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | Owner |
| bob@example.com | password123 | Admin |
| charlie@example.com | password123 | SDE |
| diana@example.com | password123 | Contributor |
| eve@example.com | password123 | Viewer |

## 🔧 Available Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm run seed     # Seed database with sample data
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/join` - Join project with code
- `POST /api/projects/:id/invite` - Send project invite
- `POST /api/projects/invites/:id/accept` - Accept invite
- `POST /api/projects/invites/:id/decline` - Decline invite

### Tasks
- `GET /api/projects/:id/tasks` - Get project tasks
- `POST /api/projects/:id/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Members
- `GET /api/projects/:id/members` - Get project members
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member
- `PATCH /api/projects/:id/members/:userId/role` - Change role

### Chat
- `GET /api/projects/:id/messages` - Get chat messages
- `POST /api/projects/:id/messages` - Send message

### Activity
- `GET /api/projects/:id/activities` - Get activity logs

## 🔄 Real-time Events (Socket.io)

### Task Events
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:moved` - Task moved between columns

### Chat Events
- `message:sent` - New message sent
- `message:reaction` - Message reaction added

### Member Events
- `member:added` - Member added to project
- `member:removed` - Member removed from project
- `member:roleChanged` - Member role changed

## 🎨 UI Components

The application uses a component library built with:
- **Radix UI** for accessible primitives
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Framer Motion** for animations

Key components include:
- `KanbanBoard` - Main task board
- `KanbanTaskCard` - Individual task cards
- `MembersPanel` - Member management
- `ProjectChat` - Chat interface
- `ActivityLog` - Activity timeline
- `DashboardSummaryCard` - Analytics cards

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to services like Heroku, Railway, or AWS
3. Ensure MongoDB connection string is set

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy `dist` folder to services like Vercel, Netlify, or AWS S3
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using the MERN stack**
