import Button from '../../ui/Button'

import SafeImage from '../../common/SafeImage'

import { ROUTES } from '../../../constants/routes'

import { isExternalUrl } from '../../../utils/mockDownload'

import { resolveContentImage } from '../../../utils/contentImages'



export default function InstallerCard({ installer }) {

  const hasWebsite = isExternalUrl(installer.website)



  return (

    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:border-teal-200 hover:card-shadow-hover">

      <div className="aspect-[16/9] overflow-hidden">
        <SafeImage
          src={resolveContentImage(installer.image, 'installer')}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="card-padding">

      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-navy-800 text-base font-bold text-white" aria-hidden="true">

        {installer.name.charAt(0)}

      </div>

      <h3>{installer.name}</h3>

      <p className="mt-0.5 text-body-small text-slate-500">{installer.parish}</p>

      {installer.description && (

        <p className="mt-2 text-body-small text-slate-600">{installer.description}</p>

      )}

      <div className="mt-2 flex flex-wrap gap-1.5">

        {installer.certifications.map((cert) => (

          <span key={cert} className="rounded-full bg-teal-50 px-2 py-0.5 text-caption font-medium text-teal-700">

            {cert}

          </span>

        ))}

      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-body-small text-slate-600">

        <span>{installer.projects} installations</span>

        <span className="font-semibold text-gold-600">★ {installer.rating}</span>

      </div>

      <div className="mt-3 flex flex-wrap gap-2">

        {hasWebsite ? (

          <Button href={installer.website} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">

            Visit Website

          </Button>

        ) : null}

        <Button

          to={`${ROUTES.contact}?enquiry=installer&company=${encodeURIComponent(installer.name)}`}

          variant={hasWebsite ? 'ghost' : 'outline'}

          size="sm"

        >

          Request Quote

        </Button>

      </div>

      </div>

    </article>

  )

}

