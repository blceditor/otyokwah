# Future Requirements - Detailed Specifications

**Project**: Bear Lake Camp Website
**Repository**: https://github.com/sparkst/bearlakecamp
**Target**: Keystatic CMS Admin Interface - Future Enhancements
**Priority Order**: By implementation sequence

---

## REQ-FUTURE-020: Dark Mode Toggle

**Complexity**: Low | **Priority**: P3 | **Dev Time**: 2-3 hours

### User Story
As a CMS editor, I want to switch between light and dark themes so I can reduce eye strain during extended editing sessions.

### Requirements

**Core Functionality**:
- Theme toggle button in CMS header (top-right, near user menu)
- Icons: Sun (light mode) / Moon (dark mode) - Lucide React
- Default: Respect system preference (`prefers-color-scheme`)
- Persist user choice in localStorage
- Smooth transition animation between themes
- Apply to entire CMS admin area only (not frontend site)

**Technical Specifications**:

```typescript
// Install dependencies
npm install next-themes

// Layout wrapper: app/keystatic/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function KeystaticLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// Toggle component: components/ThemeToggle.tsx
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
```

**Tailwind Configuration**:

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode color palette
        dark: {
          bg: '#0f172a',      // Background
          surface: '#1e293b', // Cards/panels
          border: '#334155',  // Borders
          text: '#f1f5f9',    // Primary text
          muted: '#94a3b8'    // Secondary text
        }
      }
    }
  }
}

// Global styles: app/globals.css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

**Color Scheme**:
- Background: `bg-white dark:bg-dark-bg`
- Surface: `bg-gray-50 dark:bg-dark-surface`
- Borders: `border-gray-200 dark:border-dark-border`
- Text: `text-gray-900 dark:text-dark-text`
- Muted: `text-gray-600 dark:text-dark-muted`

**Components to Update**:
- Header/navigation bars
- Sidebar panels
- Form inputs
- Buttons
- Modals/dialogs
- Code blocks
- Table rows
- Dropdown menus

### Acceptance Criteria

- [ ] Toggle button visible in header
- [ ] Clicking toggle switches theme instantly (<300ms transition)
- [ ] Theme persists across browser sessions
- [ ] System preference detected on first visit
- [ ] All text readable in both modes (WCAG AA contrast)
- [ ] Images with transparency render correctly
- [ ] Syntax highlighting in code blocks adjusts to theme
- [ ] No flash of unstyled content on page load
- [ ] Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive

### Testing Requirements

```bash
# Visual regression tests
npm run test:visual -- --theme dark
npm run test:visual -- --theme light

# Accessibility tests
npm run test:a11y -- --theme dark
```

**Manual Testing Checklist**:
1. Toggle between themes 10+ times (performance check)
2. Refresh page (persistence check)
3. Open in incognito (system preference check)
4. Test all CMS pages (coverage check)
5. Screenshot compare with design system

---

## REQ-FUTURE-001: AI Assistant Chatbot

**Complexity**: Medium | **Priority**: P3 | **Dev Time**: 12-16 hours

### User Story
As a CMS editor, I want contextual help from an AI assistant so I can learn CMS features and best practices without leaving the interface.

### Requirements

**Core Functionality**:
- Floating chat widget (bottom-right corner, Lucide icon: MessageCircleQuestion)
- Click to expand full chat interface
- Minimized state shows unread dot indicator
- Context-aware responses based on current page/field
- Conversation history persists during session
- Claude API powered (via MCP integration)

**Chat Interface**:

```typescript
// Component: components/AIAssistant.tsx
import { MessageCircleQuestion, X, Send, Minimize2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // States: closed → open → minimized → open → closed
  // Persist messages in sessionStorage
  // Stream responses for better UX
}
```

**Layout**:
- Closed: 56x56px circle button
- Open: 400x600px chat panel (desktop), full screen (mobile)
- Minimized: 400x60px header bar only

**System Prompt**:

```
You are a helpful CMS assistant for Keystatic, a Git-based content management system.

Current Context:
- Page: ${currentPage}
- Field: ${currentField}
- User Role: ${userRole}

Your role is to:
1. Help users understand how to use Keystatic features
2. Provide content best practices (SEO, accessibility, writing)
3. Troubleshoot common issues
4. Answer questions about the CMS interface

Guidelines:
- Be concise (2-3 sentences per response)
- Use markdown for formatting
- Include relevant links to documentation
- Suggest keyboard shortcuts when applicable
- If unsure, recommend contacting support

Available CMS features:
- Content components: YouTube, Callout, Gallery, Button, Hero, etc.
- SEO tools: Meta tags, OG images, AI generation
- Image optimization: Auto WebP/AVIF conversion
- Draft mode: Preview before publishing
- Deployment status: Track builds in real-time

Common questions:
- "How do I add a video?" → Use {% youtube id="VIDEO_ID" /%}
- "Why isn't my image showing?" → Check file size (<5MB) and format
- "How do I preview changes?" → Click Preview button or use Cmd+P
```

**API Implementation**:

```typescript
// API Route: app/api/ai-assistant/route.ts
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const { messages, context } = await request.json()
  
  // Rate limiting: 20 messages per user per hour
  const userIp = request.headers.get('x-forwarded-for')
  const rateLimit = await checkRateLimit(userIp, 20, 3600)
  if (!rateLimit.allowed) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  
  // Build system prompt with context
  const systemPrompt = buildSystemPrompt(context)
  
  // Stream response
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
  
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages
  })
  
  // Return readable stream
  return new Response(stream.toReadableStream())
}
```

**Context Injection**:

```typescript
// Extract current context from Keystatic state
interface AssistantContext {
  currentPage: string           // e.g., "about"
  currentField?: string         // e.g., "content.heading"
  pageContent: string           // First 500 chars
  userRole: 'admin' | 'editor'
  recentActions: string[]       // Last 5 actions
  errorMessages?: string[]      // Current validation errors
}

// Send with each message
// Helps Claude provide specific, relevant answers
```

**Features**:

1. **Quick Suggestions**:
   - "Getting Started" (onboarding tips)
   - "SEO Best Practices"
   - "Keyboard Shortcuts"
   - "Troubleshooting"

2. **Contextual Help**:
   - If on image field: "Image optimization tips"
   - If on content editor: "Content writing tips"
   - If validation error: Explain error and solution

3. **Example Queries**:
   - "How do I add a call-to-action button?"
   - "What's the ideal meta description length?"
   - "Why is my deployment failing?"
   - "Show me keyboard shortcuts"

4. **Response Format**:
   - Markdown supported (bold, lists, code blocks)
   - Clickable links
   - Code snippets with syntax highlighting
   - Optional "Was this helpful?" feedback

### Cost Analysis

**Estimated Usage**:
- Average user: 5-10 messages per session
- Message length: ~200 tokens (input) + ~500 tokens (output)
- Cost per message: ~$0.003

**Monthly Cost** (10 active users):
- 10 users × 20 sessions/month × 8 messages/session = 1,600 messages
- 1,600 × $0.003 = $4.80/month

**Rate Limiting**:
- Per user: 20 messages/hour, 100 messages/day
- Global: 1,000 messages/hour
- Track in Redis or Supabase

### Acceptance Criteria

- [ ] Widget accessible from all CMS pages
- [ ] Click to open/close chat interface
- [ ] Messages stream in real-time (<1s first token)
- [ ] Context automatically included (current page/field)
- [ ] Conversation history persists during session
- [ ] Rate limiting prevents abuse
- [ ] Markdown rendering works correctly
- [ ] Mobile responsive (full screen on mobile)
- [ ] Keyboard accessible (Tab navigation, Enter to send)
- [ ] Error handling (API failures, rate limits)
- [ ] "Clear conversation" button works
- [ ] Analytics track: usage, popular questions, satisfaction

### Privacy & Security

- [ ] No sensitive content sent to API (no passwords, API keys)
- [ ] User content truncated (max 500 chars context)
- [ ] Rate limiting per IP address
- [ ] Conversations not stored server-side (sessionStorage only)
- [ ] Optional: Allow customers to use their own API keys

