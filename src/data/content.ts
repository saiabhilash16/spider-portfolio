// All portfolio content lives here, separate from the 3D code.
// Edit text in this file — the scene and UI read from it.

export const profile = {
  name: 'SAI ABHILASH MANDAVA',
  headline: 'UI/UX Software Engineer · Design Engineer · AI',
  intro:
    'I design and build accessible, high-performance web experiences — from the first sketch to working code.',
  email: 'mandavasaiabhilash@gmail.com',
  linkedin: 'https://www.linkedin.com/in/abhilashm716/',
  github: 'https://github.com/saiabhilash16',
  resumeUrl: 'resume.pdf', // put the PDF at public/resume.pdf (WITHOUT the phone number). The button stays hidden until the file exists.
}

export const about =
  "I'm a UI/UX Software Engineer who loves the space where design meets code. I turn ideas into clean, accessible interfaces — from user research and Figma prototypes to responsive front-end builds and AI-powered features. I'm completing my M.S. in Information Systems at UMBC. When I'm not designing, I'm exploring trails and hidden places — which inspired my concept app, Butterfly."

export const skills: { group: string; items: string[] }[] = [
  { group: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'Angular', 'Tailwind', 'Chakra UI', 'MUI', 'Storybook'] },
  { group: 'UI/UX', items: ['Figma', 'FigJam', 'Adobe XD', 'Wireframing', 'Prototyping', 'Usability Testing', 'Design Systems'] },
  { group: 'Accessibility', items: ['WCAG 2.1 AA', 'ARIA', 'NVDA', 'VoiceOver', 'axe DevTools'] },
  { group: 'AI', items: ['Azure OpenAI', 'RAG interfaces', 'Claude Code', 'Cursor'] },
  { group: 'Backend & Cloud', items: ['Python', 'FastAPI', 'Django REST', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'] },
  { group: 'Testing & Tools', items: ['Jest', 'Playwright', 'PyTest', 'Git', 'GitHub Actions'] },
]

export type Project = {
  id: string
  index: string
  title: string
  tagline: string
  problem: string
  solution: string
  process: string[]
  tech: string[]
  result?: string
  accent: string
}

export const projects: Project[] = [
  {
    id: 'portal',
    index: '01',
    title: 'AI-Powered Enterprise Service Portal',
    tagline: 'AI document search and smart request routing for enterprise teams.',
    problem: 'Employees wasted time searching across scattered documents to find answers and route requests.',
    solution: 'A portal with AI-powered document search and smart request routing.',
    process: ['User journeys', 'Figma wireframes', 'Prototype testing', 'React + FastAPI build', 'Telemetry'],
    tech: ['React', 'TypeScript', 'FastAPI', 'Azure OpenAI', 'Chakra UI', 'Figma'],
    result: 'Search navigation efficiency +18%',
    accent: '#22D3EE',
  },
  {
    id: 'commerce',
    index: '02',
    title: 'E-Commerce Customer Experience Platform',
    tagline: 'A clearer checkout with real-time inventory and order tracking.',
    problem: 'A complicated checkout and poor visibility into orders.',
    solution: 'A multi-step checkout flow, real-time inventory, order tracking and notifications.',
    process: ['Checkout flow mapping', 'Figma prototypes', 'Responsive React components', 'Django REST integration'],
    tech: ['React', 'Django REST', 'PostgreSQL', 'AWS Amplify', 'Material UI'],
    accent: '#F59E0B',
  },
]

export type CaseStudy = {
  id: string
  title: string
  oneLiner: string
  problem: string
  solution: string
  decision: string
  flow?: string[]
  accent: string
  mood: string
}

// Conceptual work only — no invented research results.
export const caseStudies: CaseStudy[] = [
  {
    id: 'butterfly',
    title: 'Butterfly',
    oneLiner: 'Discover what others found along the way.',
    problem:
      'Reviews show the destination, not the hidden spots and practical tips found along the way — like the windy dune walk or an under-photographed trail.',
    solution: 'A local discovery app where explorers pin hidden spots with a photo, a short description and a quick tip.',
    decision: 'A required Quick Tip field — "What should people know before going?"',
    flow: ['Open app', 'Near You', 'Place details', 'Save + Directions', 'Add a discovery', 'Shared with others'],
    accent: '#3B82F6',
    mood: 'Blue morpho · nature journal',
  },
  {
    id: 'landed',
    title: 'Landed',
    oneLiner: 'A calm first week for international students.',
    problem: 'International students feel lost in their first week in the US — SSN, bank, phone, transit.',
    solution: 'A first-week checklist app with step-by-step local guides.',
    decision: 'Progress shown as "passport stamps" to reduce stress.',
    accent: '#FB923C',
    mood: 'Travel posters & stamps',
  },
  {
    id: 'spotfinder',
    title: 'SpotFinder',
    oneLiner: 'A free study space, at a glance.',
    problem: 'Students waste time searching for a free campus study space.',
    solution: 'A real-time map of free rooms with filters — quiet, outlets, group size.',
    decision: 'Green / amber / red availability dots, readable at a glance.',
    accent: '#34D399',
    mood: 'Clean Swiss map',
  },
  {
    id: 'preppilot',
    title: 'PrepPilot',
    oneLiner: 'AI interview practice you can trust.',
    problem: 'Students lack specific feedback before technical interviews.',
    solution: 'AI mock interviews with clear, editable feedback.',
    decision: 'Show WHY the AI gave each score, to build trust.',
    accent: '#A78BFA',
    mood: 'Dark sci-fi interface',
  },
  {
    id: 'splitnest',
    title: 'SplitNest',
    oneLiner: 'Roommates, groceries, no awkward math.',
    problem: 'Roommates argue over shared groceries and bills.',
    solution: 'A shared list and expense splitting in one place.',
    decision: '"Who owes what" summary on the first screen — no math needed.',
    accent: '#F9A8D4',
    mood: 'Soft pastel 3D',
  },
  {
    id: 'pause',
    title: 'Pause',
    oneLiner: 'Mindful breaks, without guilt.',
    problem: 'Students lose hours scrolling during study time.',
    solution: 'Gentle screen-break nudges with focus sessions.',
    decision: 'Calm visuals and no guilt-based messages.',
    accent: '#CBD5E1',
    mood: 'Calm minimal',
  },
]

export const caseStudyProcess = ['Problem framing', 'Proto-persona (assumptions)', 'User flow', 'Wireframes', 'High-fidelity UI', 'Prototype & usability test']

export const education = {
  degree: 'M.S. Information Systems',
  school: 'University of Maryland, Baltimore County (UMBC)',
  date: 'May 2026',
}
