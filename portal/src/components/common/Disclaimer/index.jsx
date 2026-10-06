// The Department supplies a disclaimer with each sector page, in its own
// wording per sector. The component carries only the presentation so the text
// stays with the page it belongs to, and so a reader can tell a disclaimer from
// the body copy at a glance rather than reading it as another paragraph.
export default function Disclaimer({ children, className = '' }) {
  return (
    <aside
      className={`rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-caption leading-relaxed text-slate-500 ${className}`}
    >
      <span className="font-semibold text-slate-600">Disclaimer:</span> {children}
    </aside>
  )
}
