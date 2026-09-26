import { innovationTopics } from '../data/innovation'
import { fetchFromAPI } from './api'
import { PAGE_IMAGES } from '../constants/branding'

export const innovationService = {
  getAll: async () => {
    try {
      const items = await fetchFromAPI('/api/innovation', innovationTopics);
      
      // Titles come from the database, so this map is what gives each card its
      // picture. Three of them used to share gisHeatmap, which is why Advanced
      // Energy Analytics, Digital Twins and Artificial Intelligence all showed
      // the same solar-locations poster.
      const imageMap = {
        'Advanced Energy Analytics': PAGE_IMAGES.innovAnalytics,
        'Digital Twins': PAGE_IMAGES.innovDigitalTwins,
        'Demand Response': PAGE_IMAGES.innovDemandResponse,
        'Virtual Power Plants': PAGE_IMAGES.innovVpp,
        'Distributed Energy Resources': PAGE_IMAGES.innovDer,
        'Artificial Intelligence': PAGE_IMAGES.innovAi,
        'Battery Energy Storage': PAGE_IMAGES.innovBattery,
        'Digital Currency & Energy': PAGE_IMAGES.innovDigitalCurrency,
        'Smart Grids': PAGE_IMAGES.innovSmartGrids,
        'Blockchain & Energy Systems': PAGE_IMAGES.satellite
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
