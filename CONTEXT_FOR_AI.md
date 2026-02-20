# Project Context for AI Assistant

## Project: Dancing With The (UBC Dance Club) Stars Voting System

### Event Details

- Date: Saturday, February 21st, 2026 at 5:00 PM
- Location: UBC Dance Club
- Theme: Dancing with the Stars (disco ball, purple curtain, gold stars)

### Tech Stack

- **Frontend:** Vite + TypeScript + Tailwind CSS
- **Database:** Firebase Firestore (stores couple data and Base64 images)
- **Hosting:** Firebase Hosting
- **Build Tool:** Vite for development and production builds
- **Styling:** Tailwind CSS with custom Dancing with Stars theme
- **Image Storage:** Base64 encoding in Firestore (no Firebase Storage needed - free tier)

### Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:5000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run firebase:deploy` - Build and deploy to Firebase Hosting

### Firebase Configuration

**Location:** Update `/src/firebase.ts` with your config from Firebase Console

Get your config from: https://console.firebase.google.com/project/dwts-voting-3a145/settings/general

Example:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "dwts-voting-3a145.firebaseapp.com",
  projectId: "dwts-voting-3a145",
  storageBucket: "dwts-voting-3a145.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Database Structure

- Competition ID: "dwts-feb-2026"
- Collections:
  - /competitions/{competitionId}
  - /competitions/{competitionId}/couples/{coupleId}
  - /competitions/{competitionId}/votes/{voteId}
  - /competitions/{competitionId}/judgeScores/{judgeScoreId}

### Key Features Needed

#### 1. Admin Dashboard (admin.html)

- Couple management (name, headshot upload)
- Judge score input (60 judges total, combined score 0-60)
- Individual entry option (6 judges, 0-10 each for testing/demo purposes)
- Quick entry option (single combined score 0-60, recommended)
- Real-time vote tracking
- Manual voting open/close control

#### 2. Audience Voting Page (index.html)

- View all couples with headshots
- Vote yes/no for multiple couples
- Submit votes anonymously or with name
- Dancing with Stars theme

#### 3. Presentation Mode (separate tab in admin.html)

- Animated bar chart
- Manual reveal per couple (click to reveal)
- Show audience score (out of 50) separately
- Show judge score (out of 50) separately
- Combined final score display
- Horizontal positioning based on rank
- Top 3 podium at the end with confetti animation

### Score Calculation

- **Judge Score Component:** (Raw score 0-60 from 60 judges) normalized to 0-50 scale: `(judgeScore / 60) * 50`
- **Audience Score Component:** (Yes votes / Total audience votes) \* 50 = Max 50 points
- **Final Score:** Judge Component + Audience Component = Max 100 points

### Design Requirements

- **Colors:** Purple (#5B3A8B, #764BA2), Gold (#D4AF37, #FFD700)
- **Elements:** Disco ball, sparkles, stars, purple curtain background
- **Font:** Elegant, show-style fonts (Playfair Display for titles, Montserrat for body)
- **Mobile responsive:** Must work on phones for audience voting
- **Image Handling:** Base64-encoded images stored in Firestore, compressed to < 100KB

### Image Compression Function

When implementing file uploads, use this function to compress and convert images to Base64:

```javascript
function compressAndConvertToBase64(file, maxWidth = 400, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

### Firebase SDK Version

Use Firebase v9+ with modular SDK (recommended):

```html
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

  // Your code here
</script>
```

### Implementation Timeline

- **Day 2 (Feb 18):** Build admin dashboard and audience voting page
- **Day 3 (Feb 19):** Build presentation mode with animations
- **Day 4 (Feb 20):** Polish design and deploy
- **Day 5 (Feb 21):** Event day!

### Notes

- Keep all code in vanilla JavaScript (no frameworks)
- Test on mobile devices for audience voting
- Ensure presentation mode works on projector/large screens
- Practice the reveal sequence before the event
