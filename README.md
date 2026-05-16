<div align="center">

# 🌐 GRAMA SAMASYA

### AI-Enabled Smart Village Grievance Reporting & Management Platform

<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
<img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/AI-Integrated-purple?style=for-the-badge" />
<img src="https://img.shields.io/badge/Open%20Source-Ready-orange?style=for-the-badge" />

---

### 🚀 Digitizing Civic Governance Through Intelligent Automation

</div>

---

#  Overview

GRAMA SAMASYA is an AI-enabled civic-tech platform developed to modernize public grievance reporting and issue resolution systems in villages and local communities.

The platform enables citizens to report infrastructure and civic-related problems digitally while providing administrators and workers with a centralized workflow management system.

The system integrates:
- 🤖 AI-based issue classification
- 🖼️ Image-supported reporting
- 🔔 Notification workflows
- 📊 Complaint tracking mechanisms
- 👥 Multi-role management architecture

---

# Problem Statement

Traditional grievance systems often suffer from:

❌ Manual paperwork  
❌ Lack of transparency  
❌ Delayed responses  
❌ Poor accountability  
❌ No centralized complaint tracking  

GRAMA SAMASYA solves these issues through an intelligent, scalable, and digital grievance ecosystem.

---

# Platform Architecture

```text
                           ┌────────────────────┐
                           │   Citizen / User   │
                           └─────────┬──────────┘
                                     │
                          Submit Complaint
                                     │
                                     ▼
                    ┌──────────────────────────┐
                    │  AI Issue Classification │
                    └─────────┬────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │      Admin Dashboard     │
                    └─────────┬────────────────┘
                              │
                     Assign Complaint
                              │
                              ▼
                    ┌──────────────────────────┐
                    │    Worker / Resolver     │
                    └─────────┬────────────────┘
                              │
                       Resolve Issue
                              │
                              ▼
                    ┌──────────────────────────┐
                    │  Status & Notifications  │
                    └──────────────────────────┘
```

---

# ⚡ Core Features

| Feature | Description |
|---|---|
| 📝 Complaint Reporting | Citizens can report public grievances digitally |
| 🖼️ Image Upload Support | Upload issue evidence for better validation |
| 🤖 AI Issue Classification | Automatically categorizes complaints |
| 📊 Complaint Tracking | Real-time status monitoring |
| 👨‍💼 Admin Dashboard | Centralized complaint management |
| 👷 Worker Module | Dedicated issue resolver workflow |
| 🔔 Notification Support | Status update notifications |
| 📱 Responsive Design | Mobile-friendly interface |

---

# Roles in the Platform

---

## 👤 1. Citizen / User

The citizen acts as the grievance initiator.

### Responsibilities
- Register/Login
- Submit complaints
- Upload issue images
- Track complaint status
- Receive notifications

### Accessible Features
```text
✔ Complaint Submission
✔ Complaint Dashboard
✔ Image Upload
✔ Status Tracking
✔ Notifications
```

---

## 👨‍💼 2. Administrator

The admin manages the entire grievance workflow.

### Responsibilities
- Verify complaints
- Monitor grievances
- Assign workers
- Manage issue statuses
- Handle workflow operations

### Accessible Features
```text
✔ Admin Dashboard
✔ Complaint Monitoring
✔ Worker Assignment
✔ Status Management
✔ Analytics & Filtering
```

---

## 👷 3. Worker / Resolver

Workers are responsible for resolving assigned field-level issues.

### Responsibilities
- Access assigned complaints
- Analyze issue details
- Resolve infrastructure problems
- Update work progress

### Accessible Features
```text
✔ Assigned Complaint View
✔ Progress Updates
✔ Resolution Workflow
✔ Issue Status Updates
```

---

# 🔄 System Workflow

```text
Citizen
   │
   ▼
Submit Complaint
   │
   ▼
AI Classification
   │
   ▼
Admin Verification
   │
   ▼
Worker Assignment
   │
   ▼
Issue Resolution
   │
   ▼
Status Update
   │
   ▼
Citizen Notification
```

---

# 🤖 AI Integration

The platform integrates AI-based complaint classification to automate issue categorization.

### Example

Input:
```text
"Street lights are not working near the bus stop"
```

AI Output:
```text
Electrical / Streetlight Issue
```

### Benefits
- Faster issue routing
- Reduced manual effort
- Improved workflow efficiency
- Intelligent grievance handling

---

# 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | AI | Deployment |
|---|---|---|---|---|
| React.js | Node.js | MongoDB | NLP/AI APIs | Vercel |
| HTML/CSS | Express.js | Mongoose | Classification Logic | Render |

</div>

---

# 📂 Project Architecture

```text
GRAMA SAMASYA
│
├── 🎨 Frontend (React + TypeScript)
│   ├── UI Components
│   ├── Grievance Modules
│   ├── Protected Routes
│   ├── Context Management
│   ├── Hooks & Utilities
│   └── Responsive Pages
│
├── 🤖 AI Integration
│   ├── Issue Classification
│   └── Complaint Categorization
│
├── 👥 Role-Based System
│   ├── Citizen/User
│   ├── Administrator
│   └── Worker/Resolver
│
├── 🔔 Notification System
│   ├── Toast Notifications
│   └── Status Update Alerts
│
├── 🛠️ Configuration
│   ├── Tailwind CSS
│   ├── Vite Configuration
│   ├── ESLint
│   └── TypeScript Config
│
└── 🚀 Deployment
    └── Vercel Hosting
```

---

# 🧩 Frontend Module Structure

```text
src/
│
├── components/
│   ├── grievance/
│   ├── layout/
│   ├── ui/
│   └── debug/
│
├── contexts/
├── hooks/
├── lib/
├── pages/
├── types/
│
├── App.tsx
├── main.tsx
└── index.css
```

---

# ⚙️ Development Stack

```text
Frontend  → React + TypeScript + Vite
Styling   → Tailwind CSS + shadcn/ui
State     → Context API + Hooks
AI Layer  → Issue Classification Logic
Routing   → Protected Route System
Hosting   → Vercel
```

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/grama-samasya.git
```

---

## 2️⃣ Navigate Into Project

```bash
cd grama-samasya
```

---

# 🔧 Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run backend:

```bash
npm start
```

or

```bash
nodemon server.js
```

---

# 💻 Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

# 🌐 Deployment

| Service | Purpose |
|---|---|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Cloud Database |

---

# 📈 Future Enhancements

- 🌍 Geo-location based issue mapping
- 📱 Mobile application
- 🗣️ Voice-based complaint reporting
- 🌐 Multilingual support
- 📊 Advanced analytics dashboard
- 🏛️ Government portal integration

---

# Real-World Impact

GRAMA SAMASYA promotes:
- Smart Governance
- Digital Transparency
- Civic Participation
- Efficient Public Service Delivery

The platform demonstrates how technology can solve real-world community-level governance challenges effectively.

---

# 🤝 Contributing

Contributions, ideas, and improvements are welcome.

```bash
Fork → Improve → Pull Request 🚀
```

---

# 📄 License

This project is developed for educational and innovation purposes.

---

# 👩‍💻 Author

## Aashritha Mittapally

🔗 GitHub: https://github.com/aashritha236

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

</div>
