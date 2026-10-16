import { createRoot } from 'react-dom/client'
import '@fontsource/anton/latin-400.css' // self-hosted display font (SIL Open Font License)
import '@fontsource/cormorant-garamond/300.css' // opening line (SIL Open Font License)
import './index.css'
import Root from './Root'

// Note: no <StrictMode> — its double-mount breaks drei's <Html> 3D overlays in dev.
createRoot(document.getElementById('root')!).render(<Root />)
