/* Concept case studies (Landed, SpotFinder, PrepPilot, SplitNest, Pause).
 * These are SELF-INITIATED CONCEPTS. No user research has been run, so:
 *  - personas are labelled proto-personas (assumptions),
 *  - "research" is a PLAN (methods, questions, assumptions to validate) — no findings,
 *  - "outcomes" describe what was produced and what was learned designing it — no metrics.
 * Edit the wording freely; keep those three rules. */

export type ConceptDetail = {
  id: string
  platform: string
  persona: { name: string; line: string; goals: string[]; frustrations: string[] }
  research: { methods: string[]; questions: string[]; assumptions: string[] }
  flow: string[]
  screens: { title: string; note: string }[]          // 3 screens, same order as the screen components
  decisions: { title: string; why: string }[]
  learnings: string[]
  next: string[]
}

export const CONCEPT_DETAILS: Record<string, ConceptDetail> = {
  landed: {
    id: 'landed',
    platform: 'Mobile app · iOS-style concept',
    persona: {
      name: 'Proto-persona: the first-week arrival',
      line: 'An international graduate student who has just landed in the US and has seven days before classes begin.',
      goals: ['Get an SSN appointment, a bank account, a phone plan and a transit card quickly', 'Know what documents to carry to each place', 'Feel in control instead of overwhelmed'],
      frustrations: ['Advice is scattered across emails, group chats and university pages', 'Unclear order — which step unlocks the next', 'Easy to make a wasted trip without the right document'],
    },
    research: {
      methods: ['5–6 semi-structured interviews with international students in their first semester', 'Review of university international-office checklists', 'Comparative review of banking and transit onboarding flows', 'Unmoderated test of the checklist prototype'],
      questions: ['Which first-week tasks cause the most stress, and why?', 'Where do students currently look for this information?', 'Does a fixed order of tasks help, or do people need flexibility?'],
      assumptions: ['A single ordered checklist reduces anxiety more than a list of links', 'Document checklists per task prevent wasted trips', 'A sense of progress ("stamps") motivates people to finish'],
    },
    flow: ['Arrive & open app', 'Set arrival date + city', 'Week-1 checklist', 'Open a task guide', 'Check required documents', 'Mark done → earn a stamp'],
    screens: [
      { title: 'Week-1 checklist', note: 'Tasks in a recommended order, with progress shown as passport stamps.' },
      { title: 'Task guide', note: 'One task at a time: steps, documents to bring, and where to go.' },
      { title: 'Passport', note: 'Every completed task becomes a stamp — a calm sense of progress.' },
    ],
    decisions: [
      { title: 'Progress as passport stamps', why: 'A familiar travel metaphor turns a stressful to-do list into something that feels like progress, not pressure.' },
      { title: 'One recommended order', why: 'Some tasks depend on others (e.g. an address or SSN before a bank account), so the app suggests a sequence instead of an unordered list.' },
      { title: '"Bring these documents" on every task', why: 'The costliest mistake in week one is arriving without the right paper; the checklist sits next to the directions.' },
    ],
    learnings: ['Designing for a stressful moment means removing choices, not adding features.', 'A metaphor (stamps) has to support the task — it stays small and never hides the next step.'],
    next: ['Run the interviews in the research plan before adding more tasks', 'Test whether the recommended order matches real dependencies in different cities'],
  },
  spotfinder: {
    id: 'spotfinder',
    platform: 'Mobile app · campus map concept',
    persona: {
      name: 'Proto-persona: the between-classes studier',
      line: 'A student with a 90-minute gap who wants a quiet seat with an outlet — now, not after walking three buildings.',
      goals: ['See which rooms are free right now', 'Filter by quiet, outlets and group size', 'Walk straight there'],
      frustrations: ['Walking from building to building to find a seat', 'Booking systems that show schedules, not real availability', 'Not knowing which rooms have outlets'],
    },
    research: {
      methods: ['Short intercept interviews in libraries and study halls', 'Diary of one week of "finding a seat" moments (3–5 students)', 'Review of existing campus room-booking tools', 'First-click test on the map and list views'],
      questions: ['How do students choose where to study today?', 'Which attributes matter most: noise, outlets, light, group size?', 'How fresh does availability need to be to be trusted?'],
      assumptions: ['Glanceable status (green/amber/red) is enough to decide', 'A map is faster than a list for nearby rooms', 'Students will trust availability that shows when it was last updated'],
    },
    flow: ['Open app', 'Map of nearby rooms', 'Filter: quiet · outlets · group', 'Pick a green room', 'Room details', 'Navigate there'],
    screens: [
      { title: 'Live map', note: 'Every room as a dot: green free, amber filling up, red full.' },
      { title: 'Room details', note: 'Status, last update, seats, outlets, noise level — then go.' },
      { title: 'List view', note: 'The same rooms sorted by distance, for one-handed scanning.' },
    ],
    decisions: [
      { title: 'Green / amber / red dots', why: 'Readable at a glance while walking; colour is always paired with a text label for accessibility.' },
      { title: '"Updated 2 min ago" on every room', why: 'Real-time claims need visible freshness so students can judge how much to trust them.' },
      { title: 'Map and list, same data', why: 'Maps help with "nearby", lists help with "best match" — one toggle switches without losing filters.' },
    ],
    learnings: ['Status colours need text labels and shapes too — colour alone fails for colour-blind users.', 'Showing data freshness is part of the design, not a technical detail.'],
    next: ['Validate which filters students actually use first', 'Explore where availability data could realistically come from (sensors, check-ins, bookings)'],
  },
  preppilot: {
    id: 'preppilot',
    platform: 'Web + mobile · AI practice concept',
    persona: {
      name: 'Proto-persona: the interview-season student',
      line: 'A computer-science student with technical interviews in three weeks and no one to practise with.',
      goals: ['Practise realistic questions on demand', 'Get specific feedback, not just a score', 'See improvement across sessions'],
      frustrations: ['Generic feedback like "be more confident"', 'Not knowing why an answer was weak', 'Mock interviews with friends are hard to schedule'],
    },
    research: {
      methods: ['Interviews with students preparing for technical interviews', 'Review of existing mock-interview and AI-coaching tools', 'Trust test: compare feedback with and without explanations'],
      questions: ['What makes interview feedback feel useful and fair?', 'When would students disagree with an AI score?', 'Which interview types are hardest to practise alone?'],
      assumptions: ['Explaining WHY a score was given increases trust in AI feedback', 'Letting users disagree with or edit feedback keeps them engaged', 'Short, focused sessions are practised more often than full mock interviews'],
    },
    flow: ['Choose interview type', 'Answer a question (voice or text)', 'AI feedback with reasons', 'Disagree / edit a point', 'Retry the question', 'Track progress'],
    screens: [
      { title: 'Choose a session', note: 'Frontend, behavioural or system design — 10 to 20 minutes.' },
      { title: 'Live question', note: 'One question, a timer, and voice or text answers.' },
      { title: 'Feedback, explained', note: 'Each score shows why — and the student can disagree.' },
    ],
    decisions: [
      { title: 'Show WHY behind every score', why: 'AI feedback is only useful if it is understandable; each rating links to the part of the answer it refers to.' },
      { title: '"I disagree" on every point', why: 'Students stay in control of AI feedback; disagreements can be noted and used to improve the next round.' },
      { title: 'Short sessions by default', why: 'Lower effort to start means practice is more likely to become a habit.' },
    ],
    learnings: ['With AI features, explanation and control are part of the core UX, not extras.', 'Feedback needs to point at specific moments in an answer to be actionable.'],
    next: ['Test explained vs unexplained feedback for perceived trust', 'Define guardrails for what the AI should never score'],
  },
  splitnest: {
    id: 'splitnest',
    platform: 'Mobile app · shared-living concept',
    persona: {
      name: 'Proto-persona: the shared-apartment roommate',
      line: 'A student sharing an apartment with three roommates, a shared fridge and a group chat full of receipts.',
      goals: ['Know instantly who owes whom', 'Share one grocery list', 'Split costs fairly without arguments'],
      frustrations: ['Doing the maths in a group chat', 'Forgetting who paid last time', 'Awkward reminders to pay back'],
    },
    research: {
      methods: ['Interviews with students living with 2+ roommates', 'Review of expense-splitting and shared-list apps', 'Card sort of household tasks and costs'],
      questions: ['Where do disagreements about shared costs start?', 'Do roommates split everything equally or by item?', 'How do people prefer to be reminded about money?'],
      assumptions: ['Seeing balances first reduces the need to calculate', 'Combining the grocery list with expenses removes a step', 'Neutral, automatic reminders feel less awkward than personal messages'],
    },
    flow: ['Open home', '"Who owes what" summary', 'Shared grocery list', 'Add a receipt', 'Split equally or by item', 'Settle up'],
    screens: [
      { title: 'Who owes what', note: 'Balances on the first screen — no maths needed.' },
      { title: 'Shared list', note: 'One grocery list for the apartment, with who is buying what.' },
      { title: 'Add & split', note: 'Add a receipt and split it equally or by item.' },
    ],
    decisions: [
      { title: 'Balances first', why: 'The question people open the app with is "do I owe anything?" — so the answer is the first thing on screen.' },
      { title: 'List and expenses together', why: 'Groceries bought from the shared list turn into a split expense in one step.' },
      { title: 'Neutral reminders', why: 'Reminders come from the app, in a friendly tone, so roommates don’t have to chase each other.' },
    ],
    learnings: ['Money between friends is emotional — tone of voice is part of the interface.', 'The first screen should answer the most common question, not show every feature.'],
    next: ['Test equal vs by-item splitting with real receipts', 'Explore how settle-up could connect to existing payment apps'],
  },
  pause: {
    id: 'pause',
    platform: 'Mobile app · digital-wellbeing concept',
    persona: {
      name: 'Proto-persona: the distracted studier',
      line: 'A student who sits down to study for two hours and loses forty minutes to scrolling — then feels bad about it.',
      goals: ['Stay focused for a set time', 'Take real breaks instead of scrolling', 'Build the habit without guilt'],
      frustrations: ['Blockers that feel like punishment', 'Guilt-based messages that make it worse', 'Breaks that turn into an hour on social media'],
    },
    research: {
      methods: ['Interviews about study habits and phone use', 'Review of focus timers and screen-time tools', 'Tone test: compare neutral vs guilt-based nudge wording'],
      questions: ['When does a break turn into scrolling?', 'Which nudges feel supportive and which feel judgemental?', 'What would make someone keep using a focus tool after week one?'],
      assumptions: ['Calm, non-judgemental language keeps people using the tool', 'Suggesting a specific break activity works better than just "take a break"', 'Showing streaks gently motivates without pressure'],
    },
    flow: ['Start a focus session', 'Focus timer', 'Gentle break nudge', 'Choose a break activity', 'Back to focus', 'Weekly calm summary'],
    screens: [
      { title: 'Focus session', note: 'A simple timer with a breathing ring — nothing else to tap.' },
      { title: 'Gentle nudge', note: '"Time for a 5-minute pause?" with real break ideas.' },
      { title: 'Calm summary', note: 'A week of focus and breaks, described kindly.' },
    ],
    decisions: [
      { title: 'No guilt-based messages', why: 'Shame makes people avoid the tool; every message is written to be kind and neutral.' },
      { title: 'Break ideas, not just a timer', why: 'Offering a specific short activity (stretch, water, walk) makes it easier not to reach for the phone.' },
      { title: 'Calm visuals', why: 'Soft colours, slow motion and lots of space make the app itself feel like a pause.' },
    ],
    learnings: ['Behaviour-change design depends heavily on tone of voice.', 'For wellbeing products, what you leave out (streak pressure, alarms) matters as much as what you add.'],
    next: ['Run the tone test from the research plan', 'Check accessibility of slow animations (respecting reduced motion)'],
  },
}
