import { projects } from '../data/projects'
import { fetchMock, fetchMockById, fetchFromAPI } from './api'

export const projectService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/projects', projects);
    return items.map(p => {
      const years = (p.timeline || '').split('-');
      const startDate = years[0] ? `${years[0].trim()}-01-01` : '2026-01-01';
      const expectedCompletion = years[1] ? `${years[1].trim()}-12-31` : '2028-12-31';
      return {
        id: p.id,
        title: p.title,
        category: 'Renewable Energy',
        status: p.status,
        summary: p.description,
        location: 'Island-wide',
        startDate,
        expectedCompletion,
        progress: p.status === 'Completed' ? 100 : (p.status === 'Planning' ? 10 : 45),
        budget: '$5.0M',
        image: p.image || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
        milestones: [
          { title: 'Project commenced', date: startDate, completed: true },
          { title: 'Project conclusion', date: expectedCompletion, completed: p.status === 'Completed' }
        ],
        documents: [],
        gallery: []
      };
    });
  },
  getById: async (id) => {
    const all = await projectService.getAll();
    const item = all.find(p => String(p.id) === String(id));
    if (!item) throw new Error("Project not found");
    return item;
  },
  getFeatured: async () => {
    const all = await projectService.getAll();
    return all.filter((p) => p.progress < 100).slice(0, 3);
  },
}
