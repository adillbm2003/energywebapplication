import Badge from '../../ui/Badge'

import Button from '../../ui/Button'

import SafeImage from '../../common/SafeImage'

import { formatDate } from '../../../utils/format'

import { isExternalUrl } from '../../../utils/mockDownload'

import { resolveContentImage } from '../../../utils/contentImages'



export default function PolicyCard({ policy }) {

  const hasRealFile = policy.downloadUrl && policy.downloadUrl !== '#' && !policy.downloadUrl.startsWith('blob:')
  const external = isExternalUrl(policy.downloadUrl)

  // A policy with nothing attached is not a published document. It used to
  // render its full text under a "Download PDF" button that built a PDF out of
  // that same text -- a document the Department never wrote. An entry in that
  // state now shows as a placeholder: the image, the category and the title,
  // and nothing claiming to be the policy itself.
  const comingSoon = !external && !hasRealFile



  return (

    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow transition-shadow hover:card-shadow-hover">

      <div className="aspect-[16/9] overflow-hidden">
        <SafeImage
          src={resolveContentImage(policy.image, 'policy')}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col card-padding">

      <div className="mb-2 flex flex-wrap items-center gap-2">

        <Badge variant="gold">{policy.category}</Badge>

        <Badge status={comingSoon ? 'Coming Soon' : policy.status}>{comingSoon ? 'Coming Soon' : policy.status}</Badge>

      </div>

      <h3 className="mb-1.5">{policy.title}</h3>

      {!comingSoon && (

        <>

      <p className="mb-3 flex-1 text-body-small text-slate-600">{policy.summary}</p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">

        <div className="text-caption text-slate-500">

          <span>{formatDate(policy.publishedAt)}</span>

          {policy.fileSize && <span className="ml-2">· {policy.fileSize}</span>}

        </div>

        <Button href={policy.downloadUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer" aria-label={`Open ${policy.title}`}>

          View

        </Button>

      </div>

        </>

      )}

      </div>

    </article>

  )

}