### Future Enhancements
- Voice input (Web Speech API)
- Suggested actions (e.g., "Create a page for you")
- Multi-language support
- Training on custom documentation
- Integration with support ticket system

---

## REQ-FUTURE-013: Recent Pages Quick Access

**Complexity**: Low | **Priority**: P3 | **Dev Time**: 3-4 hours

### User Story
As a CMS editor, I want quick access to recently edited pages so I can navigate between active content efficiently.

### Requirements

**Core Functionality**:
- Dropdown menu in header (Lucide icon: Clock)
- Shows last 10 edited pages
- Click page to navigate directly to editor
- Sorted by most recent first
- Persists across browser sessions
- Clear all history option

**UI Design**:

```typescript
// Component: components/RecentPages.tsx
import { Clock, FileText, X } from 'lucide-react'

interface RecentPage {
  slug: string
  title: string
  timestamp: Date
  action: 'created' | 'edited' | 'viewed'
}

export function RecentPages() {
  const [pages, setPages] = useState<RecentPage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('keystatic_recent_pages')
    if (stored) setPages(JSON.parse(stored))
  }, [])
  
  // Update on page visit
  const addRecentPage = (page: RecentPage) => {
    const updated = [
      page,
      ...pages.filter(p => p.slug !== page.slug)
    ].slice(0, 10)
    
    setPages(updated)
    localStorage.setItem('keystatic_recent_pages', JSON.stringify(updated))
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2">
          <Clock className="h-5 w-5" />
          <span className="hidden sm:inline">Recent</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-medium">Recent Pages</span>
          <button onClick={handleClearAll} className="text-xs text-gray-500">
            Clear all
          </button>
        </div>
        
        {pages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent pages
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {pages.map((page) => (
              <DropdownMenuItem
                key={page.slug}
                onClick={() => navigateToPage(page.slug)}
                className="flex items-start gap-3 p-3"
              >
                <FileText className="h-4 w-4 mt-0.5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{page.title}</div>
                  <div className="text-xs text-gray-500">
                    {formatRelativeTime(page.timestamp)}
                  </div>
                </div>
                <span className="text-xs text-gray-400 capitalize">
                  {page.action}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Data Structure**:

```typescript
// localStorage key: 'keystatic_recent_pages'
// Max items: 10
// Sorted: Newest first

interface StoredData {
  version: 1,
  pages: RecentPage[],
  lastUpdated: string
}
```

**Time Formatting**:

```typescript
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
```

**Trigger Points**:

```typescript
// Add to recent when:
1. Page opened in editor → action: 'viewed'
2. Page saved → action: 'edited'
3. New page created → action: 'created'

