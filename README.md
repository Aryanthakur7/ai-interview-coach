# 🎯 AI Interview Coach

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat&logo=flask)
![LLaMA](https://img.shields.io/badge/LLaMA-3.3_70B-0467DF?style=flat)
![Groq](https://img.shields.io/badge/Groq-Free_API-F55036?style=flat)
![Voice](https://img.shields.io/badge/Voice-Web_Speech_API-8B5CF6?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)
# 🎯 AI Interview Coach

A production-ready web app that simulates job interviews and delivers structured AI feedback on your answers.

---

## ✨ Features

| Feature | Detail |
|---|---|
| Role Selection | 14 job roles |
| AI Question Generation | Role-specific, GPT-4o-mini powered |
| Answer Analysis | Score + 4 dimensions + strengths/weaknesses + model answer |
| Real-time Feedback | Animated score ring, dimension bars, skeleton loaders |
| Dark Modern UI | Syne + DM Sans, grain overlay, glow accents |

---

## 🗂 Project Structure

```
ai-interview-coach/
├── backend/
│   ├── app.py              # Flask API (2 endpoints)
│   ├── requirements.txt
│   └── .env                # ← you create this
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        └── components/
            ├── RoleSelector.jsx
            ├── QuestionDisplay.jsx
            ├── AnswerInput.jsx
            └── FeedbackDisplay.jsx
```

---

## 🚀 Setup & Run

### Prerequisites
- Python 3.9+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your OpenAI key
echo "OPENAI_API_KEY=sk-..." > .env   # or set it as an env var

# Run the Flask server
python app.py
# → Listening on http://localhost:5000
```

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# → Open http://localhost:5173
```

The Vite dev server proxies `/generate-question` and `/analyze-answer` to Flask,
so no CORS issues during development.

---

## 🌐 API Reference

### `POST /generate-question`
```json
Request:  { "role": "Software Engineer" }
Response: { "question": "Explain the difference between a process and a thread." }
```

### `POST /analyze-answer`
```json
Request:
{
  "role":     "Software Engineer",
  "question": "Explain the difference between a process and a thread.",
  "answer":   "A process is an independent program with its own memory..."
}

Response:
{
  "score": 7,
  "clarity":       { "rating": 8, "comment": "Clear and well-structured." },
  "confidence":    { "rating": 6, "comment": "Could be more assertive." },
  "relevance":     { "rating": 9, "comment": "Directly addresses the question." },
  "communication": { "rating": 7, "comment": "Good vocabulary." },
  "strengths":     ["Accurate technical definition", "Good example usage"],
  "weaknesses":    ["Lacks depth on scheduling", "No real-world scenario"],
  "improved_answer": "A process is an isolated execution unit..."
}
```

---

## 🏗 Build for Production

```bash
# Frontend
cd frontend && npm run build
# Output: frontend/dist/

# Serve with Flask (optional)
# Copy dist/ into backend/static/ and update Flask to serve it
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key (free at console.groq.com) |

---

## 💡 Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3
- **Backend**: Python Flask 3, Flask-CORS
- **AI**: Groq API — `llama-3.3-70b-versatile` (free tier)
- **Fonts**: Syne (display) + DM Sans (body)
