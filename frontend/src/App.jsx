// App.jsx — AI Interview Coach

import { useRef, useState } from 'react'
import RoleSelector    from './components/RoleSelector.jsx'
import QuestionDisplay from './components/QuestionDisplay.jsx'
import AnswerInput     from './components/AnswerInput.jsx'
import FeedbackDisplay from './components/FeedbackDisplay.jsx'

const API = ''  // empty = same origin (proxied by Vite)

/* ── tiny API helpers ── */
async function apiFetch(path, body) {
  const res = await fetch(`${API}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Unknown error')
  }
  return res.json()
}

async function apiFetchForm(path, formData) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Unknown error')
  }
  return res.json()
}

/* ── Header ── */
function Header() {
  return (
    <header className="text-center py-10 px-4 select-none">
      {/* subtle top accent line */}
      <div className="mx-auto mb-8 w-24 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70" />

      <p className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-display font-600 mb-3">
        Powered by AI
      </p>
      <h1 className="font-display font-800 text-4xl sm:text-5xl text-white leading-tight">
        Interview<br className="sm:hidden" />{' '}
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          Coach
        </span>
      </h1>
      <p className="mt-3 text-slate-500 font-body text-sm max-w-sm mx-auto leading-relaxed">
        Practice. Get AI feedback. Land your dream job.
      </p>
    </header>
  )
}

/* ── Step Badge ── */
function Step({ n, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-6 rounded-full bg-[#1e2333] text-emerald-400 font-display font-700
                       text-xs flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      <span className="text-xs uppercase tracking-widest text-slate-500 font-display font-600">{label}</span>
    </div>
  )
}

/* ── Toast ── */
function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-rose-900/90 border border-rose-700/60
                    text-rose-200 font-body text-sm px-4 py-3 rounded-xl shadow-2xl
                    flex items-center gap-3 fade-up max-w-xs">
      <span>⚠️ {message}</span>
      <button onClick={onClose} className="text-rose-400 hover:text-white ml-auto pl-2">✕</button>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [role,         setRole]         = useState('Software Engineer')
  const [question,     setQuestion]     = useState('')
  const [answer,       setAnswer]       = useState('')
  const [feedback,     setFeedback]     = useState(null)
  const [transcript,   setTranscript]   = useState('')
  const [audioFile,    setAudioFile]    = useState(null)
  const [recording,    setRecording]    = useState(false)
  const [genLoading,   setGenLoading]   = useState(false)
  const [anlyLoading,  setAnlyLoading]  = useState(false)
  const [error,        setError]        = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const handleGenerate = async () => {
    setGenLoading(true)
    setFeedback(null)
    setTranscript('')
    setAnswer('')
    setAudioFile(null)
    setError('')
    try {
      const data = await apiFetch('/generate-question', { role })
      setQuestion(data.question)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setAnlyLoading(true)
    setFeedback(null)
    setTranscript('')
    setError('')
    try {
      const data = await apiFetch('/analyze-answer', { role, question, answer })
      setFeedback(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setAnlyLoading(false)
    }
  }

  const handleAudioFileChange = (event) => {
    const file = event.target.files?.[0] || null
    setAudioFile(file)
  }

  const handleStartRecording = async () => {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size > 0) {
          const ext = (recorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm'
          const file = new File([blob], `recording.${ext}`, { type: blob.type || 'audio/webm' })
          setAudioFile(file)
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch (e) {
      setError(e.message || 'Could not access microphone.')
    }
  }

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
    setRecording(false)
  }

  const handleAnalyzeAudio = async () => {
    if (!audioFile) {
      setError('Please record or upload an audio file first.')
      return
    }

    setAnlyLoading(true)
    setFeedback(null)
    setTranscript('')
    setError('')

    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('role', role)
      formData.append('question', question)

      const data = await apiFetchForm('/analyze-audio', formData)
      setTranscript(data.transcript || '')
      setAnswer(data.transcript || '')
      setFeedback(data.feedback || null)
    } catch (e) {
      setError(e.message)
    } finally {
      setAnlyLoading(false)
    }
  }

  const handleReset = () => {
    setQuestion('')
    setAnswer('')
    setFeedback(null)
    setTranscript('')
    setAudioFile(null)
    setRecording(false)
    setError('')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] rounded-full
                        bg-emerald-900/20 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[0%] w-[400px] h-[400px] rounded-full
                        bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
        <Header />

        {/* ── Card ── */}
        <div className="rounded-2xl border border-[#1e2333] bg-[#0f1219]/80 backdrop-blur-sm p-6 sm:p-8 flex flex-col gap-7 shadow-2xl">

          {/* Step 1 — Role */}
          <div>
            <Step n="1" label="Choose Your Role" />
            <RoleSelector value={role} onChange={setRole} disabled={genLoading || anlyLoading} />
          </div>

          {/* Step 2 — Generate */}
          <div>
            <Step n="2" label="Get a Question" />
            <QuestionDisplay question={question} loading={genLoading} />
            <button
              onClick={handleGenerate}
              disabled={genLoading || anlyLoading}
              className="mt-3 w-full rounded-xl py-3.5 font-display font-700 text-sm
                         uppercase tracking-widest
                         bg-gradient-to-r from-emerald-500 to-teal-500
                         text-[#090b10] shadow-lg shadow-emerald-900/40
                         transition-all duration-200
                         hover:shadow-emerald-600/50 hover:scale-[1.01]
                         active:scale-[0.99]
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {genLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-emerald-900" />
                  <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-emerald-900" style={{animationDelay:'.2s'}} />
                  <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-emerald-900" style={{animationDelay:'.4s'}} />
                  Generating…
                </span>
              ) : question ? '↺  New Question' : 'Generate Question'}
            </button>
          </div>

          {/* Step 3 — Answer (only shown after question exists) */}
          {(question || genLoading) && (
            <div className="fade-up">
              <Step n="3" label="Write Your Answer" />
              <AnswerInput
                value={answer}
                onChange={setAnswer}
                onAnalyze={handleAnalyze}
                onAnalyzeAudio={handleAnalyzeAudio}
                loading={anlyLoading}
                disabled={genLoading || !question}
                recording={recording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                audioReady={Boolean(audioFile)}
                onAudioFileChange={handleAudioFileChange}
              />
            </div>
          )}
        </div>

        {!!transcript && !anlyLoading && (
          <div className="mt-6 rounded-2xl border border-[#1e2333] bg-[#0f1219] p-5 fade-up">
            <p className="text-xs uppercase tracking-widest font-display font-600 text-indigo-400 mb-2">
              Transcribed Answer
            </p>
            <p className="text-sm font-body text-slate-200 leading-relaxed">
              {transcript}
            </p>
          </div>
        )}

        {/* ── Feedback ── */}
        {(anlyLoading || feedback) && (
          <div className="mt-6">
            <FeedbackDisplay feedback={feedback} loading={anlyLoading} />
          </div>
        )}

        {/* ── Reset ── */}
        {(feedback || question) && !anlyLoading && !genLoading && (
          <div className="mt-6 text-center fade-up">
            <button
              onClick={handleReset}
              className="text-xs text-slate-600 hover:text-slate-400 font-body
                         transition-colors duration-150 underline underline-offset-4"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {error && <Toast message={error} onClose={() => setError('')} />}
    </div>
  )
}
