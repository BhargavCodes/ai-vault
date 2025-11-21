🤖 AI Vault - Smart File Manager

A secure, AI-powered file management system that allows users to upload, analyze, and chat with their documents and images using Google's Gemini 2.5 Flash model.

(Replace this link with a screenshot of your actual dashboard later)

✨ Features

🧠 AI Capabilities

* Smart Analysis: Automatically detects file types (Images, PDFs, Word Docs).
* Visual Understanding: Extract tags, captions, and summaries from images.
* OCR \& Parsing: Extracts text from scanned documents and PDFs.
* RAG Chat: Chat contextually with any file ("What is the total in this invoice?").
* Auto-Tagging: AI suggests relevant tags for easy searching.

🛡️ Security \& Core

* Role-Based Access Control (RBAC): Admin vs User roles.
* Secure Auth: JWT-based authentication with session management.
* Rate Limiting: Prevents API abuse.
* Cloud Storage: Integrated with Cloudinary (or S3/Local) for file hosting.

🎨 Modern UI/UX

* Dark Mode: Fully responsive dark/light theme.
* Drag \& Drop: Intuitive upload interface.
* Animations: Smooth page transitions using Framer Motion.
* Toast Notifications: Real-time feedback for user actions.

🛠️ Tech Stack

Frontend:

* React + Vite
* Tailwind CSS (Styling)
* Framer Motion (Animations)
* Axios (API)
* Lucide React (Icons)

Backend:

* Flask (Python)
* SQLAlchemy (Database)
* Google Generative AI (Gemini 2.5 Flash)
* Cloudinary (Storage)

🚀 Getting Started

1. Prerequisites

* Node.js \& npm
* Python 3.10+
* Tesseract OCR (Required for local text extraction)

2. Backend Setup

cd python-backend

# Create virtual environment

python -m venv venv

# Windows: venv\\Scripts\\activate

# Mac/Linux: source venv/bin/activate

# Install dependencies

pip install -r requirements.txt

# Run the server

python run.py



3. Frontend Setup

cd frontend

# Install dependencies

npm install

# Run the dev server

npm run dev



🔑 Environment Variables

Create a .env file in python-backend/:

SECRET\_KEY=your\_super\_secret\_key
DATABASE\_URL=sqlite:///users.db
CLOUDINARY\_CLOUD\_NAME=your\_cloud\_name
CLOUDINARY\_API\_KEY=your\_api\_key
CLOUDINARY\_API\_SECRET=your\_api\_secret
GEMINI\_API\_KEY=your\_gemini\_key
RATELIMIT\_DEFAULT="200 per day"



📸 Screenshots

Login Page

Dark Mode Dashboard





📄 License

This project is licensed under the MIT License.

