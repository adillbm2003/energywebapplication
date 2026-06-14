export default function BursaryCard({ recipient }) {

  return (

    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">

      {recipient.image ? (
        <img src={recipient.image} alt="" className="h-40 w-full object-cover object-top" loading="lazy" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-navy-800 to-teal-700 text-2xl font-bold text-white" aria-hidden="true">
          {recipient.name.split(' ').map((n) => n[0]).join('')}
        </div>
      )}

      <div className="card-padding">

      <h3>{recipient.name}</h3>

      <p className="mt-0.5 text-body-small text-teal-700">{recipient.field}</p>

      {recipient.quote && (

        <blockquote className="mt-2 border-l-2 border-gold-400 pl-3 text-body-small text-slate-600">

          &ldquo;{recipient.quote}&rdquo;

        </blockquote>

      )}

      <dl className="mt-2 space-y-1 text-body-small text-slate-600">

        <div className="flex justify-between gap-2">

          <dt>Institution</dt>

          <dd className="text-right font-semibold text-slate-800">{recipient.institution}</dd>

        </div>

        <div className="flex justify-between">

          <dt>Year</dt>

          <dd>{recipient.year}</dd>

        </div>

        <div className="flex justify-between">

          <dt>Parish</dt>

          <dd>{recipient.parish}</dd>

        </div>

      </dl>

      </div>

    </article>

  )

}

