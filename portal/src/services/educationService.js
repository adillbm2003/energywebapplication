import { educationResources, educationCategories } from '../data/education'
import { fetchMock, fetchFromAPI } from './api'

export const educationService = {
  getAll: async () => {
    try {
      const res = await fetch('/api/education');
      if (!res.ok) throw new Error('API error');
      const items = await res.json();
      return items.map(item => {
        const isVideo = item.type === 'Video';
        const fileUrl = item.pdfLink || item.videoUrl || '#';
        return {
          id: item.id,
          title: item.title,
          category: item.category,
          type: isVideo ? 'Video' : 'Guide',
          description: item.description,
          image: isVideo ? 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&q=80' : 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
          [isVideo ? 'videoUrl' : 'downloadUrl']: fileUrl,
          fileSize: isVideo ? undefined : '1.5 MB',
          duration: isVideo ? '15 min' : undefined,
          relatedRoute: '#'
        };
      });
    } catch (err) {
      console.warn("Failed to fetch education resources, falling back:", err);
      return fetchMock(educationResources);
    }
  },
  getCategories: async () => {
    try {
      const res = await fetch('/api/education');
      if (!res.ok) throw new Error('API error');
      const items = await res.json();
      return [...new Set(items.map(item => item.category))];
    } catch (err) {
      return fetchMock(educationCategories);
    }
  },
}
