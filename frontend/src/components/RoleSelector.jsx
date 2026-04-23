// RoleSelector.jsx — job-role dropdown

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'HR Manager',
  'Business Analyst',
  'Marketing Manager',
  'Financial Analyst',
  'Project Manager',
]

export default function RoleSelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="role-select"
        className="text-xs uppercase tracking-widest font-display font-600 text-emerald-400"
      >
        Job Role
      </label>
      <div className="relative">
        <select
          id="role-select"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl px-4 py-3.5
                     bg-[#0f1219] border border-[#1e2333]
                     text-slate-100 font-body text-sm
                     cursor-pointer transition-all duration-200
                     hover:border-emerald-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {/* custom chevron */}
        <svg
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  )
}