// Hook into Keystatic router
useEffect(() => {
  if (currentPage) {
    addRecentPage({
      slug: currentPage.slug,
      title: currentPage.title,
      timestamp: new Date(),
      action: determineAction()
    })
  }
}, [currentPage])
```

### Acceptance Criteria

- [ ] Dropdown accessible from header
- [ ] Shows max 10 pages
- [ ] Pages sorted by most recent first
- [ ] Clicking page navigates to editor
- [ ] Timestamp updates in real-time (relative time)
- [ ] Persists across browser sessions
- [ ] Clear all removes all history
- [ ] No duplicates (visiting same page updates timestamp)
- [ ] Works when logged out (no data loss on login)
- [ ] Mobile responsive (full-width dropdown)
- [ ] Keyboard navigable (Arrow keys, Enter to select)

### Edge Cases

- [ ] Handle deleted pages (show "Page deleted" with remove option)
- [ ] Handle renamed pages (update title automatically)
- [ ] Handle localStorage full (remove oldest entries)
- [ ] Handle corrupted data (reset to empty array)

---

## REQ-FUTURE-014: Content Statistics Display

**Complexity**: Low | **Priority**: P3 | **Dev Time**: 2-3 hours

### User Story
As a content editor, I want real-time statistics about my content so I can optimize for readability and SEO.

### Requirements

**Core Functionality**:
- Fixed position stats panel (bottom-right corner)
- Collapsible/expandable (Lucide icon: BarChart3)
- Updates in real-time as user types
- Non-intrusive, semi-transparent when inactive
- Keyboard shortcut: `Cmd/Ctrl + I` to toggle

**Statistics to Display**:

1. **Word Count**
   - Total words in document
   - Excludes Markdoc tags
   - Format: "1,234 words"

2. **Character Count**
   - Total characters (with spaces)
   - Total characters (without spaces)
   - Format: "5,678 chars (4,321 no spaces)"

3. **Reading Time**
   - Based on 200 words/minute average
   - Format: "6 min read"

4. **Paragraph Count**
   - Number of paragraphs
   - Format: "12 paragraphs"

5. **Heading Structure**
   - Count by level (H1, H2, H3, etc.)
   - Warning if issues detected:
     - No H1 (SEO issue)
     - Multiple H1s (should be one)
     - Skipped levels (H1 → H3, bad a11y)
   - Format: "H1: 1, H2: 4, H3: 8"

6. **Image Count**
   - Total images in content
   - Warning if images missing alt text
   - Format: "5 images (2 missing alt)"

7. **Link Count**
   - Internal links
   - External links
   - Format: "12 links (8 internal, 4 external)"

**UI Implementation**:

```typescript
// Component: components/ContentStats.tsx
import { BarChart3, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react'

interface ContentStats {
  wordCount: number
  charCount: number
  charCountNoSpaces: number
  readingTime: number
  paragraphCount: number
  headings: Record<string, number>
  imageCount: number
  imagesWithoutAlt: number
  linkCount: {
    internal: number
    external: number
  }
  warnings: Warning[]
}

interface Warning {
  type: 'no-h1' | 'multiple-h1' | 'skipped-heading' | 'missing-alt' | 'long-content'
  message: string
  severity: 'error' | 'warning' | 'info'
}

export function ContentStats({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [stats, setStats] = useState<ContentStats | null>(null)
  
  // Calculate stats on content change (debounced 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(calculateStats(content))
    }, 500)
    
    return () => clearTimeout(timer)
  }, [content])
  
  if (!stats) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
        "bg-white dark:bg-dark-surface border rounded-lg shadow-lg transition-all",
        isExpanded ? "w-80" : "w-12 h-12"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {isExpanded && <span className="font-medium">Content Stats</span>}
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Stats Body */}
        {isExpanded && (
          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            {/* Warnings */}
            {stats.warnings.length > 0 && (
              <div className="space-y-2">
                {stats.warnings.map((warning, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded text-sm",
                      warning.severity === 'error' && "bg-red-50 text-red-700",
                      warning.severity === 'warning' && "bg-amber-50 text-amber-700",
                      warning.severity === 'info' && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <span>{warning.message}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="Words" value={stats.wordCount.toLocaleString()} />
              <StatItem label="Reading Time" value={`${stats.readingTime} min`} />
              <StatItem label="Characters" value={stats.charCount.toLocaleString()} />
              <StatItem label="Paragraphs" value={stats.paragraphCount} />
            </div>
            
            {/* Headings */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Headings</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.headings).map(([level, count]) => (
                  <span key={level} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {level}: {count}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Images & Links */}
            <div className="grid grid-cols-2 gap-3">
              <StatItem 
                label="Images" 
                value={stats.imageCount}
                detail={stats.imagesWithoutAlt > 0 ? `${stats.imagesWithoutAlt} missing alt` : undefined}
              />
              <StatItem 
                label="Links" 
                value={stats.linkCount.internal + stats.linkCount.external}
                detail={`${stats.linkCount.internal}i / ${stats.linkCount.external}e`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatItem({ label, value, detail }: { label: string, value: string | number, detail?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {detail && <div className="text-xs text-gray-400">{detail}</div>}
    </div>
  )
}
```

**Calculation Logic**:

```typescript
function calculateStats(content: string): ContentStats {
  // Parse Markdoc content
  const ast = Markdoc.parse(content)
  const text = extractPlainText(ast)
  
  // Word count (split on whitespace)
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  
  // Character count
  const charCount = text.length
  const charCountNoSpaces = text.replace(/\s/g, '').length
  
  // Reading time (200 words/min)
  const readingTime = Math.ceil(wordCount / 200)
  
  // Paragraph count
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0)
  const paragraphCount = paragraphs.length
  
  // Headings
  const headings = extractHeadings(ast)
  const headingCounts = headings.reduce((acc, h) => {
    acc[`H${h.level}`] = (acc[`H${h.level}`] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Images
  const images = extractImages(ast)
  const imageCount = images.length
  const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '').length
  
  // Links
  const links = extractLinks(ast)
  const linkCount = {
    internal: links.filter(l => l.startsWith('/')).length,
    external: links.filter(l => !l.startsWith('/')).length
  }
  
  // Warnings
  const warnings: Warning[] = []
  
  // Check H1
  const h1Count = headingCounts['H1'] || 0
  if (h1Count === 0) {
    warnings.push({
      type: 'no-h1',
      message: 'Missing H1 heading (SEO issue)',
      severity: 'error'
    })
  } else if (h1Count > 1) {
    warnings.push({
      type: 'multiple-h1',
      message: `${h1Count} H1 headings found (should be 1)`,
      severity: 'warning'
    })
  }
  
  // Check heading hierarchy
  const levels = headings.map(h => h.level).sort()
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i-1] > 1) {
      warnings.push({
        type: 'skipped-heading',
        message: `Skipped heading level (H${levels[i-1]} → H${levels[i]})`,
        severity: 'warning'
      })
      break
    }
  }
  
  // Check images without alt
  if (imagesWithoutAlt > 0) {
    warnings.push({
      type: 'missing-alt',
      message: `${imagesWithoutAlt} image(s) missing alt text`,
      severity: 'warning'
    })
  }
  
  // Check content length
  if (wordCount > 3000) {
    warnings.push({
      type: 'long-content',
      message: 'Very long content (consider splitting)',
      severity: 'info'
    })
  }
  
  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    readingTime,
    paragraphCount,
    headings: headingCounts,
    imageCount,
    imagesWithoutAlt,
    linkCount,
    warnings
  }
}
```

### Acceptance Criteria

- [ ] Panel visible in bottom-right corner
- [ ] Collapses/expands smoothly
- [ ] Stats update in real-time (500ms debounce)
- [ ] All statistics accurate
- [ ] Warnings show for SEO/accessibility issues
- [ ] Keyboard shortcut (Cmd+I) toggles panel
- [ ] Doesn't interfere with editing
- [ ] Responsive on mobile (moves to bottom)
- [ ] Dark mode compatible
- [ ] Performance: No lag on large documents (>5000 words)

---

## REQ-FUTURE-015: Quick Insert Menu

**Complexity**: Low | **Priority**: P3 | **Dev Time**: 5-6 hours

### User Story
As a content editor, I want multiple ways to insert components quickly so I can maintain my writing flow.

### Requirements

**Trigger Methods**:

1. **Slash Command** (`/`)
   - Type `/` at start of line
   - Shows component picker menu
   - Arrow keys to navigate, Enter to insert

2. **Plus Button**
   - Floating `+` button appears on hover between blocks
   - Click opens component picker at cursor position
   - Lucide icon: Plus in circle

3. **Keyboard Shortcut** (`Cmd/Ctrl + K`)
   - Universal command palette
   - Works anywhere in editor
   - Opens centered modal with search

4. **Right-Click Context Menu**
   - Right-click in editor
   - Shows "Insert Component" submenu
   - Categorized list of components

**Component Picker UI**:

```typescript
// Component: components/QuickInsert.tsx
import { 
  Plus, Video, AlertCircle, Image as ImageIcon, 
  Link, Table, Code, Quote, List, Calendar,
  MousePointer, Layout, BarChart, Users
} from 'lucide-react'

interface Component {
  id: string
  name: string
  icon: LucideIcon
  category: 'content' | 'media' | 'layout' | 'interactive'
  description: string
  tag: string
  shortcut?: string
}

const COMPONENTS: Component[] = [
  {
    id: 'callout',
    name: 'Callout',
    icon: AlertCircle,
    category: 'content',
    description: 'Highlight important information',
    tag: '{% callout type="info" %}\nYour content here\n{% /callout %}',
    shortcut: '/callout'
  },
  {
    id: 'youtube',
    name: 'YouTube Video',
    icon: Video,
    category: 'media',
    description: 'Embed a YouTube video',
    tag: '{% youtube id="VIDEO_ID" /%}',
    shortcut: '/video'
  },
  {
    id: 'button',
    name: 'Button',
    icon: MousePointer,
    category: 'interactive',
    description: 'Call-to-action button',
    tag: '{% button href="#" text="Click me" /%}',
    shortcut: '/button'
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    icon: ImageIcon,
    category: 'media',
    description: 'Photo gallery grid',
    tag: '{% gallery images=[...] /%}',
    shortcut: '/gallery'
  },
  {
    id: 'hero',
    name: 'Hero Section',
    icon: Layout,
    category: 'layout',
    description: 'Large heading with background',
    tag: '{% hero heading="..." subheading="..." /%}',
    shortcut: '/hero'
  },
  {
    id: 'features',
    name: 'Feature Grid',
    icon: BarChart,
    category: 'layout',
    description: '3-column feature showcase',
    tag: '{% features items=[...] /%}',
    shortcut: '/features'
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    icon: Quote,
    category: 'content',
    description: 'Customer quote',
    tag: '{% testimonial quote="..." author="..." /%}',
    shortcut: '/testimonial'
  },
  {
    id: 'stats',
    name: 'Stats Counter',
    icon: BarChart,
    category: 'layout',
    description: 'Animated number display',
    tag: '{% stats number="100" label="..." /%}',
    shortcut: '/stats'
  },
  // ... more components
]

export function QuickInsert({ 
  trigger,
  onInsert, 
  position 
}: { 
  trigger: 'slash' | 'plus' | 'keyboard' | 'context'
  onInsert: (component: Component) => void
  position?: { x: number, y: number }
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Filter components by search query
  const filtered = useMemo(() => {
    if (!query) return COMPONENTS
    
    const q = query.toLowerCase()
    return COMPONENTS.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.shortcut?.includes(q)
    )
  }, [query])
  
  // Group by category
  const grouped = useMemo(() => {
    return filtered.reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = []
      acc[c.category].push(c)
      return acc
    }, {} as Record<string, Component[]>)
  }, [filtered])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onInsert(filtered[selectedIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [filtered, selectedIndex])
  
  return (
    <div 
      className="bg-white dark:bg-dark-surface border rounded-lg shadow-xl w-96 max-h-96 overflow-hidden"
      style={position ? { position: 'absolute', top: position.y, left: position.x } : {}}
    >
      {/* Search Input */}
      <div className="p-2 border-b">
        <input
          type="text"
          placeholder="Search components..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 rounded border-0 focus:ring-2"
          autoFocus
        />
      </div>
      
      {/* Component List */}
      <div className="overflow-y-auto max-h-80">
        {Object.entries(grouped).map(([category, components]) => (
          <div key={category}>
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg">
              {category}
            </div>
            {components.map((component, i) => (
              <button
                key={component.id}
                onClick={() => onInsert(component)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors",
                  selectedIndex === filtered.indexOf(component) && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <component.icon className="h-5 w-5 text-gray-400" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{component.name}</div>
                  <div className="text-xs text-gray-500">{component.description}</div>
                </div>
                {component.shortcut && (
                  <span className="text-xs text-gray-400">{component.shortcut}</span>
                )}
              </button>
            ))}
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No components found for "{query}"
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 dark:bg-dark-bg text-xs text-gray-500 flex items-center justify-between">
        <span>↑↓ Navigate • ↵ Select • Esc Close</span>
      </div>
    </div>
  )
}
```

**Slash Command Implementation**:

```typescript
// Detect "/" at start of line
// Show picker at cursor position
// Filter as user types after "/"

function detectSlashCommand(editor: Editor) {
  const { selection } = editor.state
  const { $from } = selection
  const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)
  
  // Check if "/" is at start of line or after whitespace
  if (textBefore === '/' || textBefore.endsWith(' /')) {
    // Show picker
    showQuickInsert({
      trigger: 'slash',
      position: getCursorPosition(editor)
    })
  }
}
```

**Plus Button Implementation**:

```typescript
// Show floating "+" button on hover between blocks

function BlockSpacer({ index, onInsert }: { index: number, onInsert: (index: number) => void }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="relative h-4 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Plus button */}
      <button
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-blue-600 hover:scale-110"
        )}
        onClick={() => onInsert(index)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
```

**Keyboard Shortcut Implementation**:

```typescript
// Global listener for Cmd/Ctrl + K

useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      showQuickInsert({
        trigger: 'keyboard',
        position: 'center' // Show centered modal
      })
    }
  }
  
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [])
```

**Right-Click Context Menu**:

```typescript
// Add "Insert Component" to context menu

function EditorContextMenu({ x, y, onClose }: { x: number, y: number, onClose: () => void }) {
  return (
    <ContextMenu x={x} y={y}>
      <ContextMenuItem icon={Clipboard} onClick={handleCopy}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem icon={Scissors} onClick={handleCut}>
        Cut
      </ContextMenuItem>
      <ContextMenuItem icon={Clipboard} onClick={handlePaste}>
        Paste
      </ContextMenuItem>
      
      <ContextMenuSeparator />
      
      <ContextMenuSubmenu icon={Plus} label="Insert Component">
        {COMPONENTS.map(component => (
          <ContextMenuItem
            key={component.id}
            icon={component.icon}
            onClick={() => handleInsert(component)}
          >
            {component.name}
          </ContextMenuItem>
        ))}
      </ContextMenuSubmenu>
    </ContextMenu>
  )
}
```

### Acceptance Criteria

- [ ] All 4 trigger methods work:
  - Slash command (`/`)
  - Plus button (hover between blocks)
  - Keyboard shortcut (Cmd+K)
  - Right-click context menu
- [ ] Search/filter works (fuzzy matching)
- [ ] Keyboard navigation (arrows, enter, esc)
- [ ] Components grouped by category
- [ ] Icons render correctly (Lucide)
- [ ] Inserts component at correct cursor position
- [ ] Closes after insertion
- [ ] Responsive on mobile (full-screen modal)
- [ ] Performance: Opens in <100ms
- [ ] Analytics track: which trigger method used, which components popular

### Testing

```typescript
// E2E tests
test('slash command opens picker', () => {
  typeInEditor('/')
  expect(screen.getByPlaceholderText('Search components...')).toBeVisible()
})

test('plus button appears on hover', () => {
  hoverBetweenBlocks()
  expect(screen.getByRole('button', { name: /insert/i })).toBeVisible()
})

test('keyboard shortcut works', () => {
  pressKeys('Cmd+K')
  expect(screen.getByPlaceholderText('Search components...')).toBeVisible()
})

test('inserts component at cursor', () => {
  typeInEditor('Hello ')
  pressKeys('Cmd+K')
  selectComponent('Callout')
  expect(getEditorContent()).toContain('Hello {% callout %}')
})
```

---

## REQ-FUTURE-002: Version History / Content Rollback

**Complexity**: Medium | **Priority**: P3 | **Dev Time**: 10-12 hours

### User Story
As a content editor, I want to view page history and rollback changes so I can recover from mistakes without technical knowledge.

### Requirements

**Core Functionality**:
- "History" button in page editor header (Lucide icon: History)
- Side panel showing commit timeline
- Visual diff view (side-by-side comparison)
- One-click rollback to previous version
- Attribution (who made changes, when)
- Filter by date range, author

**UI Design**:

```typescript
// Component: components/VersionHistory.tsx
import { History, Undo, Eye, GitCommit, User, Calendar } from 'lucide-react'

interface Commit {
  sha: string
  message: string
  author: {
    name: string
    email: string
    avatar: string
  }
  date: Date
  changes: {
    additions: number
    deletions: number
  }
}

export function VersionHistory({ pageSlug }: { pageSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [commits, setCommits] = useState<Commit[]>([])
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null)
  const [diffView, setDiffView] = useState<'split' | 'unified'>('split')
  const [isLoading, setIsLoading] = useState(false)
  
  // Load commits on open
  useEffect(() => {
    if (isOpen) {
      loadCommits()
    }
  }, [isOpen, pageSlug])
  
  const loadCommits = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/version-history?page=${pageSlug}`)
      const data = await response.json()
      setCommits(data.commits)
    } catch (error) {
      console.error('Failed to load commits:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleRollback = async (sha: string) => {
    if (!confirm('Are you sure you want to rollback to this version?')) return
    
    try {
      await fetch('/api/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageSlug, sha })
      })
      
      // Refresh page
      window.location.reload()
    } catch (error) {
      alert('Rollback failed: ' + error.message)
    }
  }
  
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
      >
        <History className="h-4 w-4" />
        <span>History</span>
      </button>
      
      {/* Side Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px]">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
            <SheetDescription>
              View and restore previous versions of this page
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Timeline */}
                <div className="space-y-2">
                  {commits.map((commit, i) => (
                    <div
                      key={commit.sha}
                      className="flex items-start gap-3 p-3 rounded border hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCommit(commit.sha)}
                    >
                      {/* Timeline indicator */}
                      <div className="relative pt-1">
                        <GitCommit className="h-4 w-4 text-gray-400" />
                        {i < commits.length - 1 && (
                          <div className="absolute top-6 left-2 w-px h-full bg-gray-200" />
                        )}
                      </div>
                      
                      {/* Commit info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <img 
                            src={commit.author.avatar} 
                            alt={commit.author.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="font-medium">{commit.author.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(commit.date)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {commit.message}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <span className="text-green-600">
                            +{commit.changes.additions} additions
                          </span>
                          <span className="text-red-600">
                            -{commit.changes.deletions} deletions
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCommit(commit.sha)
                          }}
                          className="p-2 rounded hover:bg-gray-100"
                          title="View diff"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRollback(commit.sha)
                          }}
                          className="p-2 rounded hover:bg-gray-100"
                          title="Rollback to this version"
                        >
                          <Undo className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Diff View */}
                {selectedCommit && (
                  <DiffView 
                    pageSlug={pageSlug}
                    commitSha={selectedCommit}
                    mode={diffView}
                  />
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
```

**Diff View Component**:

```typescript
// Component: components/DiffView.tsx
import { diffLines, diffWords } from 'diff'

export function DiffView({ 
  pageSlug, 
  commitSha, 
  mode 
}: { 
  pageSlug: string
  commitSha: string
  mode: 'split' | 'unified'
}) {
  const [diff, setDiff] = useState<DiffResult | null>(null)
  
  useEffect(() => {
    loadDiff()
  }, [commitSha])
  
  const loadDiff = async () => {
    const response = await fetch(`/api/diff?page=${pageSlug}&sha=${commitSha}`)
    const data = await response.json()
    setDiff(data)
  }
  
  if (!diff) return <LoadingSpinner />
  
  const changes = diffLines(diff.before, diff.after)
  
  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <span className="font-medium">Changes</span>
        <div className="flex gap-2">
          <button
            onClick={() => mode = 'split'}
            className={cn("px-3 py-1 rounded text-sm", mode === 'split' && "bg-white")}
          >
            Split
          </button>
          <button
            onClick={() => mode = 'unified'}
            className={cn("px-3 py-1 rounded text-sm", mode === 'unified' && "bg-white")}
          >
            Unified
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {mode === 'split' ? (
          <div className="grid grid-cols-2 divide-x">
            <div className="p-4 bg-red-50">
              <div className="text-xs font-medium text-red-700 mb-2">Before</div>
              <pre className="text-sm">
                {changes
                  .filter(c => c.removed || !c.added)
                  .map((c, i) => (
                    <div key={i} className={c.removed ? 'bg-red-200' : ''}>
                      {c.value}
                    </div>
                  ))}
              </pre>
            </div>
            <div className="p-4 bg-green-50">
              <div className="text-xs font-medium text-green-700 mb-2">After</div>
              <pre className="text-sm">
                {changes
                  .filter(c => c.added || !c.removed)
                  .map((c, i) => (
                    <div key={i} className={c.added ? 'bg-green-200' : ''}>
                      {c.value}
                    </div>
                  ))}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <pre className="text-sm">
              {changes.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    c.added && 'bg-green-200 text-green-900',
                    c.removed && 'bg-red-200 text-red-900'
                  )}
                >
                  {c.added && '+ '}
                  {c.removed && '- '}
                  {c.value}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
```

**API Implementation**:

```typescript
// API Route: app/api/version-history/route.ts
// GET - List commits for a page

import { Octokit } from '@octokit/rest'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSlug = searchParams.get('page')
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })
  
  // Get commits for specific file
  const filePath = `content/pages/${pageSlug}.md`
  
  const { data: commits } = await octokit.repos.listCommits({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    path: filePath,
    per_page: 50
  })
  
  // Transform to our format
  const formatted = commits.map(c => ({
    sha: c.sha,
    message: c.commit.message,
    author: {
      name: c.commit.author?.name || 'Unknown',
      email: c.commit.author?.email || '',
      avatar: c.author?.avatar_url || ''
    },
    date: new Date(c.commit.author?.date || ''),
    changes: {
      additions: 0, // Need to fetch individual commit for this
      deletions: 0
    }
  }))
  
  return Response.json({ commits: formatted })
}

// API Route: app/api/diff/route.ts
// GET - Get diff for specific commit

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSlug = searchParams.get('page')
  const commitSha = searchParams.get('sha')
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })
  
  const filePath = `content/pages/${pageSlug}.md`
  
  // Get file at specific commit
  const { data: commitFile } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    path: filePath,
    ref: commitSha
  })
  
  // Get current version
  const { data: currentFile } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    path: filePath
  })
  
  // Decode base64 content
  const before = Buffer.from(commitFile.content, 'base64').toString()
  const after = Buffer.from(currentFile.content, 'base64').toString()
  
  return Response.json({ before, after })
}

// API Route: app/api/rollback/route.ts
// POST - Rollback to specific version

export async function POST(request: Request) {
  const { page, sha } = await request.json()
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })
  
  const filePath = `content/pages/${page}.md`
  
  // Get file content at specific commit
  const { data: oldFile } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    path: filePath,
    ref: sha
  })
  
  // Get current file SHA (needed for update)
  const { data: currentFile } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    path: filePath
  })
  
  // Create new commit with old content
  await octokit.repos.createOrUpdateFileContents({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    path: filePath,
    message: `Rollback to version ${sha.substring(0, 7)}`,
    content: oldFile.content,
    sha: currentFile.sha
  })
  
  return Response.json({ success: true })
}
```

### Acceptance Criteria

- [ ] History button visible in page editor
- [ ] Side panel shows commits in reverse chronological order
- [ ] Each commit shows: author, timestamp, message, changes
- [ ] Click commit to view diff
- [ ] Diff view shows before/after (split and unified modes)
- [ ] Rollback button works (with confirmation)
- [ ] After rollback, page reloads with restored content
- [ ] Attribution shows GitHub profile pictures
- [ ] Timeline shows visual connection between commits
- [ ] Filter by date range
- [ ] Filter by author
- [ ] Performance: Loads 50 commits in <2s
- [ ] Error handling (GitHub API failures)

### Edge Cases

- [ ] Handle deleted files (show in history, can't rollback)
- [ ] Handle renamed files (follow across renames)
- [ ] Handle merge commits (show both parents)
- [ ] Handle binary files (show "Binary file changed")
- [ ] Handle large diffs (truncate, show "View full diff")

---

## REQ-FUTURE-005: Content Analytics Dashboard

**Complexity**: Medium | **Priority**: P3 | **Dev Time**: 8-10 hours

### User Story
As a content editor, I want to see how my pages perform so I can prioritize updates and improve engagement.

### Requirements

**Core Functionality**:
- "Analytics" tab in page editor (Lucide icon: BarChart3)
- Dashboard showing page-specific metrics
- Date range selector (7d, 30d, 90d, all-time)
- Comparison to site average
- Export data as CSV

**Metrics to Display**:

1. **Traffic Metrics**
   - Total page views
   - Unique visitors
   - Trend graph (7-day or 30-day)
   - Comparison to previous period

2. **Engagement Metrics**
   - Average time on page
   - Bounce rate
   - Scroll depth (% of page viewed)
   - Exit rate

3. **Traffic Sources**
   - Direct
   - Search engines (organic)
   - Social media
   - Referral sites
   - Email campaigns

4. **Device Breakdown**
   - Desktop vs Mobile vs Tablet
   - Browser distribution
   - Operating system

5. **Geographic Data**
   - Top countries
   - Top cities
   - Map visualization

6. **SEO Performance**
   - Search impressions
   - Click-through rate
   - Average position
   - Top search queries

**UI Implementation**:

```typescript
// Component: components/AnalyticsDashboard.tsx
import { BarChart3, TrendingUp, Users, Clock, Globe, Smartphone } from 'lucide-react'
import { LineChart, BarChart, PieChart } from 'recharts'

interface PageAnalytics {
  pageViews: number
  uniqueVisitors: number
  avgTimeOnPage: number
  bounceRate: number
  scrollDepth: number
  exitRate: number
  trend: { date: string, views: number }[]
  sources: { source: string, visits: number }[]
  devices: { device: string, percentage: number }[]
  countries: { country: string, visits: number }[]
}

export function AnalyticsDashboard({ pageSlug }: { pageSlug: string }) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [analytics, setAnalytics] = useState<PageAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadAnalytics()
  }, [pageSlug, dateRange])
  
  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?page=${pageSlug}&range=${dateRange}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) return <LoadingSpinner />
  if (!analytics) return <ErrorState />
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Analytics</h2>
          <p className="text-gray-500">Performance metrics for this page</p>
        </div>
        
        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Page Views"
          value={analytics.pageViews.toLocaleString()}
          change="+12% vs previous period"
          trend="up"
        />
        <MetricCard
          icon={Users}
          label="Unique Visitors"
          value={analytics.uniqueVisitors.toLocaleString()}
          change="+8% vs previous period"
          trend="up"
        />
        <MetricCard
          icon={Clock}
          label="Avg Time on Page"
          value={formatDuration(analytics.avgTimeOnPage)}
          change="-5% vs previous period"
          trend="down"
        />
        <MetricCard
          icon={TrendingUp}
          label="Bounce Rate"
          value={`${analytics.bounceRate}%`}
          change="+3% vs previous period"
          trend="neutral"
        />
      </div>
      
      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            width={800}
            height={300}
            data={analytics.trend}
          >
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#3b82f6" />
          </LineChart>
        </CardContent>
      </Card>
      
      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            width={800}
            height={300}
            data={analytics.sources}
          >
            <XAxis dataKey="source" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="visits" fill="#3b82f6" />
          </BarChart>
        </CardContent>
      </Card>
      
      {/* Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={analytics.devices}
                dataKey="percentage"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#3b82f6"
                label
              />
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>
        
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.countries.slice(0, 5).map((country, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{country.country}</span>
                  <span className="font-medium">{country.visits.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Export as CSV
        </button>
      </div>
    </div>
  )
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend 
}: { 
  icon: LucideIcon
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className={cn(
              "text-xs",
              trend === 'up' && "text-green-600",
              trend === 'down' && "text-red-600",
              trend === 'neutral' && "text-gray-500"
            )}>
              {change}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**API Implementation**:

```typescript
// API Route: app/api/analytics/route.ts
// Integrate with Vercel Analytics API

import { getWebAnalyticsPageViews } from '@vercel/analytics'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSlug = searchParams.get('page')
  const range = searchParams.get('range') || '30d'
  
  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  
  switch (range) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
    case 'all':
      startDate.setFullYear(2020) // Beginning of time
      break
  }
  
  // Fetch from Vercel Analytics
  const analytics = await getWebAnalyticsPageViews({
    path: `/${pageSlug}`,
    start: startDate,
    end: endDate
  })
  
  // Transform and aggregate data
  const transformed = {
    pageViews: analytics.total,
    uniqueVisitors: analytics.unique,
    avgTimeOnPage: analytics.avgDuration,
    bounceRate: analytics.bounceRate,
    scrollDepth: analytics.scrollDepth,
    exitRate: analytics.exitRate,
    trend: analytics.timeseries.map(t => ({
      date: t.date,
      views: t.pageviews
    })),
    sources: analytics.sources,
    devices: analytics.devices,
    countries: analytics.countries
  }
  
  return Response.json(transformed)
}

// Export endpoint
export async function POST(request: Request) {
  const { page, range } = await request.json()
  
  // Fetch analytics
  const analytics = await fetch(`/api/analytics?page=${page}&range=${range}`)
  const data = await analytics.json()
  
  // Convert to CSV
  const csv = convertToCSV(data)
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${page}-analytics.csv"`
    }
  })
}
```

### Acceptance Criteria

- [ ] Analytics tab visible in page editor
- [ ] Dashboard loads in <3s
- [ ] All metrics display correctly
- [ ] Charts render properly (responsive)
- [ ] Date range selector works
- [ ] Comparison to previous period shows
- [ ] Export CSV includes all data
- [ ] Mobile responsive
- [ ] Graceful handling of pages with no data
- [ ] Error handling (API failures)

### Data Sources

**Option A: Vercel Analytics** (Recommended)
- Already integrated
- Free tier: 100k events/month
- Pro: $10/month for 1M events
- Real-time data
- Built-in API

**Option B: Google Analytics**
- Free
- More comprehensive
- Requires additional setup
- GA4 API integration needed

**Option C: Plausible Analytics**
- Privacy-focused
- $9/month for 10k pageviews
- Simple API
- GDPR compliant

---

## REQ-FUTURE-007: Media Library Manager

**Complexity**: Medium | **Priority**: P3 | **Dev Time**: 10-12 hours

### User Story
As a content editor, I want a centralized place to manage all media assets so I can reuse images and maintain organized files.

### Requirements

**Core Functionality**:
- "Media Library" link in CMS navigation (Lucide icon: FolderOpen)
- Grid view of all uploaded images
- Search/filter by filename, date, size
- Bulk upload (drag & drop)
- Image editing (crop, resize, rotate)
- Usage tracking (which pages use each image)
- Duplicate detection
- Bulk delete

**UI Design**:

```typescript
// Component: components/MediaLibrary.tsx
import { 
  FolderOpen, Upload, Search, Grid3x3, List,
  Trash2, Edit, Download, Copy, Image as ImageIcon
} from 'lucide-react'

interface MediaFile {
  id: string
  filename: string
  url: string
  thumbnail: string
  size: number
  dimensions: { width: number, height: number }
  uploadedAt: Date
  usedIn: string[] // Page slugs
  alt?: string
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [isUploading, setIsUploading] = useState(false)
  
  // Load files
  useEffect(() => {
    loadFiles()
  }, [])
  
  const loadFiles = async () => {
    const response = await fetch('/api/media')
    const data = await response.json()
    setFiles(data.files)
  }
  
  // Handle file upload (drag & drop or file picker)
  const handleUpload = async (files: FileList) => {
    setIsUploading(true)
    
    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })
    
    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })
      
      const { uploaded } = await response.json()
      setFiles(prev => [...uploaded, ...prev])
    } catch (error) {
      alert('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }
  
  // Bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedFiles.size} files?`)) return
    
    await fetch('/api/media/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedFiles) })
    })
    
    setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)))
    setSelectedFiles(new Set())
  }
  
  // Filter files
  const filteredFiles = useMemo(() => {
    let filtered = files
    
    // Search
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.uploadedAt.getTime() - a.uploadedAt.getTime()
        case 'name':
          return a.filename.localeCompare(b.filename)
        case 'size':
          return b.size - a.size
        default:
          return 0
      }
    })
    
    return filtered
  }, [files, searchQuery, sortBy])
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold mb-4">Media Library</h1>
        
        {/* Toolbar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
          
          {/* View Mode */}
          <div className="flex gap-1 border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded",
                viewMode === 'grid' && "bg-gray-100"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded",
                viewMode === 'list' && "bg-gray-100"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          {/* Upload Button */}
          <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
            <Upload className="inline h-4 w-4 mr-2" />
            Upload
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => handleUpload(e.target.files!)}
              className="hidden"
            />
          </label>
        </div>
        
        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span>{selectedFiles.size} files selected</span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 className="inline h-4 w-4 mr-1" />
                Delete
              </button>
              <button
                onClick={() => setSelectedFiles(new Set())}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Drop Zone */}
      <DropZone onDrop={handleUpload} />
      
      {/* File Grid/List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isUploading && <LoadingSpinner />}
        
        {filteredFiles.length === 0 ? (
          <EmptyState query={searchQuery} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map(file => (
              <MediaCard
                key={file.id}
                file={file}
                isSelected={selectedFiles.has(file.id)}
                onSelect={() => toggleSelection(file.id)}
                onEdit={() => openEditor(file)}
                onDelete={() => deleteFile(file.id)}
              />
            ))}
          </div>
        ) : (
          <MediaList
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onSelect={toggleSelection}
          />
        )}
      </div>
    </div>
  )
}

// Media Card Component
function MediaCard({ 
  file, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: {
  file: MediaFile
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [showActions, setShowActions] = useState(false)
  
  return (
    <div
      className={cn(
        "relative group rounded-lg border overflow-hidden cursor-pointer transition-all",
        isSelected && "ring-2 ring-blue-500"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100">
        <img
          src={file.thumbnail}
          alt={file.filename}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Info */}
      <div className="p-3">
        <div className="font-medium text-sm truncate">{file.filename}</div>
        <div className="text-xs text-gray-500">
          {formatFileSize(file.size)} • {file.dimensions.width}×{file.dimensions.height}
        </div>
        {file.usedIn.length > 0 && (
          <div className="mt-1 text-xs text-blue-600">
            Used in {file.usedIn.length} page(s)
          </div>
        )}
      </div>
      
      {/* Hover Actions */}
      {showActions && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-2 bg-white rounded-lg hover:bg-gray-100"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(file.url)
            }}
            className="p-2 bg-white rounded-lg hover:bg-gray-100"
            title="Copy URL"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(file.url, '_blank')
            }}
            className="p-2 bg-white rounded-lg hover:bg-gray-100"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 bg-white rounded-lg hover:bg-red-100"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )}
      
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}
```

**Image Editor**:

```typescript
// Component: components/ImageEditor.tsx
// Use: react-easy-crop for cropping

