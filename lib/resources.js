// Describes each CRUD resource so the admin can render list + form generically.
// field types: text, textarea, number, checkbox, image, tags, select
module.exports = {
  projects: {
    label: 'Projects',
    singular: 'Project',
    icon: '🗂️',
    listColumns: ['title', 'category', 'year', 'featured'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        optionsFrom: 'services', // pull option labels from services titles
      },
      { name: 'client', label: 'Client', type: 'text' },
      { name: 'year', label: 'Year', type: 'text' },
      {
        name: 'engagement',
        label: 'Engagement note',
        type: 'text',
        hint: 'e.g. "Top 3 highest engagement"',
      },
      { name: 'featured', label: 'Show as featured', type: 'checkbox' },
      { name: 'cover', label: 'Cover image', type: 'image' },
      { name: 'gallery', label: 'Gallery images', type: 'gallery' },
      {
        name: 'tags',
        label: 'Tags',
        type: 'tags',
        hint: 'Comma separated, e.g. Instagram, Reels, Branding',
      },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'link', label: 'External link', type: 'text' },
    ],
  },
  services: {
    label: 'Creative Spaces',
    singular: 'Creative Space',
    icon: '✨',
    listColumns: ['title', 'summary'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'summary', label: 'Short summary', type: 'textarea' },
      { name: 'detail', label: 'Detail (shown on click)', type: 'textarea' },
      {
        name: 'icon',
        label: 'Icon',
        type: 'select',
        options: ['megaphone', 'grid', 'palette', 'pen', 'camera', 'spark'],
      },
    ],
  },
  videos: {
    label: 'Videos',
    singular: 'Video',
    icon: '🎬',
    listColumns: ['title', 'youtubeUrl'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      {
        name: 'youtubeUrl',
        label: 'YouTube link',
        type: 'text',
        required: true,
        hint: 'Paste any YouTube URL, e.g. https://youtu.be/KX2mxc885VI',
      },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  experiences: {
    label: 'Experience',
    singular: 'Experience',
    icon: '💼',
    listColumns: ['role', 'company', 'period'],
    fields: [
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'period', label: 'Period', type: 'text', hint: 'e.g. Nov 2024 – Present' },
    ],
  },
  tools: {
    label: 'Tools',
    singular: 'Tool',
    icon: '🛠️',
    listColumns: ['name', 'description'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
};
