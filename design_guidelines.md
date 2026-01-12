# Design Guidelines: 일단만들어 (Just Make It) LMS Platform

## Design Approach

**System Selected**: Material Design 3 with educational platform optimizations
**Rationale**: Content-rich learning platform requiring clear hierarchy, familiar patterns, and accessibility for diverse technical skill levels.

## Typography System

**Font Stack**: 
- Korean: Noto Sans KR (400, 500, 700)
- English/Numbers: Inter (400, 500, 600, 700)
- Load via Google Fonts CDN

**Scale**:
- Hero/Page Titles: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base (16px)
- Metadata/Captions: text-sm text-gray-600

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: py-8 md:py-12
- Card gaps: gap-6 md:gap-8
- Element margins: mb-4, mb-6, mb-8

**Container Widths**:
- Global wrapper: max-w-7xl mx-auto px-4 md:px-6
- Content sections: max-w-6xl
- Reading content: max-w-4xl

**Grid System**:
- Assignment cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

## Core Components

### Navigation Bar (GNB)
- Fixed top position with subtle shadow
- Height: h-16 md:h-20
- Logo left (text-xl font-bold), horizontal tab navigation center, auth buttons right
- Tabs: Responsive horizontal scroll on mobile, full width on desktop
- Active tab indicator: Bottom border accent

### Tab Content Container
- Two-section vertical split for weekly pages
- Top section (Learning Area): Distinct background, p-6 md:p-8 rounded-lg mb-8
- Bottom section (Assignment Board): Standard background, full width

### Learning Area (Top Section)
**Layout**: 
- Week title: text-3xl font-bold mb-6
- Video embed: 16:9 aspect ratio, max-w-4xl, rounded-lg shadow-lg
- Progress indicator: Inline with title, badge style with percentage
- Resource button: Primary button below video (Download Materials)

**Video Player**:
- Responsive YouTube embed
- Shadow: shadow-2xl for depth
- Border radius: rounded-xl

### Assignment Board (Bottom Section)
**Header**:
- "수강생 과제" title left, "글쓰기" button right
- Spacing: flex justify-between items-center mb-6

**Card Grid**:
- Three columns desktop, two tablet, one mobile
- Each card: Rounded borders, subtle shadow, p-6
- Card content: Title (font-semibold mb-2), Author name (text-sm text-gray-600), Date (text-xs text-gray-500)
- Hover state: Slight elevation increase (shadow-md to shadow-lg)

### Post Editor Modal
**Template Display**:
- Full-screen overlay on mobile, centered modal (max-w-3xl) on desktop
- Pre-filled markdown template visible immediately
- Toolbar: Simple formatting buttons (bold, italic, link)
- Action buttons: Bottom right, "취소" (secondary) + "게시" (primary)

### Comment Section
**Layout**:
- Under post content with divider (border-t pt-6 mt-6)
- Comment input: Textarea with rounded border, p-4
- Comments list: Stacked with spacing (space-y-4)
- Each comment: Avatar left (if implemented), content right, timestamp below

### Admin Panel
**Table Layout**:
- Full-width responsive table with striped rows
- Column headers: font-semibold bg-gray-50
- Action buttons: Small size, minimal style in last column
- Forms: Two-column grid for input fields (grid-cols-1 md:grid-cols-2 gap-4)

### Authentication Pages
**Layout**: Centered card (max-w-md mx-auto), generous padding (p-8)
- Logo/title at top center
- Form fields: Stack vertically with mb-4 spacing
- Input fields: Full width, h-12, rounded borders, p-4
- Submit button: Full width, prominent primary style
- Secondary links: text-sm text-center mt-4

## Button System
- Primary: Solid fill, medium padding (px-6 py-3), rounded-lg, font-medium
- Secondary: Outlined style, same padding
- Small variant: px-4 py-2, text-sm
- Icon buttons: Square (h-10 w-10), centered icon

## Card Components
**Standard Card**:
- Border: border border-gray-200 rounded-lg
- Padding: p-6
- Shadow: shadow-sm hover:shadow-md transition
- Background: White/neutral

**Featured Card** (for weeks):
- Enhanced shadow: shadow-lg
- Larger padding: p-8
- Potential gradient or accent border

## Form Elements
- Input height: h-12
- Textarea: min-h-32
- Rounded corners: rounded-lg
- Focus states: ring-2 ring-blue-500
- Labels: font-medium mb-2 block

## Progress Indicator
- Badge style: inline-flex items-center px-3 py-1 rounded-full
- Text: font-medium text-sm
- Icon: Small checkmark or percentage symbol

## Images
**Hero Section**: Not applicable - this is a utility-focused platform
**Thumbnails**: Course material previews if available (aspect-ratio-video, rounded corners)
**Avatars**: Circular, 32px or 40px, placeholder for users without photos

## Icons
**Library**: Heroicons (outline for general use, solid for active states)
**Usage**: 
- Navigation tabs (20px icons)
- Buttons with text (16px left of text)
- Status indicators (16px)

## Responsive Behavior
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Horizontal scroll for tabs on mobile with snap-scroll
- Stack all two-column layouts to single column on mobile
- Reduce padding/margins by 25-50% on mobile

## Accessibility
- All interactive elements keyboard navigable
- Focus visible states with outline
- ARIA labels for icon-only buttons
- Semantic HTML (nav, main, article, section)
- Minimum touch target: 44px