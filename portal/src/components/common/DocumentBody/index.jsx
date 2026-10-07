// Renders a published document as web content rather than as an embedded file.
//
// An <object> pointing at a PDF hands the page over to the browser's own viewer,
// which arrives with its own dark toolbar, thumbnail rail and menus. That is the
// browser's interface, not the Department's, and it cannot be styled, searched
// by the site, linked to by section, or read sensibly on a phone. The document
// is therefore stored as blocks and typeset here; the PDF stays available to
// download for anyone who wants the original artefact.
//
// Section headings carry an id built from their number so the contents list can
// link straight to them.

import { sectionId } from '../../../utils/sectionId'


function Table({ block }) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-lg border border-slate-200 card-shadow">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead className="bg-navy-900 text-white">
            <tr>
              {block.headers.map((h) => (
                <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {block.rows.map((row, ri) => (
              <tr key={ri} className={row.strong ? 'bg-slate-50 font-semibold text-navy-900' : 'text-slate-600'}>
                {(row.cells || row).map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 align-top">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-caption italic text-slate-500">{block.caption}</figcaption>
      )}
    </figure>
  )
}

export default function DocumentBody({ blocks }) {
  return (
    <div className="max-w-none">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={i}
                id={sectionId(block.number)}
                className="mt-12 mb-4 scroll-mt-24 border-b border-slate-200 pb-2 text-2xl font-bold text-navy-900 first:mt-0"
              >
                {block.number ? `${block.number}. ` : ''}{block.text}
              </h2>
            )

          case 'h3':
            return (
              <h3 key={i} id={sectionId(block.number)} className="mt-8 mb-3 scroll-mt-24 text-lg font-bold text-navy-900">
                {block.number ? `${block.number} ` : ''}{block.text}
              </h3>
            )

          case 'h4':
            return (
              <h4 key={i} className="mt-6 mb-2 text-base font-semibold italic text-navy-800">
                {block.number ? `${block.number} ` : ''}{block.text}
              </h4>
            )

          case 'p':
            return <p key={i} className="mb-4 leading-relaxed text-slate-600">{block.text}</p>

          case 'ul':
            return (
              <ul key={i} className="mb-5 space-y-2">
                {block.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2.5 leading-relaxed text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                    <span>
                      {typeof item === 'string' ? item : (<><strong className="font-semibold text-navy-900">{item.term}</strong> {item.text}</>)}
                    </span>
                  </li>
                ))}
              </ul>
            )

          case 'ol':
            return (
              <ol key={i} className="mb-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-navy-900">
                {block.items.map((item, ii) => (
                  <li key={ii} className="pl-1 leading-relaxed text-slate-600">
                    {typeof item === 'string' ? item : (<><strong className="font-semibold text-navy-900">{item.term}</strong> {item.text}</>)}
                  </li>
                ))}
              </ol>
            )

          case 'dl':
            return (
              <dl key={i} className="mb-6 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {block.items.map((item, ii) => (
                  <div key={ii} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:gap-4">
                    <dt className="text-sm font-semibold text-navy-900">{item.term}</dt>
                    <dd className="text-sm leading-relaxed text-slate-600">{item.text}</dd>
                  </div>
                ))}
              </dl>
            )

          case 'table':
            return <Table key={i} block={block} />

          case 'note':
            return (
              <p key={i} className="my-6 rounded-lg border-l-4 border-gold-500 bg-amber-50 px-4 py-3 text-body-small leading-relaxed text-slate-700">
                {block.text}
              </p>
            )

          case 'figure-note':
            return <p key={i} className="mb-6 text-caption italic text-slate-500">{block.text}</p>

          default:
            return null
        }
      })}
    </div>
  )
}

