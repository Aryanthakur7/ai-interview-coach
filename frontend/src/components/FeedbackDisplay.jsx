// FeedbackDisplay.jsx — rich feedback panel

import { useEffect, useRef } from 'react'

/* ── Score Ring ─────────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const r  = 54
  const cx = 70
  const circumference = 2 * Math.PI * r  // ≈ 339
  const offset = circumference - (score / 10) * circumference

  const color =
    score >= 8 ? '#6ee7b7' :
    score >= 5 ? '#fbbf24' :
                 '#f87171'

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
      {/* track */}
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e2333" strokeWidth="10" />
      {/* progress */}
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,.68,0,1.1)', filter: `drop-shadow(0 0 6px ${color})` }}
      />
      {/* label */}
      <text x={cx} y={cx - 6} textAnchor="middle" fill={color}
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>
        {score}
      </text>
      <text x={cx} y={cx + 16} textAnchor="middle" fill="#94a3b8"
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}>
        / 10
      </text>
    </svg>
  )
}

/* ── Dimension Bar ──────────────────────────────────────────────── */
function DimensionBar({ label, rating, comment, color }) {
  const pct = (rating / 10) * 100
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-body">
        <span className="text-slate-300 font-medium">{label}</span>
        <span style={{ color }} className="font-semibold tabular-nums">{rating}/10</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1e2333] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}88` }}
        />
      </div>
      {comment && <p className="text-[11px] text-slate-500 font-body leading-snug">{comment}</p>}
    </div>
  )
}

/* ── List Section ───────────────────────────────────────────────── */
function ListSection({ title, icon, items, accent }) {
  return (
    <div className="rounded-xl border border-[#1e2333] bg-[#0c0f18] p-4 flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest font-display font-600" style={{ color: accent }}>
        {icon} {title}
      </span>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm font-body text-slate-300 leading-snug">
            <span style={{ color: accent }} className="mt-0.5 flex-shrink-0">▸</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Skeleton Loader ────────────────────────────────────────────── */
function FeedbackSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-center py-4">
        <div className="skeleton rounded-full w-36 h-36" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-2 w-full" />
        </div>
      ))}
      <div className="skeleton h-20 w-full rounded-xl" />
      <div className="skeleton h-20 w-full rounded-xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
    </div>
  )
}

/* ── Main FeedbackDisplay ───────────────────────────────────────── */
export default function FeedbackDisplay({ feedback, loading }) {
  const panelRef = useRef(null)

  // Auto-scroll to feedback when it appears
  useEffect(() => {
    if (feedback && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [feedback])

  if (!loading && !feedback) return null

  const dimensions = feedback ? [
    { label: 'Clarity',              key: 'clarity',       color: '#6ee7b7' },
    { label: 'Confidence',           key: 'confidence',    color: '#818cf8' },
    { label: 'Relevance',            key: 'relevance',     color: '#fbbf24' },
    { label: 'Communication Skills', key: 'communication', color: '#f472b6' },
  ] : []

  return (
    <div ref={panelRef} className="rounded-2xl border border-[#1e2333] bg-[#0f1219] p-6 fade-up flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#1e2333] pb-4">
        <span className="text-lg">🎯</span>
        <h2 className="font-display font-800 text-white text-lg tracking-tight">AI Feedback Report</h2>
      </div>

      {loading ? <FeedbackSkeleton /> : (
        <>
          {/* Score */}
          <div className="flex flex-col items-center gap-1 py-2">
            <ScoreRing score={feedback.score} />
            <p className="text-xs text-slate-500 font-body uppercase tracking-widest">Overall Score</p>
          </div>

          {/* Dimension Bars */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#1e2333] bg-[#0c0f18] p-4">
            <span className="text-xs uppercase tracking-widest font-display font-600 text-slate-400">
              Dimension Breakdown
            </span>
            {dimensions.map(d => (
              <DimensionBar
                key={d.key}
                label={d.label}
                rating={feedback[d.key]?.rating ?? 0}
                comment={feedback[d.key]?.comment}
                color={d.color}
              />
            ))}
          </div>

          {/* Strengths */}
          <ListSection
            title="Strengths"
            icon="✅"
            items={feedback.strengths ?? []}
            accent="#6ee7b7"
          />

          {/* Weaknesses */}
          <ListSection
            title="Areas to Improve"
            icon="⚠️"
            items={feedback.weaknesses ?? []}
            accent="#fbbf24"
          />

          {/* Improved Answer */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-display font-600 text-indigo-400">
              ✨ Model Answer
            </span>
            <p className="text-sm font-body text-slate-200 leading-relaxed">
              {feedback.improved_answer}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
