export const POLICY_STATUSES = [
  'In Development',
  'Open For Consultation',
  'Consultation Closed',
  'Under Review',
  'Approved',
  'Published',
  'Tabled',
  'Passed',
  'In Force',
  'Implementation in Progress',
  'Completed',
  'Superseded',
]

export const CONSULTATION_STATUSES = ['active', 'upcoming', 'completed']

export const STATUS_COLORS = {
  'In Development': 'bg-slate-100 text-slate-700',
  'Open For Consultation': 'bg-teal-100 text-teal-800',
  'Consultation Closed': 'bg-amber-100 text-amber-800',
  'Under Review': 'bg-blue-100 text-blue-800',
  Approved: 'bg-emerald-100 text-emerald-800',
  Published: 'bg-emerald-100 text-emerald-800',
  Tabled: 'bg-indigo-100 text-indigo-800',
  Passed: 'bg-emerald-100 text-emerald-800',
  'In Force': 'bg-navy-100 text-navy-800',
  'Implementation in Progress': 'bg-teal-100 text-teal-800',
  Completed: 'bg-slate-200 text-slate-800',
  Superseded: 'bg-slate-100 text-slate-500',
  active: 'bg-teal-100 text-teal-800',
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-slate-200 text-slate-700',
}

export const STATUS_PROGRESS = {
  'In Development': 15,
  'Open For Consultation': 30,
  'Consultation Closed': 45,
  'Under Review': 55,
  Approved: 70,
  Published: 80,
  Tabled: 75,
  Passed: 85,
  'In Force': 95,
  'Implementation in Progress': 85,
  Completed: 100,
  Superseded: 100,
}
