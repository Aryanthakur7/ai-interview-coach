// QuestionDisplay.jsx — shows the AI-generated question with skeleton loader

export default function QuestionDisplay({ question, loading }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest font-display font-600 text-indigo-400">
        Interview Question
      </span>

      <div className="rounded-xl border border-[#1e2333] bg-[#0c0f18] p-5 min-h-[80px] flex items-start gap-3">
        {/* quote mark */}
        <span className="text-indigo-500 font-display text-3xl leading-none select-none mt-[-4px]">"</span>

        {loading ? (
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        ) : question ? (
          <p className="flex-1 text-slate-100 font-body text-base leading-relaxed fade-up">
            {question}
          </p>
        ) : (
          <p className="flex-1 text-slate-500 font-body text-sm italic">
            Select a role and click <span className="text-emerald-400 not-italic font-semibold">Generate Question</span> to begin.
          </p>
        )}
      </div>
    </div>
  )
}
