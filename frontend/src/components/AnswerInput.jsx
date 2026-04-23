// AnswerInput.jsx — text and voice answer input

export default function AnswerInput({
  value,
  onChange,
  onAnalyze,
  onAnalyzeAudio,
  loading,
  disabled,
  recording,
  onStartRecording,
  onStopRecording,
  audioReady,
  onAudioFileChange,
}) {
  const charCount = value.length
  const tooShort  = charCount < 30

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="answer-box"
          className="text-xs uppercase tracking-widest font-display font-600 text-rose-400"
        >
          Your Answer
        </label>
        <span className={`text-xs font-body ${tooShort ? 'text-slate-600' : 'text-emerald-500'}`}>
          {charCount} chars
        </span>
      </div>

      <textarea
        id="answer-box"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || loading}
        placeholder="Type your answer here… be as detailed or concise as you'd like."
        rows={6}
        className="w-full resize-none rounded-xl px-4 py-3.5
                   bg-[#0f1219] border border-[#1e2333]
                   text-slate-100 font-body text-sm leading-relaxed
                   placeholder:text-slate-600
                   transition-all duration-200 hover:border-rose-500/30
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <button
        onClick={onAnalyze}
        disabled={loading || disabled || tooShort}
        className="mt-1 w-full rounded-xl py-3.5 font-display font-700 text-sm
                   uppercase tracking-widest
                   bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500
                   text-white shadow-lg shadow-rose-900/40
                   transition-all duration-200
                   hover:shadow-rose-700/50 hover:scale-[1.01]
                   active:scale-[0.99]
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-white" />
            <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-white" style={{animationDelay:'.2s'}} />
            <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-white" style={{animationDelay:'.4s'}} />
            Analyzing…
          </span>
        ) : (
          'Analyze Answer'
        )}
      </button>

      <div className="mt-2 rounded-xl border border-[#1e2333] bg-[#0c0f18] p-4 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-widest font-display font-600 text-indigo-400">
          Voice Mode
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={recording ? onStopRecording : onStartRecording}
            disabled={loading || disabled}
            className={`flex-1 rounded-lg py-2.5 text-xs font-display font-700 uppercase tracking-widest
                       transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                       ${recording
                         ? 'bg-rose-600 text-white hover:bg-rose-500'
                         : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
          >
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-body text-slate-400">
            Or upload audio (webm, mp3, wav, m4a)
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={onAudioFileChange}
            disabled={loading || disabled || recording}
            className="text-xs font-body text-slate-300 file:mr-3 file:rounded-md file:border-0
                       file:bg-[#1e2333] file:px-3 file:py-2 file:text-slate-200 hover:file:bg-[#2a3044]
                       disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={onAnalyzeAudio}
          disabled={loading || disabled || !audioReady}
          className="w-full rounded-xl py-3 font-display font-700 text-xs uppercase tracking-widest
                     bg-gradient-to-r from-indigo-500 to-violet-500 text-white
                     transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
        >
          Analyze Voice Answer
        </button>

        {!audioReady && (
          <p className="text-xs text-slate-500 font-body">
            Record or upload audio, then click Analyze Voice Answer.
          </p>
        )}
      </div>

      {tooShort && value.length > 0 && (
        <p className="text-xs text-slate-500 font-body">Write at least 30 characters for meaningful feedback.</p>
      )}
    </div>
  )
}
