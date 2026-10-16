// SAMPLE CONTENT for the Butterfly concept. Places, people, ratings and reviews are
// fictional and exist only to demonstrate the design — they are not research data.

export type SceneKind = 'ridge' | 'sunset' | 'dunes' | 'coast' | 'forest' | 'cafe' | 'harbor'
export type Category = 'Food' | 'Coffee' | 'Hiking' | 'Nature' | 'Scenic'

export type Place = {
  id: string
  name: string
  categories: Category[]
  rating: number
  reviews: number
  miles: number
  scene: SceneKind
  hidden: boolean          // community discovery → Hidden Gem badge
  by?: string              // discovered by
  description: string
  tip: string
  map: { x: number; y: number } // position on the concept map (0–1000 × 0–700)
}

export const PLACES: Place[] = [
  { id: 'ridge', name: 'Hidden Ridge Viewpoint', categories: ['Scenic', 'Hiking'], rating: 4.8, reviews: 36, miles: 1.2, scene: 'ridge', hidden: true, by: 'maya.walks',
    description: 'A rocky ledge halfway up the trail with a wide view across the valley. Most hikers walk right past it.',
    tip: 'Take the narrow path on the left right after the second wooden bridge.', map: { x: 640, y: 210 } },
  { id: 'sunset', name: 'Sunset Rock', categories: ['Scenic'], rating: 4.9, reviews: 52, miles: 2.4, scene: 'sunset', hidden: true, by: 'sai',
    description: 'Small viewpoint halfway through the trail with an amazing sunset view.',
    tip: 'Visit around 6 PM for the best view.', map: { x: 770, y: 330 } },
  { id: 'fern', name: 'Little Fern Café', categories: ['Coffee'], rating: 4.7, reviews: 18, miles: 0.6, scene: 'cafe', hidden: true, by: 'leo.k',
    description: 'A tiny café with a reading nook and house-roasted beans. Easy to miss — the door is down three steps.',
    tip: 'Ask for the cardamom latte. Seats by the window fill up after 10 AM.', map: { x: 330, y: 420 } },
  { id: 'dunes', name: 'Windward Dune Walk', categories: ['Nature', 'Hiking'], rating: 4.6, reviews: 41, miles: 3.1, scene: 'dunes', hidden: true, by: 'sai',
    description: 'The walk to the beach feels like crossing a desert — the views along the way are better than the beach itself.',
    tip: 'Bring sunglasses: on windy days the sand blows straight into your eyes.', map: { x: 880, y: 560 } },
  { id: 'cove', name: 'Granite Cove', categories: ['Scenic', 'Nature'], rating: 4.8, reviews: 27, miles: 5.0, scene: 'coast', hidden: false,
    description: 'A quiet granite shoreline with tide pools and pine trees right down to the water.',
    tip: 'Low tide reveals the tide pools — check the tide times before you go.', map: { x: 140, y: 600 } },
  { id: 'noodle', name: 'Harbor Noodle Bar', categories: ['Food'], rating: 4.5, reviews: 210, miles: 0.9, scene: 'harbor', hidden: false,
    description: 'Hand-pulled noodles on the waterfront. Busy, fast and worth the line.',
    tip: 'Order at the side window to skip the main queue.', map: { x: 250, y: 300 } },
  { id: 'maple', name: 'Maple Hollow Trail', categories: ['Hiking', 'Nature'], rating: 4.4, reviews: 88, miles: 4.2, scene: 'forest', hidden: false,
    description: 'A shaded loop through old maples with a creek crossing halfway.',
    tip: 'The creek crossing gets muddy after rain — waterproof shoes help.', map: { x: 520, y: 120 } },
]

export const SAMPLE_REVIEWS = [
  { user: 'nora.t', stars: 5, text: 'Amazing sunset view and very peaceful. Definitely worth stopping here during the hike.' },
  { user: 'dev.r', stars: 4, text: 'Would never have found this without the tip. Go early on weekends.' },
]

export const CATEGORIES: Category[] = ['Food', 'Coffee', 'Hiking', 'Nature', 'Scenic']

export const CAT_COLOR: Record<Category, string> = {
  Food: '#E8590C', Coffee: '#8B5E3C', Hiking: '#1F7A5A', Nature: '#2F9E44', Scenic: '#2F6BFF',
}
