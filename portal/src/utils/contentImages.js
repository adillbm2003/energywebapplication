import { PAGE_IMAGES } from '../constants/branding'

/** Default images when CMS/API items have no uploaded photo */
export const CONTENT_PLACEHOLDERS = {
  default: PAGE_IMAGES.solar,
  project: PAGE_IMAGES.solar,
  news: PAGE_IMAGES.energy,
  consultation: PAGE_IMAGES.consultation,
  installer: PAGE_IMAGES.solar,
  education: PAGE_IMAGES.education,
  policy: PAGE_IMAGES.policy,
  bursary: PAGE_IMAGES.education,
  progress: PAGE_IMAGES.analytics,
}

const PROJECT_CATEGORY_IMAGES = {
  'Community Solar': PAGE_IMAGES.solar,
  Solar: PAGE_IMAGES.solar,
  Transport: PAGE_IMAGES.transport,
  Efficiency: PAGE_IMAGES.efficiency,
}

const NEWS_CATEGORY_IMAGES = {
  Policy: PAGE_IMAGES.policy,
  Solar: PAGE_IMAGES.solar,
  Transport: PAGE_IMAGES.transport,
  Innovation: PAGE_IMAGES.innovation,
  Community: PAGE_IMAGES.solar,
}

/** Resolve image URL for CMS content — uses upload when present, otherwise topic placeholder */
export function resolveContentImage(src, type = 'default') {
  if (src) return src
  return CONTENT_PLACEHOLDERS[type] ?? CONTENT_PLACEHOLDERS.default
}

export function resolveProjectImage(project) {
  if (project?.image) return project.image
  return PROJECT_CATEGORY_IMAGES[project?.category] ?? CONTENT_PLACEHOLDERS.project
}

export function resolveNewsImage(article) {
  if (article?.image) return article.image
  return NEWS_CATEGORY_IMAGES[article?.category] ?? CONTENT_PLACEHOLDERS.news
}