import Cropper from 'react-easy-crop'

export function ImageEditor({ file, onSave, onClose }: {
  file: MediaFile
  onSave: (edited: Blob) => void
  onClose: () => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  
  const handleSave = async () => {
    const croppedImage = await getCroppedImg(
      file.url,
      croppedAreaPixels,
      rotation
    )
    onSave(croppedImage)
  }
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>
        
        {/* Cropper */}
        <div className="relative h-96">
          <Cropper
            image={file.url}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          />
        </div>
        
        {/* Controls */}
        <div className="space-y-4 mt-4">
          <div>
            <label>Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label>Rotation</label>
            <input
              type="range"
              min={0}
              max={360}
              value={rotation}
              onChange={e => setRotation(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <DialogFooter>
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**API Implementation**:

```typescript
// API Route: app/api/media/route.ts

export async function GET() {
  // Scan public/uploads directory
  const uploadsDir = path.join(process.cwd(), 'public/uploads')
  const files = await fs.readdir(uploadsDir)
  
  // Get file stats
  const mediaFiles = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(uploadsDir, filename)
      const stats = await fs.stat(filePath)
      const dimensions = await getImageDimensions(filePath)
      
      // Check usage in content
      const usedIn = await findUsages(filename)
      
      return {
        id: filename,
        filename,
        url: `/uploads/${filename}`,
        thumbnail: `/uploads/thumbnails/${filename}`,
        size: stats.size,
        dimensions,
        uploadedAt: stats.birthtime,
        usedIn
      }
    })
  )
  
  return Response.json({ files: mediaFiles })
}

// Upload endpoint
export async function POST(request: Request) {
  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  
  const uploaded = await Promise.all(
    files.map(async (file) => {
      // Validate
      if (!file.type.startsWith('image/')) {
        throw new Error('Only images allowed')
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large (max 5MB)')
      }
      
      // Save to disk
      const buffer = await file.arrayBuffer()
      const filename = generateUniqueFilename(file.name)
      const filePath = path.join(process.cwd(), 'public/uploads', filename)
      
      await fs.writeFile(filePath, Buffer.from(buffer))
      
      // Generate thumbnail
      await generateThumbnail(filePath)
      
      // Get dimensions
      const dimensions = await getImageDimensions(filePath)
      
      return {
        id: filename,
        filename,
        url: `/uploads/${filename}`,
        thumbnail: `/uploads/thumbnails/${filename}`,
        size: file.size,
        dimensions,
        uploadedAt: new Date(),
        usedIn: []
      }
    })
  )
  
  return Response.json({ uploaded })
}
```

### Acceptance Criteria

- [ ] Media library accessible from navigation
- [ ] Grid and list views both work
- [ ] Search filters files correctly
- [ ] Bulk upload (drag & drop) works
- [ ] Image editor opens and functions
- [ ] Crop, zoom, rotate all work
- [ ] Usage tracking shows correct pages
- [ ] Bulk delete works
- [ ] Performance: Loads 1000+ images smoothly
- [ ] Thumbnails generate automatically
- [ ] Duplicate detection warns user
- [ ] Mobile responsive

---

## REQ-FUTURE-017: Link Validator

**Complexity**: Low | **Priority**: P3 | **Dev Time**: 3-4 hours

### User Story
As a content editor, I want to check all links on a page so I can fix broken links before publishing.

### Requirements

**Core Functionality**:
- "Validate Links" button in page editor toolbar (Lucide icon: Link)
- Scans all links in page content
- Checks internal links (pages exist)
- Checks external links (HTTP status)
- Displays results in modal
- Click result to jump to link in editor

**Link Types to Check**:
1. Internal page links (`/about`, `/events/summer-camp`)
2. External links (`https://example.com`)
3. Anchor links (`#section-id`)
4. Email links (`mailto:info@example.com`)
5. Phone links (`tel:+1234567890`)

**UI Implementation**:

```typescript
// Component: components/LinkValidator.tsx
import { Link, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react'

interface LinkResult {
  url: string
  type: 'internal' | 'external' | 'anchor' | 'email' | 'tel'
  status: 'valid' | 'warning' | 'broken' | 'checking'
  statusCode?: number
  message?: string
  lineNumber?: number
}

export function LinkValidator({ content }: { content: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<LinkResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  
  const handleValidate = async () => {
    setIsOpen(true)
    setIsValidating(true)
    setResults([])
    
    try {
      const response = await fetch('/api/validate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      const { results } = await response.json()
      setResults(results)
    } catch (error) {
      alert('Validation failed: ' + error.message)
    } finally {
      setIsValidating(false)
    }
  }
  
  // Count by status
  const counts = useMemo(() => {
    return results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [results])
  
  return (
    <>
      <button
        onClick={handleValidate}
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
      >
        <Link className="h-4 w-4" />
        <span>Validate Links</span>
      </button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Link Validation Results</DialogTitle>
            <DialogDescription>
              Checked {results.length} links
            </DialogDescription>
          </DialogHeader>
          
          {isValidating ? (
            <div className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
              <p className="mt-4 text-gray-500">Validating links...</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
                  <div className="text-2xl font-bold">{counts.valid || 0}</div>
                  <div className="text-sm text-gray-600">Valid</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600 mb-2" />
                  <div className="text-2xl font-bold">{counts.warning || 0}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mb-2" />
                  <div className="text-2xl font-bold">{counts.broken || 0}</div>
                  <div className="text-sm text-gray-600">Broken</div>
                </div>
              </div>
              
              {/* Results List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50",
                      result.status === 'valid' && "border-green-200 bg-green-50/50",
                      result.status === 'warning' && "border-amber-200 bg-amber-50/50",
                      result.status === 'broken' && "border-red-200 bg-red-50/50"
                    )}
                    onClick={() => jumpToLine(result.lineNumber)}
                  >
                    {/* Status Icon */}
                    {result.status === 'valid' && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                    {result.status === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />}
                    {result.status === 'broken' && <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                    
                    {/* Link Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm truncate">{result.url}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded uppercase">
                          {result.type}
                        </span>
                        {result.statusCode && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {result.statusCode}
                          </span>
                        )}
                        {result.lineNumber && (
                          <span>Line {result.lineNumber}</span>
                        )}
                      </div>
                      {result.message && (
                        <div className="mt-1 text-sm text-gray-600">
                          {result.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <DialogFooter>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border rounded"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

**API Implementation**:

```typescript
// API Route: app/api/validate-links/route.ts

import { extractLinksFromMarkdoc } from '@/lib/link-extractor'
import { checkInternalLink, checkExternalLink, checkAnchorLink } from '@/lib/link-checker'

export async function POST(request: Request) {
  const { content } = await request.json()
  
  // Extract all links from Markdoc content
  const links = extractLinksFromMarkdoc(content)
  
  // Validate each link
  const results = await Promise.all(
    links.map(async (link) => {
      try {
        // Determine link type
        if (link.url.startsWith('/')) {
          // Internal link
          const exists = await checkInternalLink(link.url)
          return {
            url: link.url,
            type: 'internal',
            status: exists ? 'valid' : 'broken',
            message: exists ? 'Page exists' : 'Page not found',
            lineNumber: link.line
          }
        } else if (link.url.startsWith('#')) {
          // Anchor link
          const exists = checkAnchorInContent(content, link.url.slice(1))
          return {
            url: link.url,
            type: 'anchor',
            status: exists ? 'valid' : 'broken',
            message: exists ? 'Anchor exists' : 'Anchor not found',
            lineNumber: link.line
          }
        } else if (link.url.startsWith('mailto:')) {
          // Email link
          const isValid = validateEmail(link.url.slice(7))
          return {
            url: link.url,
            type: 'email',
            status: isValid ? 'valid' : 'broken',
            message: isValid ? 'Valid email' : 'Invalid email format',
            lineNumber: link.line
          }
        } else if (link.url.startsWith('tel:')) {
          // Phone link
          return {
            url: link.url,
            type: 'tel',
            status: 'valid',
            message: 'Phone link',
            lineNumber: link.line
          }
        } else {
          // External link
          const result = await checkExternalLink(link.url)
          return {
            url: link.url,
            type: 'external',
            status: result.status,
            statusCode: result.statusCode,
            message: result.message,
            lineNumber: link.line
          }
        }
      } catch (error) {
        return {
          url: link.url,
          type: 'unknown',
          status: 'broken',
          message: error.message,
          lineNumber: link.line
        }
      }
    })
  )
  
  return Response.json({ results })
}

// Helper: Check external link
async function checkExternalLink(url: string) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Keystatic Link Validator)'
      }
    })
    
    clearTimeout(timeout)
    
    if (response.ok) {
      return {
        status: 'valid',
        statusCode: response.status,
        message: 'Link is accessible'
      }
    } else if (response.status >= 400 && response.status < 500) {
      return {
        status: 'broken',
        statusCode: response.status,
        message: `Client error: ${response.statusText}`
      }
    } else {
      return {
        status: 'warning',
        statusCode: response.status,
        message: `Server error: ${response.statusText}`
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        status: 'warning',
        statusCode: null,
        message: 'Request timeout (slow response)'
      }
    }
    return {
      status: 'broken',
      statusCode: null,
      message: error.message
    }
  }
}

