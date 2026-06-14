import { innovationTopics } from '../data/innovation'
import { fetchFromAPI } from './api'
import { PAGE_IMAGES } from '../constants/branding'

export const innovationService = {
  getAll: async () => {
    try {
      const items = await fetchFromAPI('/api/innovation', innovationTopics);
      
      const imageMap = {
        'Smart Grids': PAGE_IMAGES.grid,
        'Battery Energy Storage': PAGE_IMAGES.wind,
        'Artificial Intelligence': PAGE_IMAGES.analytics,
        'Distributed Energy Resources': PAGE_IMAGES.solar,
        'Virtual Power Plants': PAGE_IMAGES.efficiency,
        'Demand Response': PAGE_IMAGES.grid,
        'Digital Twins': PAGE_IMAGES.innovation,
        'Advanced Energy Analytics': PAGE_IMAGES.analytics,
        'Blockchain & Energy Systems': PAGE_IMAGES.blockchain
      };

      return items.map(item => {
        const image = imageMap[item.title] || PAGE_IMAGES.innovation;
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          image: image,
          linkTo: item.linkTo || item.link_to,
          linkLabel: item.linkLabel || item.link_label
        };
      });
    } catch (err) {
      console.warn("Failed to fetch innovation topics, falling back:", err);
      return innovationTopics;
    }
  }
}
