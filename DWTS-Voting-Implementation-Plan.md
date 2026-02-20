# Dancing With The (UBC Dance Club) Stars - Day-by-Day Implementation Plan

## Event Details

- **Event:** Dancing With The (UBC Dance Club) Stars
- **Date:** Saturday, February 21st, 2026 at 5:00 PM
- **Development Start:** Monday, February 17th, 2026
- **Time Available:** 4 days

## 🎯 Project Overview

### What You're Building

A professional ballroom dancing competition voting system with:

- **Theme:** Dancing with the Stars aesthetic (disco ball, gold stars, purple curtain background)
- **6 Judge Scoring System:** You input all 6 judges' scores individually or as a single combined score
- **Audience Voting:** 100+ audience members vote yes/no for couples
- **50/50 Weighted Scoring:** Judge scores (max 50) + Audience scores (max 50) = Final score (max 100)
- **Admin Dashboard:** Real-time vote tracking, competitor management with headshots
- **Grand Reveal Presentation Mode:** Animated bar chart with manual reveals, separate audience/judge score display, top 3 podium with confetti

### Tech Stack

- **Frontend:** Vite + TypeScript + Tailwind CSS
- **Backend:** Firebase (Firestore database, Hosting)
- **Image Storage:** Base64-encoded images stored in Firestore (no Firebase Storage needed - stays in free tier)
- **Design:** Dancing with the Stars theme (purple, gold, sparkles, disco ball motifs)
- **Dev Server:** Vite (`npm run dev` on http://localhost:5000)

## 📅 Day-by-Day Timeline

### Day 0 - Friday, February 14th (TODAY) - 30 mins

Optional prep work before starting on Monday

**Tasks:**

- Read through this entire implementation plan
- Create a Google account if you don't have one (needed for Firebase)
- Bookmark Firebase Console: https://console.firebase.google.com/
- **✅ COMPLETED:** Download and install Node.js: https://nodejs.org/ (LTS version)
- **✅ COMPLETED:** Install a code editor if needed: VS Code (https://code.visualstudio.com/)

### Day 1 - Monday, February 17th - Setup Day (2-3 hours)

#### Morning Session (1 hour) - Firebase Setup

#### Step 1: Create Firebase Project (15 mins)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Project name: `DWTS-Voting`
4. Disable Google Analytics (not needed)
5. Click "Create project"
6. Wait for project creation

#### Step 2: Set Up Firestore Database (15 mins)

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in test mode" (we'll secure it later)
4. Choose location: `us-west1` (closest to Vancouver)
5. Click "Enable"
6. Wait for database to be ready

#### Step 3: Get Firebase Configuration (15 mins)

1. Click the gear icon ⚙️ (top left) > "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app:
   - App nickname: `dancing-stars-web`
   - Don't check "Firebase Hosting"

5. Copy the entire firebaseConfig object - save it in a note file:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "dwts-voting.firebaseapp.com",
  projectId: "dwts-voting",
  storageBucket: "dwts-voting.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...",
};
```

6. Click "Continue to console"

> **Note:** We're NOT using Firebase Storage (requires paid plan). Instead, we'll store images as Base64 strings in Firestore, which is included in the free tier and perfect for headshot images.

#### Step 4: Install Firebase CLI (10 mins)

Open Terminal (Mac) or Command Prompt (Windows):

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version

# Login to Firebase
firebase login
```

A browser window will open - sign in with your Google account.

#### Afternoon Session (1-2 hours) - Project Setup

#### Step 5: Create Project Structure (15 mins)

**✅ COMPLETED - Modern setup with Vite + TypeScript + Tailwind is now complete!**

Your project now has:

- ✅ Vite for fast development and bundling
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Firebase SDK integration
- ✅ Organized source code structure

To start development:

```bash
cd c:\Users\yalvi\Projects\DWTS-Voting

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

This will start a local server at http://localhost:5000 with:

- Hot module replacement (instant updates)
- TypeScript Project Structure Overview (5 mins)

**✅ COMPLETED - Your project structure:**

```
dwts-voting/
├── src/
│   ├── main.ts              (Entry point for voting page)
│   ├── admin.ts             (Entry point for admin dashboard)
│   ├── firebase.ts          (Firebase configuration)
│   ├── types.ts             (TypeScript interfaces)
│   ├── utils.ts             (Utility functions)
│   └── style.css            (Tailwind CSS + custom styles)
├── public/                  (Build output - auto-generated)
├── index.html               (Voting page template)
├── admin.html               (Admin dashboard template)
├── package.json             (Dependencies)
├── vite.config.ts           (Vite configuration)
├── tailwind.config.js       (Tailwind configuration)
├── tsconfig.json            (TypeScript configuration)
├── .firebaserc              (Firebase project link)
├── firebase.json            (Firebase hosting config)
├── firestore.rules          (Security rules)
└── CONTEXT_FOR_AI.md        (AI assistant context)
```

**Important:** Always run `npm run dev` to start the development server! └── admin.html (Admin dashboard)
├── .firebaserc
├── firebase.json
├── firestore.rules
└── firestore.indexes.json

````

#### Step 7: Configure Firestore Rules (10 mins)

Edit `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /competitions/{competitionId} {
      allow read: if true;
      allow write: if true; // For testing - will secure later

      match /couples/{coupleId} {
        allow read: if true;
        allow write: if true;
      }

      match /votes/{voteId} {
        allow read: if true;
        allow create: if true;
        allow update, delete: if false;
      }

      match /judgeScores/{judgeScoreId} {
        allow read: if true;
        allow write: if true;
**✅ COMPLETED**

Security rules have been deployed to Firebase. If you need to redeploy:

```bash
firebase deploy --only firestore:rules
````

**Note:** On Windows PowerShell, if you get execution policy errors, use:

````bash
cmd /Step 9: Configure Firebase in Your Code (15 mins)

**IMPORTANT:** You need to add your Firebase configuration!

1. Go to https://console.firebase.google.com/project/dwts-voting-3a145/settings/general
2. Scroll to "Your apps" section
3. If you don't see a web app, click "Add app" → Web icon `</>`
4. Copy your `firebaseConfig` object
5. Open `src/firebase.ts` in your project
6. Replace the placeholder config with your actual config

```typescript
// src/firebase.ts
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "dwts-voting-3a145.firebaseapp.com",
  projectId: "dwts-voting-3a145",
  storageBucket: "dwts-voting-3a145.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
````

6. Save the file
7. Test the connection:

```bash
npm run dev
```

Open http://localhost:5000 and check the browser console (F12) for any errors.

**✅ Day 1 Complete!** You now have a modern development environment with:

- ✅ Firebase project configured
- ✅ Vite dev server running
- ✅ TypeScript + Tailwind CSS ready
- ✅ Security rules deployed
- ✅ Ready to build features on Day 2!udge Score Component: (Average of 6 judges' scores) \* 0.5 = Max 50 points
- Audience Score Component: (Yes votes / Total audience votes) \* 50 = Max 50 points
- Final Score: Judge Component + Audience Component = Max 100 points

### Design Requirements

- Colors: Purple (#5B3A8B, #764BA2), Gold (#D4AF37, #FFD700)
- Elements: Disco ball, sparkles, stars, purple curtain background
- Font: Elegant, show-style fonts
- Mobile responsive
- **Image Handling:** Base64-encoded images stored in Firestore, compressed to < 100KB

``

### Day 2 - Tuesday, February 18th - Build Core Features (4-5 hours)

#### Morning Session (2-3 hours) - Admin Dashboard

#### Step 10: Create Admin Dashboard HTML Structure (30 mins)

**✅ COMPLETED - Basic structure is ready!**

The admin dashboard (`admin.html`) now has:
- ✅ All 5 tabs with Tailwind styling
- ✅ Tab switching functionality in `/src/admin.ts`
- ✅ Responsive layout with Dancing with the Stars theme
- ✅ TypeScript for type-safe development

**Next:** Build out each tab's functionality using TypeScript + Firebase SDK.

To test: `npm run dev` and visit http://localhost:5000/admin.html

#### Step 11: Build Couple Management System (45 mins)

**Tell your AI assistant:**

In `/src/admin.ts`, create the "Manage Couples" tab functionality:

- Form to add couples (couple name input + headshot file upload)
- Display all couples in a grid with Tailwind CSS
- Edit couple name functionality
- Delete couple functionality
- Use Firebase Firestore (`collection`, `addDoc`, `deleteDoc`, `updateDoc`)
- Import and use `compressAndConvertToBase64()` from `/src/utils.ts`
- Use TypeScript interfaces from `/src/types.ts`

**Database path:** `/competitions/dwts-feb-2026/couples/`
**Image field:** Store as `headshot: "data:image/jpeg;base64,/9j/4AAQ..."` in the couple document

**Key TypeScript imports:**
```typescript
import { db, COMPETITION_ID } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { compressAndConvertToBase64 } from './utils';
import type { Couple } from './types';
````

**Styling:** Use Tailwind utility classes (already configured with purple/gold theme)

#### Step 12: Build Judge Scoring Interface (45 mins)

**Tell your AI assistant:**

In admin.html, create the "Judge Scores" tab with:

- Two input modes:
  1. Individual mode: 6 input fields (0-100) for each judge, auto-calculates average
  2. Quick mode: Single input field for combined judge score (0-100)
- Display all couples with their current judge scores
- Save scores to Firebase in real-time
- Visual feedback when scores are saved

**Database path:** `/competitions/dwts-feb-2026/couples/{coupleId}`
**Field:** `judgeScore` (stores the average or combined score as a number 0-100)

#### Step 13: Build Real-Time Dashboard (45 mins)

**Tell your AI assistant:**
`/src/admin.ts`, create the "Judge Scores" tab functionality:
`/src/admin.ts`, create the "Dashboard" tab with real-time statistics:

- Total votes submitted
- Total unique voters
- Votes per couple (styled with Tailwind)
- List of voters with timestamps
- **Use Firestore listeners (`onSnapshot`) for real-time updates**

**Firebase imports needed:**

```typescript
import { collection, query, onSnapshot } from "firebase/firestore";
```

Count documents in `/competitions/dwts-feb-2026/votes/` and display aggregate data with Tailwind components.

````typescript
interface Couple {
  id: string;
  name: string;
  judgeScore?: number;
  // ...
In `/src/main.ts`, build the voting page functionality:

- Fetch couples from Firestore using `getDocs()`
- Dynamically generate couple cards with Tailwind CSS
- Each couple card shows:
  - Couple number (1, 2, 3...)
  - Couple name
  - Headshot image (use the Base64 data URI from Firestore)
  - Yes/No voting buttons (Tailwind styled)
- Optional voter name input at the top
- Submit All Votes button
- Success message after voting (Tailwind alert)
- Check voting status before allowing submission
- Mobile-responsive grid layout (already configured in Tailwind)

**Fetch couples from:** `/competitions/dwts-feb-2026/couples/`
**Submit votes to:** `/competitions/dwts-feb-2026/votes/`

**TypeScript types:**
```typescript
import type { Couple, Vote } from './types';
````

The Dancing with the Stars theme (purple gradient, gold accents) is already applied via Tailwind config!

- Couple number (1, 2, 3...)
- Couple name
- Headshot image (Base64 data from Firestore - use img src with the Base64 string)
- Yes/No voting buttons (styled beautifully)
- Optional voter name input at the top
- Submit All Votes button at the bottom
- Success message after voting
- Purple curtain background with gold stars scattered
- Responsive design for mobile phones

**Fetch couples from:** `/competitions/dwts-feb-2026/couples/`
**Submit votes to:** `/competitions/dwts-feb-2026/votes/`

#### Step 15: Implement Vote Submission (30 mins)

**Tell your AI assistant:**

In index.html, implement vote submission:

- Collect all yes/no votes for each couple
- Store vote document in Firestore with structure:

```javascript
{
  voterName: string (or "Anonymous"),
  timestamp: serverTimestamp(),
  votes: {
    couple_1: "yes",
    couple_2: "no",
    // ...
  }
}
```

````

- Show confirmation message
- Prevent duplicate voting from same device (use localStorage)
- Clear form after submission

#### Evening Session (30 mins) - Testing

#### Step 16: Test Core Features (30 mins)

**Manual testing checklist:**

- [ ] Run `npm run dev` to start development server
- [ ] Open http://localhost:5000/admin.html - can you add a couple?
- [ ] Upload a test headshot image - does it compress and save?
- [ ] Enter judge scores - do they save to Firestore?
- [ ] Open http://localhost:5000 - do couples display with headshots?
- [ ] Submit a test vote - does it appear in admin dashboard?
- [ ] Check real-time updates - submit vote from phone, see it in admin
- [ ] Test on mobile phone browser - does voting page work well?
- [ ] Check TypeScript compilation - any errors in terminal?

### Day 3 - Wednesday, February 19th - Build Presentation Mode (4-5 hours)

#### Morning Session (2-3 hours) - Animated Bar Chart

#### Step 17: Create Presentation Mode Tab (45 mins)

**Tell your AI assistant:**

In admin.html, create a new "Presentation Mode" tab with:

- Full-screen black background with purple curtain overlay
- Title: "Dancing With The (UBC Dance Club) Stars - Results"
- Empty animated bar chart area (horizontal bars)
- Control panel at bottom (visible only to admin):
  - List of all couples with "Reveal Audience" and "Reveal Judges" buttons
  - "Show Podium" button (disabled until all revealed)
- Use CSS Grid for bar chart layout
- Bars should animate from left to right when revealed

#### Step 18: Implement Bar Chart Animation (60 mins)

Tell your AI assistant:
In the Presentation Mode tab, implement animated horizontal bar chart:

For each couple:

- Initially: Show couple name and number, bar is invisible/zero width
- When "Reveal Audience" clicked:
  - Audience bar (purple color) animates from 0 to their audience score (out of 50)
  - Show score number next to bar
  - Bar moves horizontally to position based on rank
  - Animation duration: 2 seconds
- When "Reveal Judges" clicked:
  - Judges bar (gold color) appears stacked on top of audience bar
  - Animates from 0 to judge score (out of 50)
  - Combined bar repositions based on new total rank
  - Animation duration: 2 seconds

Bar positioning:

- Bars should automatically reorder vertically based on total score (highest on top)
- Use CSS transitions for smooth movement
- Maximum bar width represents score of 50 (for each component)

Style:

- Audience bars: Purple gradient
- Judge bars: Gold gradient
- Show score labels clearly (white text)
- Couple names on the left side

#### Step 19: Calculate and Normalize Scores (30 mins)

**Tell your AI assistant:**

Create JavaScript functions for score calculation:

1. calculateAudienceScore(coupleId, votes):
   - Count yes votes for this couple
   - Total audience votes = total number of vote documents
   - Audience score = (yes votes / total votes) \* 50
   - Return normalized score (0-50)

2. getJudgeScore(coupleId, couples):
   - Fetch judgeScore from couple document (already 0-100)
   - Normalize to 0-50: judgeScore \* 0.5
   - Return normalized score (0-50)

3. calculateFinalScore(audienceScore, judgeScore):
   - Return audienceScore + judgeScore (max 100)

4. rankCouples(couples, votes):
   - Calculate final score for all couples
   - Sort by final score descending
   - Return ranked array with positions

#### Afternoon Session (1.5-2 hours) - Podium & Confetti

#### Step 20: Create Winner Podium (45 mins)

**Tell your AI assistant:**

In Presentation Mode, create a podium reveal animation:

After all couples are revealed, show "Show Podium" button.
When clicked:

- Bar chart fades out (2 seconds)
- Podium fades in (2 seconds)
- Display top 3 couples on podium:
  - 1st place: Highest platform (center)
  - 2nd place: Medium platform (left)
  - 3rd place: Lowest platform (right)
- Each position shows:
  - Couple headshot
  - Couple name
  - Final score (out of 100)
  - Trophy/medal icon (🥇 🥈 🥉)
- Elegant font and styling
- Gold confetti animation starts

Style:

- Podium colors: Gold (1st), Silver (2nd), Bronze (3rd)
- Platform heights: 1st tallest, 2nd medium, 3rd shortest
- Center 1st place for prominence

#### Step 21: Add Confetti Animation (45 mins)

**Tell your AI assistant:**

Create a confetti animation that plays when podium is revealed:

Use Canvas API or CSS animations:

- Gold and purple confetti pieces
- Fall from top of screen
- Random horizontal drift
- Fade out at bottom
- Continuous animation for 10 seconds
- Particle count: ~150 pieces
- Different shapes: circles, squares, stars

**Alternative:** Use a lightweight confetti library like canvas-confetti:

```html
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
```

Trigger confetti when podium appears with custom colors (gold `#FFD700`, purple `#764BA2`).

#### Evening Session (30 mins) - Presentation Mode Testing

#### Step 22: Test Presentation Mode (30 mins)

**Testing checklist:**

- [ ] Open Presentation Mode in admin.html
- [ ] Click "Reveal Audience" for couple 1 - bar animates smoothly?
- [ ] Click "Reveal Judges" for couple 1 - second bar stacks on top?
- [ ] Reveal all couples - do bars reposition by rank?
- [ ] Click "Show Podium" - does podium fade in with top 3?
- [ ] Does confetti animation play?
- [ ] Test on projector/large screen - is everything visible?
- [ ] Verify score calculations are correct

### Day 4 - Thursday, February 20th - Polish & Deploy (3-4 hours)

#### Morning Session (1.5-2 hours) - Design Polish

#### Step 23: Apply Dancing with Stars Theme (45 mins)

**Tell your AI assistant:**
Apply final design touches across all pages (index.html and admin.html):

Color Palette:

- Primary Purple: #5B3A8B
- Secondary Purple: #764BA2
- Gold: #D4AF37
- Accent Gold: #FFD700
- Background: Dark purple gradient
- Text: White and gold

Elements to add:

- Disco ball image or icon in headers
- Sparkle/star animations (CSS keyframes)
- Purple curtain texture as background
- Elegant serif font for titles (e.g., "Playfair Display" from Google Fonts)
- Sans-serif for body text (e.g., "Montserrat")

Background:

- Use the uploaded stars.png image as background for index.html
- Add subtle sparkle animations using CSS
- Ensure text is readable over background

Button styles:

- Gold gradient buttons with hover effects
- Purple outline buttons for secondary actions
- Smooth transitions and shadows

#### Step 24: Mobile Responsiveness (45 mins)

**Tell your AI assistant:**
Make index.html fully responsive for mobile voting:

Breakpoints:

- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

**Mobile optimizations:**

- Single column layout for couple cards
- Larger touch targets (buttons min 44px height)
- Readable font sizes (min 16px for body text)
- No horizontal scrolling
- Optimized images (compress headshots)
- Test on iPhone and Android screen sizes

Use CSS media queries and flexbox/grid for responsive layouts.

#### Afternoon Session (1-1.5 hours) - Final Features & Deploy

#### Step 25: Add Voting Control (30 mins)

Tell your AI assistant:
In admin.html, create a "Control Panel" tab:

- Display current voting status (Open/Closed)
- "Open Voting" button - enables audience voting
- "Close Voting" button - disables audience voting
- When closed, show message on index.html: "Voting is now closed. Thank you!"
- Store status in Firestore: /competitions/dwts-feb-2026/status = "open" or "closed"
- index.html checks status before allowing vote submission

#### Step 26: Deploy to Firebase Hosting (30 mins)

```bash
# Navigate to project directory
cd c:\Users\yalvi\Projects\DWTS-Voting

# Build production files (compiles TypeScript, bundles with Vite, processes Tailwind)
npm run build

# This creates optimized files in public/ folder

# Deploy to Firebase Hosting
firebase deploy

# OR use the combined command:
npm run firebase:deploy
```

You'll get URLs like:
- Hosting URL: https://dwts-voting-3a145.web.app
- or: https://dwts-voting-3a145.firebaseapp.com

**Save both URLs:**

**AUDIENCE_URL.txt:**
```
🎭 Vote Here:
https://dwts-voting-3a145.web.app

(Share this with audience)
```

**ADMIN_URL.txt:**
```
🔐 Admin Panel:
https://dwts-voting-3a145.web.app/admin.html

(Keep this private - for you only)
```

**Local Development URLs (for testing before event):**
- Voting page: http://localhost:5000
- Admin dashboard: http://localhost:5000/admin.html
🎭 Vote Here:
https://dwts-voting.web.app

(Share this with audience)
ADMIN_URL.txt:
🔐 Admin Panel:
https://dwts-voting.web.app/admin.html

(Keep this private - for you only)
#### Evening Session (30 mins) - Pre-Event Testing

#### Step 28: Final End-to-End Test (30 mins)

**Complete walkthrough:**

Open admin.html on laptop
Add 5 test couples with placeholder images
Enter judge scores (mix of individual and quick entry)
Open voting page on phone (using real URL)
Submit 5 test votes from different devices
Check admin dashboard - see votes come in real-time
Open Presentation Mode on laptop
Connect to projector/large screen
Reveal couples one by one
Show podium with confetti
Verify everything looks good on big screen

### Day 5 - Friday, February 21st - Event Day (2 hours)

#### Pre-Event Setup (1 hour before event - 4:00 PM)

#### Step 29: Event Day Preparation (30 mins)

**Delete all test data from Firestore:**

1. Go to Firebase Console > Firestore Database
2. Delete all documents in votes collection
3. Keep couples collection (or add real couples)

**Add real couple data:**

1. Open admin.html
2. Go to "Manage Couples" tab
3. Add all real couples with their actual names
4. Upload their actual headshot images
5. Verify all images display correctly

**Set voting status to "Closed":**

1. Go to "Control Panel" tab
2. Click "Close Voting" (will open it when ready)

**Test equipment:**

1. Connect laptop to projector
2. Open Presentation Mode in admin.html
3. Verify screen displays correctly
4. Test audio (if using music with confetti)

#### Step 30: Create Audience Access (15 mins)

**Option 1: QR Code**

1. Go to https://www.qr-code-generator.com/
2. Enter your audience URL: https://dwts-voting.web.app
3. Download QR code image
4. Display on screen or print on paper

**Option 2: Short Link**

1. Use bit.ly or similar to create short link
2. Example: `bit.ly/dwts-voting`

#### Step 31: Brief Helpers (15 mins)

If you have helpers:

- Show them admin dashboard
- Explain how to monitor votes coming in
- Assign someone to watch for technical issues
- Have backup paper ballots ready (just in case)

#### During Event (Throughout performances)

#### Step 32: Event Execution

**Before first performance:**

- [ ] Open "Control Panel" in admin.html
- [ ] Click "Open Voting"
- [ ] Announce to audience: "Scan QR code or go to [URL] to vote!"
- [ ] Show voting page on screen briefly

**During performances:**

- [ ] As judges score, enter their scores in "Judge Scores" tab
- [ ] Monitor "Dashboard" tab to see votes coming in
- [ ] Keep laptop open but minimized

**After last performance:**

- [ ] Wait 2-3 minutes for final votes
- [ ] Click "Close Voting" in Control Panel
- [ ] Announce: "Voting is now closed!"

**Grand Reveal:**

- [ ] Switch to "Presentation Mode" tab
- [ ] Connect to projector (full screen with F11)
- [ ] Announce: "And now, the results!"
- [ ] Reveal couples one by one:
  - Click "Reveal Audience" for couple 1
  - Wait for applause
  - Click "Reveal Judges" for couple 1
  - Repeat for all couples
- [ ] After all couples revealed:
  - Click "Show Podium"
  - Confetti explodes!
  - Announce winners!

#### Post-Event (After ceremony)

#### Step 33: Data Backup & Export (Optional)

If you want to save results:

1. Go to Firebase Console > Firestore Database
2. Export collections (or screenshot results)
3. Save for records/memories

📋 Complete Checklist

### Pre-Event Checklist

- [ ] Firebase project created
- [ ] Firebase services enabled (Firestore, Hosting - NO Storage needed)
- [ ] Security rules deployed
- [ ] Admin dashboard complete and tested
- [ ] Audience voting page complete and tested
- [ ] Presentation mode complete and tested
- [ ] Deployed to Firebase Hosting
- [ ] URLs saved and accessible
- [ ] Real couple data entered
- [ ] All headshots uploaded
- [ ] Judge scores entered (or ready to enter)
- [ ] Equipment tested (laptop, projector)
- [ ] QR code or short link created
- [ ] Backup plan ready (paper ballots)

### Event Day Checklist

- [ ] Arrive 1 hour early
- [ ] Set up laptop and projector
- [ ] Clear test data from database
- [ ] Add real couple data
- [ ] Test voting on phone
- [ ] Create QR code
- [ ] Open voting before first performance
- [ ] Monitor votes during event
- [ ] Close voting after last performance
- [ ] Execute grand reveal smoothly
- [ ] Announce winners with confetti

## 🆘 Emergency Troubleshooting

#### Problem: Votes not saving

**Solution:**

- Check Firebase Console > Firestore Database - are documents appearing?
- Check browser console (F12) for errors
- Verify Firebase config is correct in HTML files
- Check Firestore rules allow writes

#### Problem: Images not loading

**Solution:**

- Check if Base64 strings are properly stored in Firestore
- Verify the Base64 format includes data URI scheme: `data:image/jpeg;base64,...`
- Check browser console for errors
- Ensure images were compressed to < 100KB when uploaded
- Try re-uploading and compressing images

#### Problem: Presentation mode animation broken

Solution:

Refresh page (F5)
Clear browser cache (Ctrl+Shift+R)
Try different browser (Chrome recommended)
Check laptop is plugged in (performance mode)

Problem: Internet connection lost
Solution:

Have mobile hotspot ready as backup
Firebase caches data locally (may still work briefly)
Switch to paper ballot backup plan
Announce technical difficulty, continue with judging only

Problem: Projector not working
Solution:

Check cable connections (HDMI/VGA)
Try src/
│   ├── main.ts              (Voting page logic)
│   ├── admin.ts             (Admin dashboard logic)
│   ├── firebase.ts          (Firebase config)
│   ├── types.ts             (TypeScript interfaces)
│   ├── utils.ts             (Helper functions)
│   └── style.css            (Tailwind + custom CSS)
├── public/                  (Build output - auto-generated by Vite)
│   ├── index.html          (Built voting page)
│   ├── admin.html          (Built admin page)
│   └── assets/             (Bundled JS/CSS files)
├── index.html               (Voting page template)
├── admin.html               (Admin template)
├── package.json             (Dependencies)
├── vite.config.ts           (Vite configuration)
├── tailwind.config.js       (Tailwind config with custom colors)
├── tsconfig.json            (TypeScript config)
├── postcss.conf (Configured in Tailwind)

Already configured in `tailwind.config.js`:
```javascript
colors: {
  'purple-dark': '#5B3A8B',
  'purple-medium': '#764BA2',
  'gold-dark': '#D4AF37',
  'gold-bright': '#FFD700',
}
```

**Use in HTML:**
```html
<div class="bg-purple-dark text-gold-bright">...</div>
<button class="bg-gold-bright text-purple-dark">...</button> └── stars.png (Background image)
├── .firebaserc
├── firebase.json
├── firestore.rules
├── firestore.indexes.json

├── CONTEXT_FOR_AI.md (For your AI assistant)
├── AUDIENCE_URL.txt
└── ADMIN_URL.txt

Already configured in `tailwind.config.js` and HTML files:

```javascript
fontFamily: {
  'display': ['"Playfair Display"', 'serif'],
  'body': ['Montserrat', 'sans-serif'],
}
```

**Use in HTML:**
```htmldefined in `src/style.css` with `@keyframes`)
- Gradient background (use `.gradient-bg` Tailwind component)
- Button styles (use `.btn-primary` and `.btn-secondary` Tailwind components)
- Card component (use `.card` Tailwind component)
- Smooth transitions with Tailwind utility classes
  --purple-dark: #5b3a8b;
  --purple-medium: #764ba2;
  --gold-dark: #d4af37;
  --gold-bright: #ffd700;
  --white: #ffffff;
  --black: #000000;
}
````

### Fonts (Google Fonts)

```html
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;600&display=swap"
  rel="stylesheet"
/>
```

### Key Visual Elements

- Disco ball icon/image in headers
- Sparkle animations (CSS keyframes rotate + scale)
- Purple curtain texture background (use stars.png)
- Gold buttons with gradient hover effects
- Smooth transitions everywhere (300ms ease)

## 📱 AI Assistant Prompts Reference

### For Admin Dashboard

Create an admin dashboard for a Dancing with the Stars voting app.
Include tabs for: Dashboard, Manage Couples, Judge Scores, Control Panel, Presentation Mode.
Use Firebase Firestore for data storage.
Theme: purple and gold colors, elegant typography.

### For Audience Voting Page

Create a public voting page for audience members to vote yes/no for dance couples.
Display couples in a responsive grid with their headshots.
Use Firebase to fetch couple data and submit votes.
Theme: Dancing with the Stars aesthetic with purple curtain background and gold accents.
Mobile-first design.

### For Presentation Mode

Create an animated bar chart presentation mode for revealing voting results.
Features:

- Horizontal bars that animate from left to right
- Separate reveals for audience scores (purple) and judge scores (gold)
- Bars reposition based on ranking
- Top 3 podium reveal with confetti animation
- Manual control (admin clicks to reveal each couple)

## ⏱️ Time Estimates Summary

| Day            | Tasks             | Estimated Time  |
| -------------- | ----------------- | --------------- |
| Day 1 (Feb 17) | Setup             | 2-3 hours       |
| Day 2 (Feb 18) | Core Features     | 4-5 hours       |
| Day 3 (Feb 19) | Presentation Mode | 4-5 hours       |
| Day 4 (Feb 20) | Polish & Deploy   | 3-4 hours       |
| Day 5 (Feb 21) | Event Day         | 2 hours         |
| **Total**      |                   | **15-19 hours** |

## 🎯 Success Criteria

You'll know you're ready when:

- [ ] You can add couples with headshots in admin panel
- [ ] You can enter judge scores (all 6 or quick entry)
- [ ] Audience can vote from their phones successfully
- [ ] Admin dashboard shows real-time vote counts
- [ ] Presentation mode reveals scores smoothly with animations
- [ ] Podium displays top 3 with confetti
- [ ] Everything looks great on projector
- [ ] Voting can be opened/closed manually

## 🎉 Final Notes

### Tips for Success

- **Start Early:** Begin on February 17th as planned, don't wait
- **Test Often:** Test each feature immediately after building it
- **Use Your AI Assistant Liberally:** Don't hesitate to ask for help
- **Keep It Simple:** If a feature is too complex, simplify it
- **Have a Backup Plan:** Paper ballots, reading results aloud
- **Practice the Reveal:** Run through presentation mode a few times
- **Charge Your Laptop:** Make sure it's fully charged for event
- **Arrive Early:** Give yourself buffer time for setup

### What Could Go Wrong (and how to prevent it)

- **Firebase quota exceeded:** Unlikely with 100 votes, but stay in test mode
- **Images too large:** Compress headshots to < 100KB each before converting to Base64 (use quality: 0.7 and maxWidth: 400px)
- **Slow internet:** Test with mobile hotspot as backup
- **Browser compatibility:** Use Chrome for best compatibility
- **Projector resolution:** Test full-screen mode beforehand

## 💪 You've Got This!

This is a well-scoped project for 4 days with AI assistance. Follow the plan day by day, and you'll have an amazing voting system for your event!

Good luck, and have a fantastic Dancing With The (UBC Dance Club) Stars event! 🎭✨

### Questions During Implementation?

Come back and ask! I'm here to help troubleshoot any issues you encounter.