// Helper: Check internal link
async function checkInternalLink(path: string) {
  // Check if page exists in Keystatic
  const slug = path.slice(1) // Remove leading /
  const reader = keystatic.reader()
  
  try {
    const page = await reader.collections.pages.read(slug)
    return !!page
  } catch {
    return false
  }
}

// Helper: Check anchor
function checkAnchorInContent(content: string, anchor: string) {
  // Look for heading with matching ID
  const regex = new RegExp(`^#{1,6}\\s+.*${anchor}`, 'm')
  return regex.test(content)
}

// Helper: Validate email
function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
```

### Acceptance Criteria

- [ ] "Validate Links" button visible in editor
- [ ] Modal opens with loading state
- [ ] All link types validated correctly
- [ ] Results categorized by status (valid/warning/broken)
- [ ] Click result jumps to link in editor
- [ ] External link timeout set to 5s
- [ ] Rate limiting for external checks (max 50 concurrent)
- [ ] Error handling (timeout, network errors)
- [ ] Performance: Validates 100 links in <10s
- [ ] Mobile responsive

---

## REQ-FUTURE-019: Image Alt Text Suggestions

**Complexity**: Low | **Priority**: P3 | **Dev Time**: 3-4 hours

### User Story
As a content editor, I want AI-generated alt text suggestions so I can improve accessibility without extra effort.

### Requirements

**Core Functionality**:
- "Suggest Alt Text" button on image upload fields
- Button icon: Wand2 (Lucide)
- Uses Claude API with vision to analyze image
- Generates descriptive, concise alt text
- Pre-fills alt text field (user can edit)
- Warning indicator if alt text missing on save

**UI Implementation**:

```typescript
// Component: components/AltTextSuggester.tsx
import { Wand2, Loader2, AlertTriangle } from 'lucide-react'

