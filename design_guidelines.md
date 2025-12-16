# NamanDarshan Design Guidelines

## Architecture Decisions

### Authentication
**Required** - The app has two distinct user roles requiring authentication:
- **User (Devotee)** - Browse services and create booking requests with budget offers
- **Pandit (Priest)** - View requests and respond with acceptance or counter-offers

**Implementation:**
- Login screen with role toggle (User/Pandit)
- Include sign-up flow for both roles
- SSO preferred: Include Apple Sign-In (iOS) and Google Sign-In
- Profile screen includes logout and delete account options

### Navigation Architecture
**Bottom Tab Navigation (4 tabs):**
1. **Home** - Browse temples, pujas, and packages
2. **Services** - Service catalog and details
3. **My Bids** (Central Hub) - Request status and negotiation (User role) OR Live Market feed (Pandit role)
4. **Profile** - User/Pandit profile and settings

**Note:** The "My Bids" tab shows different content based on user role.

## Screen Specifications

### 1. Login/Signup Screen (Stack-Only)
- **Layout:**
  - Role toggle at top (User/Pandit) with prominent visual distinction
  - SSO buttons (Apple, Google)
  - Email/password fields below
  - Switch between Login/Signup modes
- **Header:** None (full screen)
- **Safe Area:** Top and bottom insets

### 2. Home Screen (Tab: Home)
- **Purpose:** Browse temples, pujas, and packages
- **Layout:**
  - Transparent header with greeting
  - Scrollable main content
  - Premium cards showcasing temples and puja services
- **Components:** 
  - Search bar in header
  - Service cards with images, titles, and starting prices
  - Featured temple carousel
- **Safe Area:** Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 3. Services Screen (Tab: Services)
- **Purpose:** Detailed service catalog
- **Layout:**
  - Default navigation header with title "Services"
  - List/Grid view of all available pujas and packages
- **Components:**
  - Filter/sort controls
  - Service cards with category tags
- **Safe Area:** Standard with tab bar

### 4. My Bids Screen - User View (Tab: My Bids)
- **Purpose:** Central hub for viewing request status and managing negotiations
- **Layout:**
  - Header with title "My Bids"
  - List of user's open and completed requests
- **Components:**
  - **Status Indicator Cards** with color-coded badges:
    - **Yellow badge:** "Waiting for Pandits" (pending)
    - **Green badge:** "Accepted!" (ready to pay)
    - **Blue badge:** "Counter Offer Received" (negotiation)
  - Each card shows: Service name, Date/Time, User's offered price
  - Counter-offer cards display: "Pandit [Name] asks ₹[amount]"
  - **Action Buttons:**
    - Green "Accept Deal" button (for counter-offers)
    - "Pay Now" button (for accepted requests)
- **Safe Area:** Standard with tab bar

### 5. Live Market Screen - Pandit View (Tab: My Bids)
- **Purpose:** Feed of incoming user requests
- **Layout:**
  - Header with title "Live Market"
  - Scrollable feed of request cards
- **Components:**
  - **Request Cards showing:**
    - Puja name and temple
    - Date/Time
    - **User Offer Price** (prominent display with ₹ symbol)
  - **Two Action Buttons per card:**
    - **Green "Accept @ ₹[amount]"** button (instantly confirms)
    - **Orange "Counter Offer"** button (opens input modal)
- **Safe Area:** Standard with tab bar

### 6. Booking/Request Creation Flow (Modal/Stack)
- **Purpose:** User creates puja booking request
- **Layout:**
  - Multi-step form (Service → Date/Time → Budget)
  - Submit and Cancel buttons in header
- **Components:**
  - Service selection (with preview image)
  - Date picker
  - Time slot selector
  - **Budget Input Field:**
    - Label: "अपना Budget बताएं" (Enter Your Offer Price)
    - Large, prominent number input with ₹ symbol
    - Helper text suggesting price range
  - Submit button: "Post Request"
- **Safe Area:** Top inset only (no tab bar)

### 7. Counter Offer Modal (Pandit)
- **Purpose:** Pandit submits higher price
- **Layout:**
  - Centered modal overlay
  - Shows original user offer
  - Input for counter amount
- **Components:**
  - Original price display (crossed out)
  - Counter price input (large, prominent)
  - "Submit Counter Offer" button (orange)
  - Cancel button
- **Safe Area:** Center screen, dimmed background

### 8. Profile Screen (Tab: Profile)
- **Purpose:** User/Pandit account management
- **Layout:**
  - Avatar and name at top
  - Scrollable settings list
