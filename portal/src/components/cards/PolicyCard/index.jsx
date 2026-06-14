import Badge from '../../ui/Badge'

import Button from '../../ui/Button'

import SafeImage from '../../common/SafeImage'

import { formatDate } from '../../../utils/format'

import { downloadMockDocument, isExternalUrl } from '../../../utils/mockDownload'

import { resolveContentImage } from '../../../utils/contentImages'



export default function PolicyCard({ policy }) {

  const external = isExternalUrl(policy.downloadUrl)



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

        <Badge status={policy.status}>{policy.status}</Badge>

      </div>

      <h3 className="mb-1.5">{policy.title}</h3>

      <p className="mb-3 flex-1 text-body-small text-slate-600">{policy.summary}</p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">

        <div className="text-caption text-slate-500">

          <span>{formatDate(policy.publishedAt)}</span>

          {policy.fileSize && <span className="ml-2">· {policy.fileSize}</span>}

        </div>

        {external ? (

          <Button href={policy.downloadUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer" aria-label={`Open ${policy.title}`}>

            View

          </Button>

        ) : (

          <Button

            variant="outline"

            size="sm"

            aria-label={`Download ${policy.title}`}

            onClick={() => downloadMockDocument({ title: policy.title, summary: policy.summary, category: policy.category })}

          >

            Download

          </Button>

        )}

      </div>

      </div>

    </article>

  )

}

