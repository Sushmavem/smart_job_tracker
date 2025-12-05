# Job Tracker

A modern, full-stack job application tracking system with a React frontend, FastAPI backend, and Chrome extension for seamless job saving.

## Features

### Core Features
- **User Authentication** - Secure registration and login with JWT tokens
- **Password Reset** - Forgot password flow with secure token-based reset
- **Job Application CRUD** - Create, read, update, and delete job applications
- **Status Tracking** - Track applications through stages: Applied, Interview, Offer, Rejected
- **Statistics Dashboard** - Visual overview of your job search progress
- **Notes & Resume Versioning** - Keep track of which resume you used and add notes

### Interview Calendar & Email Reminders
- **Interview Scheduling** - Schedule interviews with date, time, and type (Phone, Video, Onsite, etc.)
- **Calendar View** - Visual monthly calendar showing all scheduled interviews
- **Email Reminders** - Send yourself beautifully styled HTML email reminders for upcoming interviews
- **Interview Notes** - Add preparation notes, interviewer names, and other details

### Chrome Extension
- **One-Click Save** - Save job postings directly from LinkedIn, Indeed, Glassdoor, and more
- **Auto-Detection** - Automatically detects the job platform
- **Instant Sync** - Jobs saved from the extension appear immediately in your dashboard

### Modern UI/UX
- **Clean Dashboard Design** - Professional, distraction-free interface
- **Responsive Layout** - Works on desktop and tablet
- **Status Color Coding** - Visual indicators for application status
- **Search & Filter** - Quickly find applications by company, role, or status
- **Timeline View** - See when you applied and last updated each application

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS Variables** - Themeable design system

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **Pydantic v2** - Data validation and serialization
- **JWT** - Secure token-based authentication
- **Argon2** - Industry-standard password hashing

### Browser Extension
- **Manifest V3** - Latest Chrome extension standard
- **Content Scripts** - Auto-fill job details from pages

## Project Structure

```
job-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Reusable UI components
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobModal.jsx
│   │   │   ├── JobDetailModal.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatsCards.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── App.jsx        # Main app component
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/       # API route handlers
│   │   │   ├── auth_routes.py
│   │   │   ├── jobs_routes.py
│   │   │   ├── ai_routes.py
│   │   │   └── email_routes.py
│   │   ├── auth.py        # Authentication helpers
│   │   ├── config.py      # App configuration
│   │   ├── database.py    # MongoDB connection
│   │   ├── deps.py        # Dependencies (auth)
│   │   ├── models.py      # Collection names
│   │   ├── schemas.py     # Pydantic models
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── .env               # Environment variables
│
└── extension/             # Chrome extension
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── contentScript.js
    └── styles.css
```

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** Atlas account (free tier works) or local MongoDB
- **Chrome** browser (for extension)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example)
cp .env.example .env

# Edit .env with your settings (see Environment Variables section)
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

### 5. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The Job Tracker extension icon will appear in your toolbar

## Environment Variables

Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
mongodb_db_name=job_tracker_db

# JWT Settings
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=1440

# Email Settings (optional - for password reset emails)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Getting MongoDB URI
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is sufficient)
3. Click "Connect" > "Connect your application"
4. Copy the connection string and replace `<password>` with your password

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login and get JWT token |
| POST | `/auth/forgot-password` | Request password reset token |
| POST | `/auth/reset-password` | Reset password with token |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/` | Get all jobs for user |
| POST | `/jobs/` | Create new job application |
| GET | `/jobs/{id}` | Get specific job |
| PUT | `/jobs/{id}` | Update job application |
| DELETE | `/jobs/{id}` | Delete job application |
| GET | `/jobs/stats` | Get application statistics |
| GET | `/jobs/calendar/events` | Get calendar events (interviews) |

### Email
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/email/send-reminder` | Send interview reminder email |
| GET | `/email/upcoming-interviews` | Get interviews in next 7 days |

## Usage Guide

### Adding a Job Manually
1. Click "Add Job" in the sidebar or the "+" button
2. Fill in company name, role, and job posting URL
3. Optionally add status, platform, notes, and resume version
4. Click "Add Application"

### Using the Chrome Extension
1. Navigate to a job posting (LinkedIn, Indeed, etc.)
2. Click the Job Tracker extension icon
3. The job details will be auto-filled
4. Click "Save Job" to add it to your tracker

### Tracking Application Status
1. Click on any job card to view details
2. Use the status dropdown to update (Applied → Interview → Offer/Rejected)
3. Add notes about interviews, contacts, etc.

### Scheduling Interviews
1. Click on any job card to view details
2. Scroll to "Interview Schedule" section
3. Click "Schedule" to add an interview
4. Set date, time, type (Phone/Video/Onsite), and notes
5. Click "Save Interview"

### Using the Calendar
1. Click "Calendar" in the sidebar
2. Navigate months with arrow buttons or click "Today"
3. Dates with interviews show colored dots
4. Click a date to see all interviews for that day
5. Click "View Job" to see full job details

### Sending Interview Reminders
1. Schedule an interview for a job (see above)
2. In the job detail or calendar view, click "Send Email Reminder"
3. A styled HTML email will be sent to your registered email
4. The reminder includes company, role, date/time, type, and notes

### Resetting Your Password
1. Click "Forgot password?" on the login page
2. Enter your email address
3. Copy the reset token provided
4. Enter the token and your new password

## Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Feature Ideas
- [x] ~~Email notifications for status changes~~ **Interview email reminders implemented!**
- [x] ~~Interview scheduling with calendar integration~~ **Calendar view implemented!**
- [ ] Resume upload and storage
- [ ] Job description AI summarization
- [ ] Resume-to-job matching score
- [ ] Export applications to CSV/PDF
- [ ] Dark mode theme
- [ ] Mobile app (React Native)
- [ ] Browser extension for Firefox/Safari
- [ ] Salary tracking and comparison
- [ ] Company research integration
- [ ] Google Calendar sync

## Troubleshooting

### Common Issues

**"Command not found: python"**
- Use `python3` instead of `python` on macOS/Linux

**MongoDB connection fails**
- Check your `MONGODB_URI` in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify username/password are correct

**CORS errors in browser**
- Make sure backend is running on port 8001
- Check that frontend URL is in the `origins` list in `main.py`

**Extension not working**
- Reload the extension in `chrome://extensions/`
- Check the browser console for errors
- Ensure you're logged in on the main app first

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI inspired by modern dashboard designs
- Icons from [Heroicons](https://heroicons.com/)

---

Made with dedication for job seekers everywhere. Good luck with your job search!