export function AltTextSuggester({ 
  imageUrl, 
  onSuggest 
}: { 
  imageUrl: string
  onSuggest: (altText: string) => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/suggest-alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      })
      
      const { altText } = await response.json()
      onSuggest(altText)
    } catch (error) {
      alert('Failed to generate alt text: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
      title="Generate alt text with AI"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          <span>Suggest Alt Text</span>
        </>
      )}
    </button>
  )
}

// Integrate into image field
export function ImageField({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      {/* Image upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* Preview */}
      {value?.url && (
        <div className="relative">
          <img src={value.url} alt={value.alt || ''} className="max-w-md rounded" />
        </div>
      )}
      
      {/* Alt text field */}
      <div>
        <label className="flex items-center justify-between mb-2">
          <span>Alt Text</span>
          {value?.url && (
            <AltTextSuggester
              imageUrl={value.url}
              onSuggest={(altText) => onChange({ ...value, alt: altText })}
            />
          )}
        </label>
        <input
          type="text"
          value={value?.alt || ''}
          onChange={e => onChange({ ...value, alt: e.target.value })}
          placeholder="Describe this image for screen readers"
          className="w-full px-3 py-2 border rounded"
          maxLength={125}
        />
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span>{value?.alt?.length || 0}/125 characters</span>
          {(!value?.alt || value.alt.trim() === '') && (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              Alt text required
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

**API Implementation**:

```typescript
// API Route: app/api/suggest-alt-text/route.ts

import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const { imageUrl } = await request.json()
  
  // Rate limiting: 10 generations per user per hour
  const userIp = request.headers.get('x-forwarded-for')
  const rateLimit = await checkRateLimit(userIp, 10, 3600)
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded' }, 
      { status: 429 }
    )
  }
  
  // Fetch image
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')
  const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg'
  
  // Call Claude API with vision
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Image
          }
        },
        {
          type: 'text',
          text: `Describe this image for screen reader alt text. Requirements:
- Be descriptive and concise (1-2 sentences)
- Maximum 125 characters
- Focus on important visual details
- Don't start with "Image of" or "Photo of"
- Use present tense
- Be objective, not subjective

Return ONLY the alt text, nothing else.`
        }
      ]
    }]
  })
  
  const altText = message.content[0].text.trim()
  
  // Validate length
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...'
  }
  
  return Response.json({ altText })
}
```

**System Prompt Guidelines**:
- **Descriptive**: Mention key subjects, actions, setting
- **Concise**: 1-2 sentences, <125 chars
- **Objective**: Facts, not interpretations
- **Context-aware**: Consider surrounding content (future enhancement)
- **Accessible**: Clear, plain language

**Example Outputs**:
- Input: Photo of person on mountain bike
- Output: "Person riding mountain bike on forest trail with trees in background"

- Input: Company logo
- Output: "Bear Lake Camp logo with mountain silhouette and pine trees"

- Input: Product photo
- Output: "Black water bottle with stainless steel cap and camp logo"

### Acceptance Criteria

- [ ] "Suggest Alt Text" button appears on image fields
- [ ] Button disabled during generation
- [ ] Loading spinner shows during API call
- [ ] Generated alt text pre-fills field
- [ ] User can edit suggested text
- [ ] Alt text limited to 125 characters
- [ ] Warning shows if alt text missing
- [ ] Rate limiting prevents abuse (10/hour)
- [ ] Works for JPEG, PNG, WebP images
- [ ] Error handling (API failures, unsupported formats)
- [ ] Cost tracking logged

### Cost Analysis

**Per Request**:
- Claude API (vision): ~$0.002 per image
- Average user: 5-10 images per session

**Monthly Cost** (10 active users):
- 10 users × 20 sessions/month × 7 images/session = 1,400 images
- 1,400 × $0.002 = $2.80/month

**Rate Limiting**:
- 10 generations per user per hour
- 100 generations per user per day
- Prevents abuse while allowing normal use

---

## Implementation Priority Summary

| Requirement | Priority | Complexity | Dev Hours | Quick Win |
|-------------|----------|------------|-----------|-----------|
| REQ-FUTURE-020: Dark Mode | P3 (First) | Low | 2-3 | ✓ |
| REQ-FUTURE-013: Recent Pages | P3 | Low | 3-4 | ✓ |
| REQ-FUTURE-014: Content Stats | P3 | Low | 2-3 | ✓ |
| REQ-FUTURE-017: Link Validator | P3 | Low | 3-4 | ✓ |
| REQ-FUTURE-019: Alt Text AI | P3 | Low | 3-4 | ✓ |
| REQ-FUTURE-015: Quick Insert | P3 | Low | 5-6 | ✓ |
| REQ-FUTURE-002: Version History | P3 | Medium | 10-12 | |
| REQ-FUTURE-005: Analytics | P3 | Medium | 8-10 | |
| REQ-FUTURE-007: Media Library | P3 | Medium | 10-12 | |
| REQ-FUTURE-001: AI Assistant | P3 | Medium | 12-16 | |

**Total Estimated Hours**: 61-77 hours

---

## Notes for Claude Code Team

1. **All requirements use Lucide React icons** - Import from `lucide-react`
2. **Tailwind CSS for all styling** - No custom CSS files
3. **Dark mode support required** - Use `dark:` prefix for all components
4. **TypeScript strict mode** - No `any` types
5. **API routes follow Next.js App Router convention** - `/app/api/[endpoint]/route.ts`
6. **Error handling required for all API calls** - Toast notifications for errors
7. **Rate limiting on all AI features** - Use Redis or Supabase for tracking
8. **Accessibility required** - ARIA labels, keyboard navigation, screen reader support
9. **Mobile responsive** - Test on mobile, tablet, desktop
10. **Performance benchmarks** - Lighthouse score >90, no layout shifts

**Environment Variables to Add**:
```bash
ANTHROPIC_API_KEY=
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
GITHUB_TOKEN=
```