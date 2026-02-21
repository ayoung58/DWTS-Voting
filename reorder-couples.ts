// Script to reorder couples based on specified order
// Run with: npx tsx reorder-couples.ts

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMdA3oEz7CMEFcjz3FbT3cKypogSlDYeM",
  authDomain: "dwts-voting-3a145.firebaseapp.com",
  projectId: "dwts-voting-3a145",
  storageBucket: "dwts-voting-3a145.firebasestorage.app",
  messagingSenderId: "646244411613",
  appId: "1:646244411613:web:2ff4d23b9a523fab44d334",
  measurementId: "G-YECRXBRHDB",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COMPETITION_ID = "dwts-feb-2026";

// Ordered list of couples (Pro & Star pairs) - using first names as stored in DB
const orderedCouples = [
  { pro: "Alexa", star: "Olivia", order: 1 },
  { pro: "Sabrina", star: "Arjun", order: 2 },
  { pro: "Stephanie", star: "Efe", order: 3 },
  { pro: "Ezra", star: "Isabel", order: 4 },
  { pro: "Timothy", star: "Sophia", order: 5 },
  { pro: "Aidan", star: "Cassidy", order: 6 },
  { pro: "Hina", star: "Stephanie", order: 7 },
  { pro: "Taylor", star: "Carla", order: 8 },
  { pro: "Maddy", star: "Thomas", order: 9 },
  { pro: "Alfred", star: "Naomi", order: 10 },
  { pro: "Alex", star: "Akuol", order: 11 },
  { pro: "Tulga", star: "Kirsten", order: 12 },
  { pro: "Jasmin", star: "Michael", order: 13 },
  { pro: "Charles", star: "Mandy", order: 14 },
  { pro: "Maria", star: "James", order: 15 },
];

async function reorderCouples() {
  try {
    console.log("🔄 Fetching couples from Firestore...");
    const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);
    const snapshot = await getDocs(couplesRef);

    if (snapshot.empty) {
      console.log("❌ No couples found!");
      return;
    }

    console.log(`✅ Found ${snapshot.size} couples\n`);

    // Match couples by name and update their order
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const orderedCouple of orderedCouples) {
      // Try to find matching couple by lead/follow names
      let foundDoc = null;

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const leadMatch =
          data.leadName?.trim().toLowerCase() ===
          orderedCouple.pro.trim().toLowerCase();
        const followMatch =
          data.followName?.trim().toLowerCase() ===
          orderedCouple.star.trim().toLowerCase();

        if (leadMatch && followMatch) {
          foundDoc = docSnapshot;
        }
      });

      if (foundDoc) {
        const docRef = doc(
          db,
          `competitions/${COMPETITION_ID}/couples`,
          foundDoc.id,
        );
        await updateDoc(docRef, { order: orderedCouple.order });
        console.log(
          `✅ Updated: ${orderedCouple.pro} & ${orderedCouple.star} → Order ${orderedCouple.order}`,
        );
        updatedCount++;
      } else {
        console.log(
          `⚠️  NOT FOUND: ${orderedCouple.pro} & ${orderedCouple.star}`,
        );
        notFoundCount++;
      }
    }

    console.log(`\n🎉 Reordering complete!`);
    console.log(`   Updated: ${updatedCount} couples`);
    if (notFoundCount > 0) {
      console.log(
        `   Not found: ${notFoundCount} couples (may need manual checking)`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error reordering couples:", error);
    process.exit(1);
  }
}

reorderCouples();
