import { innovationTopics, digitalCurrencyPlaceholder } from '../data/innovation'
import { fetchFromAPI, fetchMock } from './api'

export const innovationService = {
  getTopics: async () => {
    const items = await fetchFromAPI('/api/spaceContent?category=innovation', innovationTopics)
    if (!Array.isArray(items) || items.length === 0) return fetchMock(innovationTopics)
    return items.map(item => ({
      title: item.title,
      description: item.description || item.summary,
      status: item.status || 'Active',
      image: item.image,
      linkTo: item.linkTo || item.pdf_link,
      linkLabel: item.linkLabel || 'Learn more',
    }))
  },
  getDigitalCurrency: () => fetchMock(digitalCurrencyPlaceholder),
}
