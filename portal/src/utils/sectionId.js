// Anchor id for a numbered document section, so a contents list can link to it.
// Lives apart from the renderer because a component file that also exports a
// helper breaks fast refresh.
export const sectionId = (number) => `section-${String(number).replace(/\./g, '-')}`
