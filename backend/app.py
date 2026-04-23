"""
AI Interview Coach - Flask Backend
Endpoints:
  POST /generate-question  -> returns AI-generated interview question
  POST /analyze-answer     -> returns structured feedback JSON
  POST /transcribe-audio   -> returns transcript from audio file
  POST /analyze-audio      -> returns transcript + structured feedback JSON

AI provider: Groq
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
import json
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# ✅ Correct way to load API key
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("❌ GROQ_API_KEY not set. Please check your .env file")

client = Groq(api_key=api_key)

GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_TRANSCRIBE_MODEL = "whisper-large-v3-turbo"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def extract_json(text: str) -> dict:
    """Extract the first JSON object from model output."""
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError("No JSON found in response")


def transcribe_audio_file(audio_file) -> str:
    """Transcribe a user-provided audio file using Groq Speech-to-Text."""
    filename = audio_file.filename or "recording.webm"
    audio_bytes = audio_file.read()
    if not audio_bytes:
        raise ValueError("Audio file is empty")

    transcription = client.audio.transcriptions.create(
        model=GROQ_TRANSCRIBE_MODEL,
        file=(filename, audio_bytes),
        response_format="verbose_json",
    )
    return (transcription.text or "").strip()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/generate-question", methods=["POST"])
def generate_question():
    data = request.get_json(force=True)
    role = data.get("role", "").strip()

    if not role:
        return jsonify({"error": "role is required"}), 400

    prompt = f"Generate a challenging interview question for a {role}. Return only the question."

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert interviewer."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=200,
        )

        question = response.choices[0].message.content.strip()
        return jsonify({"question": question})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/analyze-answer", methods=["POST"])
def analyze_answer():
    data = request.get_json(force=True)

    role = data.get("role", "candidate")
    question = data.get("question", "")
    answer = data.get("answer", "")

    if not answer:
        return jsonify({"error": "answer is required"}), 400

    system_prompt = "You are an expert interview coach."

    user_prompt = f"""
Role: {role}
Question: {question}
Answer: "{answer}"

Evaluate and return ONLY valid JSON:
{{
  "score": <1-10>,
  "clarity": {{ "rating": <1-10>, "comment": "" }},
  "confidence": {{ "rating": <1-10>, "comment": "" }},
  "relevance": {{ "rating": <1-10>, "comment": "" }},
  "communication": {{ "rating": <1-10>, "comment": "" }},
  "strengths": [],
  "weaknesses": [],
  "improved_answer": ""
}}
"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=800,
        )

        raw = response.choices[0].message.content.strip()
        feedback = extract_json(raw)

        return jsonify(feedback)

    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON from AI"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/transcribe-audio", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "audio file is required (multipart field: 'audio')"}), 400

    audio = request.files["audio"]
    if not audio or not audio.filename:
        return jsonify({"error": "valid audio file is required"}), 400

    try:
        transcript = transcribe_audio_file(audio)
        if not transcript:
            return jsonify({"error": "No speech detected in audio"}), 422
        return jsonify({"transcript": transcript})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/analyze-audio", methods=["POST"])
def analyze_audio():
    role = request.form.get("role", "candidate")
    question = request.form.get("question", "")

    if "audio" not in request.files:
        return jsonify({"error": "audio file is required (multipart field: 'audio')"}), 400

    audio = request.files["audio"]
    if not audio or not audio.filename:
        return jsonify({"error": "valid audio file is required"}), 400

    try:
        transcript = transcribe_audio_file(audio)
        if not transcript:
            return jsonify({"error": "No speech detected in audio"}), 422

        system_prompt = "You are an expert interview coach."
        user_prompt = f"""
Role: {role}
Question: {question}
Answer: "{transcript}"

Evaluate and return ONLY valid JSON:
{{
  "score": <1-10>,
  "clarity": {{ "rating": <1-10>, "comment": "" }},
  "confidence": {{ "rating": <1-10>, "comment": "" }},
  "relevance": {{ "rating": <1-10>, "comment": "" }},
  "communication": {{ "rating": <1-10>, "comment": "" }},
  "strengths": [],
  "weaknesses": [],
  "improved_answer": ""
}}
"""
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=800,
        )
        raw = response.choices[0].message.content.strip()
        feedback = extract_json(raw)

        return jsonify({"transcript": transcript, "feedback": feedback})
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON from AI"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Run Server
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)