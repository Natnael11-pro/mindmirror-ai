// src/data/resources.ts

export interface Resource {
  category: string;
  title: string;
  description: string;
  url?: string;
  type: 'youtube' | 'book' | 'app' | 'article' | 'tool' | 'podcast';
}

export const resources: Resource[] = [
  {
    category: 'productivity',
    title: 'Thomas Frank',
    description: 'Excellent for productivity systems, time management, and study tips',
    url: 'https://youtube.com/c/ThomasFrank',  // ✅ Clean URL
    type: 'youtube'
  },
  {
    category: 'productivity',
    title: 'Ali Abdaal',
    description: 'Evidence-based productivity and work-life balance strategies',
    url: 'https://youtube.com/c/AliAbdaal',  // ✅ Clean URL
    type: 'youtube'
  },
  {
    category: 'productivity',
    title: 'Productivity Game',
    description: 'Visual explanations of productivity methods and planning systems',
    url: 'https://youtube.com/c/ProductivityGame',
    type: 'youtube'
  },
  {
    category: 'productivity',
    title: 'Notion',
    description: 'All-in-one workspace for notes, tasks, and project management',
    url: 'https://notion.so',
    type: 'tool'
  },
  {
    category: 'productivity',
    title: 'Todoist',
    description: 'Simple yet powerful task management app',
    url: 'https://todoist.com',
    type: 'app'
  },
  
  // Mental Health & Mindfulness
  {
    category: 'mental-health',
    title: 'Therapy in a Nutshell',
    description: 'Practical mental health skills and coping strategies',
    url: 'https://youtube.com/c/TherapyinaNutshell',
    type: 'youtube'
  },
  {
    category: 'mental-health',
    title: 'Headspace',
    description: 'Guided meditation and mindfulness exercises',
    url: 'https://headspace.com',
    type: 'app'
  },
  {
    category: 'mental-health',
    title: 'Calm',
    description: 'Meditation, sleep stories, and relaxation',
    url: 'https://calm.com',
    type: 'app'
  },
  {
    category: 'mental-health',
    title: 'The Happiness Lab Podcast',
    description: 'Science-based insights on what really makes us happy',
    url: 'https://thehappinesslab.com',
    type: 'podcast'
  },
  
  // Learning & Growth
  {
    category: 'learning',
    title: 'Coursera',
    description: 'Online courses from top universities',
    url: 'https://coursera.org',
    type: 'tool'
  },
  {
    category: 'learning',
    title: 'Khan Academy',
    description: 'Free educational resources on countless topics',
    url: 'https://khanacademy.org',
    type: 'tool'
  },
  {
    category: 'learning',
    title: 'Farnam Street Blog',
    description: 'Mental models and decision-making frameworks',
    url: 'https://fs.blog',
    type: 'article'
  },
  
  // Career & Professional Development
  {
    category: 'career',
    title: 'The Tim Ferriss Show',
    description: 'Interviews with world-class performers on their routines and strategies',
    url: 'https://tim.blog/podcast/',
    type: 'podcast'
  },
  {
    category: 'career',
    title: 'LinkedIn Learning',
    description: 'Professional skills courses and career development',
    url: 'https://linkedin.com/learning',
    type: 'tool'
  },
  
  // Relationships & Communication
  {
    category: 'relationships',
    title: 'Esther Perel',
    description: 'Insights on relationships, desire, and human connection',
    url: 'https://estherperel.com',
    type: 'youtube'
  },
  {
    category: 'relationships',
    title: 'Where Should We Begin? Podcast',
    description: 'Real therapy sessions with Esther Perel',
    url: 'https://estherperel.com/podcast/',
    type: 'podcast'
  }
];

// Helper function to find relevant resources
export function findResources(query: string): Resource[] {
  const lowerQuery = query.toLowerCase();
  
  // Check for specific resource types
  if (lowerQuery.includes('youtube') || lowerQuery.includes('video') || lowerQuery.includes('channel')) {
    return resources.filter(r => r.type === 'youtube');
  }
  
  if (lowerQuery.includes('app') || lowerQuery.includes('application')) {
    return resources.filter(r => r.type === 'app');
  }
  
  if (lowerQuery.includes('podcast')) {
    return resources.filter(r => r.type === 'podcast');
  }
  
  if (lowerQuery.includes('book') || lowerQuery.includes('read')) {
    return resources.filter(r => r.type === 'book');
  }
  
  // Check for categories
  if (lowerQuery.includes('productivity') || lowerQuery.includes('work') || lowerQuery.includes('management') || lowerQuery.includes('time') || lowerQuery.includes('organize')) {
    return resources.filter(r => r.category === 'productivity');
  }
  
  if (lowerQuery.includes('mental health') || lowerQuery.includes('anxiety') || lowerQuery.includes('stress') || lowerQuery.includes('meditation') || lowerQuery.includes('mindfulness')) {
    return resources.filter(r => r.category === 'mental-health');
  }
  
  if (lowerQuery.includes('learn') || lowerQuery.includes('course') || lowerQuery.includes('study') || lowerQuery.includes('education')) {
    return resources.filter(r => r.category === 'learning');
  }
  
  if (lowerQuery.includes('career') || lowerQuery.includes('job') || lowerQuery.includes('professional') || lowerQuery.includes('work')) {
    return resources.filter(r => r.category === 'career');
  }
  
  if (lowerQuery.includes('relationship') || lowerQuery.includes('communication') || lowerQuery.includes('partner')) {
    return resources.filter(r => r.category === 'relationships');
  }
  
  return [];
}

// Get top recommendations
export function getTopRecommendations(query: string, limit: number = 3): Resource[] {
  const relevant = findResources(query);
  return relevant.slice(0, limit);
}