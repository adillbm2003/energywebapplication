import SafeImage from '../../common/SafeImage'
import { cn } from '../../../utils/cn'

export default function DashboardPanelImage({ src, alt = '', className }) {
  return (
    <div className={cn('overflow-hidden rounded-t-xl border-b border-slate-100', className)}>
      <SafeImage src={src} alt={alt} className="h-28 w-full object-cover" />
    </div>
  )
}
