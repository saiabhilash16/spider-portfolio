import { projects, skills } from './content'

/* WORLD C — the skill universe.
 * SOURCE: `skills` in content.ts (taken from the resume). Nothing is added here — every item is
 * placed into one of the eight display categories below. No percentages, no proficiency levels.
 * PROVISIONAL: to be reviewed before publishing. */

export type SkillCategory = { id: string; name: string; color: string; items: { name: string; group?: string; usedIn: { title: string; href: string }[] }[] }

const CATEGORY_OF: Record<string, string> = {
  JavaScript: 'lang', TypeScript: 'lang', Python: 'lang',
  React: 'fe', Angular: 'fe', Tailwind: 'fe', 'Chakra UI': 'fe', MUI: 'fe', Storybook: 'fe',
  FastAPI: 'be', 'Django REST': 'be', 'Node.js': 'be',
  PostgreSQL: 'db',
  AWS: 'cloud', Docker: 'cloud', 'GitHub Actions': 'cloud',
  'Azure OpenAI': 'ai', 'RAG interfaces': 'ai', 'Claude Code': 'ai', Cursor: 'ai',
  Figma: 'ux', FigJam: 'ux', 'Adobe XD': 'ux', Wireframing: 'ux', Prototyping: 'ux', 'Usability Testing': 'ux', 'Design Systems': 'ux',
  'WCAG 2.1 AA': 'ux', ARIA: 'ux', NVDA: 'ux', VoiceOver: 'ux', 'axe DevTools': 'ux',
  Git: 'tools', Jest: 'tools', Playwright: 'tools', PyTest: 'tools',
}
const CATEGORIES = [
  { id: 'lang', name: 'Programming Languages', color: '#ffd166' },
  { id: 'fe', name: 'Frontend Development', color: '#22d3ee' },
  { id: 'be', name: 'Backend Development', color: '#a78bfa' },
  { id: 'db', name: 'Databases', color: '#34d399' },
  { id: 'cloud', name: 'Cloud & DevOps', color: '#60a5fa' },
  { id: 'ai', name: 'AI & Integrations', color: '#f472b6' },
  { id: 'ux', name: 'UI/UX Design', color: '#fb923c' },
  { id: 'tools', name: 'Tools & Collaboration', color: '#e2e8f0' },
]
/** how a skill name appears in a project's tech list */
const ALIAS: Record<string, string[]> = { MUI: ['Material UI'], AWS: ['AWS Amplify'] }

export const SKILL_UNIVERSE: SkillCategory[] = CATEGORIES.map((c) => ({ ...c, items: [] }))
for (const g of skills) for (const name of g.items) {
  const cat = SKILL_UNIVERSE.find((c) => c.id === CATEGORY_OF[name]) ?? SKILL_UNIVERSE[SKILL_UNIVERSE.length - 1]
  const names = [name, ...(ALIAS[name] ?? [])]
  cat.items.push({
    name,
    group: g.group === 'Accessibility' ? 'Accessibility' : undefined,
    usedIn: projects.filter((p) => p.tech.some((t) => names.includes(t))).map((p) => ({ title: p.title, href: `#/project/${p.id}` })),
  })
}
