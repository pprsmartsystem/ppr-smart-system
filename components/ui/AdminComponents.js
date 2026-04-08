'use client';

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ icon: Icon, title, subtitle, color = 'from-indigo-500 to-purple-600', action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ── StatBadge ─────────────────────────────────────────────────────────────────
export function StatBadge({ label, value, color = 'bg-indigo-50 text-indigo-700' }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${color}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

// ── AdminTable ────────────────────────────────────────────────────────────────
export function AdminTable({ headers, children, empty = 'No data found' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {headers.map((h, i) => (
                <th key={i} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === headers.length - 1 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {children}
          </tbody>
        </table>
      </div>
      {!children || (Array.isArray(children) && children.length === 0) ? (
        <div className="text-center py-12 text-gray-400 text-sm">{empty}</div>
      ) : null}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    approved:  'bg-green-50 text-green-700 ring-1 ring-green-200',
    active:    'bg-green-50 text-green-700 ring-1 ring-green-200',
    completed: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    processed: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    open:      'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    rejected:  'bg-red-50 text-red-600 ring-1 ring-red-200',
    failed:    'bg-red-50 text-red-600 ring-1 ring-red-200',
    blocked:   'bg-red-50 text-red-600 ring-1 ring-red-200',
    frozen:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    replied:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    closed:    'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
    rekyc:     'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    inactive:  'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ── AdminModal ────────────────────────────────────────────────────────────────
export function AdminModal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── ActionBtn ─────────────────────────────────────────────────────────────────
export function ActionBtn({ icon: Icon, onClick, color = 'text-gray-500 hover:bg-gray-100', title }) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded-lg transition-colors ${color}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}