- **Components:**
  - Avatar (editable)
  - Display name
  - Contact details
  - App preferences
  - Logout button
  - Delete account (nested in Settings)
- **Safe Area:** Standard with tab bar

## Design System

### Color Palette (Divine & Premium Theme)
- **Primary:** Saffron (#FF9933) - Main CTAs and brand elements
- **Secondary:** Deep Saffron (#CC6600) - Pressed states, emphasis
- **Accent:** Gold (#FFD700) - Premium highlights, badges
- **Background:** 
  - White (#FFFFFF) - Primary background
  - Light Cream (#FFF8F0) - Card backgrounds
- **Status Colors:**
  - Success Green (#10B981) - "Accept" buttons, confirmed bookings
  - Warning Yellow (#F59E0B) - Pending status
  - Info Blue (#3B82F6) - Counter-offer status
  - Counter Orange (#F97316) - "Counter Offer" button
- **Text:**
  - Primary: #1F2937 (dark gray)
  - Secondary: #6B7280 (medium gray)
  - Inverted: #FFFFFF (on colored backgrounds)

### Typography
- **Font Family:** System default (San Francisco for iOS, Roboto for Android)
- **Headings:**
  - H1: 32px, Bold - Screen titles
  - H2: 24px, Semibold - Section headers
  - H3: 20px, Semibold - Card titles
- **Body:**
  - Large: 18px, Regular - Primary content
  - Medium: 16px, Regular - Secondary content
  - Small: 14px, Regular - Helper text
- **Price Display:**
  - Large: 28px, Bold - User offer/counter-offer amounts
  - Medium: 20px, Semibold - Card prices

### Component Specifications

#### Cards
- **Background:** Light Cream with subtle shadow
- **Border Radius:** 12px
- **Padding:** 16px
- **Shadow (Elevated Cards):**
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 8
- **Touchable Feedback:** Scale to 0.98 on press

#### Buttons
- **Primary (Accept/Submit):**
  - Background: Success Green (#10B981)
  - Text: White, 16px, Semibold
  - Height: 48px
  - Border Radius: 8px
  - Full-width on forms, auto-width in cards
- **Secondary (Counter Offer):**
  - Background: Counter Orange (#F97316)
  - Same specs as Primary
- **Tertiary (Cancel):**
  - Background: Transparent
  - Border: 1px solid #D1D5DB
  - Text: Primary text color

#### Status Badges
- **Size:** Auto-width, 28px height
- **Border Radius:** 14px (pill shape)
- **Padding:** 8px horizontal, 4px vertical
- **Font:** 12px, Semibold
- **Colors:** Yellow, Green, or Blue per status

#### Price Display
- **Container:** Highlighted box with gold border (2px)
- **Background:** Light gold tint (#FFF9E6)
- **Font:** 28px, Bold
- **Symbol:** ₹ prefix with 80% opacity
- **Layout:** Center-aligned in negotiation contexts

#### Input Fields
- **Background:** White with border (#E5E7EB)
- **Height:** 48px
- **Border Radius:** 8px
- **Focus State:** Saffron border (#FF9933)
- **Label:** 14px, Medium, above field
- **Placeholder:** 16px, #9CA3AF

### Visual Design

#### Icons
- **Library:** Lucide-react-native
- **Size:** 24px standard, 20px in compact contexts
- **Color:** Inherit from parent or primary text color
- **Common Icons:**
  - Home: home
  - Services: briefcase
  - My Bids: shopping-cart
  - Profile: user
  - Accept: check-circle
  - Counter: arrow-up-circle

#### Assets Required
1. **Temple Images:** 3-5 high-quality photos of famous Indian temples (placeholder URLs acceptable)
2. **Puja Service Icons:** Custom or stock icons for common pujas (e.g., Abhishek, Aarti, Havan)
3. **Default Avatar:** 1 preset avatar with divine theme (lotus or om symbol)
4. **Splash Screen:** NamanDarshan logo on saffron gradient background

#### Interaction Design
- **Touchable Feedback:** All buttons and cards scale on press
- **Loading States:** Spinner with saffron color during API calls
- **Empty States:** Illustrative message for no bids/requests
- **Confirmation Alerts:** 
  - Accept deal: "Confirm booking at ₹[amount]?"
  - Counter-offer: "Send counter offer of ₹[amount]?"
- **Success Animations:** Subtle checkmark animation on deal acceptance

### Accessibility
- **Minimum Touch Target:** 44x44px for all interactive elements
- **Color Contrast:** WCAG AA compliant (4.5:1 for text)
- **Labels:** Clear aria-labels for screen readers
- **Price Announcements:** Screen readers announce full amount with currency

### Spacing System
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px