import { PAGE_IMAGES } from '../constants/branding'

/** Default images when CMS/API items have no uploaded photo */
export const CONTENT_PLACEHOLDERS = {
  default: PAGE_IMAGES.solarFieldBermuda,
  project: PAGE_IMAGES.solarFieldBermuda,
  news: PAGE_IMAGES.solarFieldBermuda,
  consultation: PAGE_IMAGES.hamiltonStreet,
  installer: PAGE_IMAGES.solarWorkers,
  education: PAGE_IMAGES.educationOutreach,
  policy: PAGE_IMAGES.hamiltonStreet,
  bursary: PAGE_IMAGES.educationOutreach,
  progress: PAGE_IMAGES.gisHeatmap,
}

const PROJECT_CATEGORY_IMAGES = {
  'Community Solar': PAGE_IMAGES.bhcHousing,
  Solar: PAGE_IMAGES.solarFieldBermuda,
  Transport: PAGE_IMAGES.electricBuses,
  Efficiency: PAGE_IMAGES.balconySolar,
}

const NEWS_CATEGORY_IMAGES = {
  Policy: PAGE_IMAGES.hamiltonStreet,
  Solar: PAGE_IMAGES.solarFieldBermuda,
  Transport: PAGE_IMAGES.electricBuses,
  Innovation: PAGE_IMAGES.satellite,
  Community: PAGE_IMAGES.bhcHousing,
  Space: PAGE_IMAGES.satellite,
  Education: PAGE_IMAGES.educationOutreach,
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
