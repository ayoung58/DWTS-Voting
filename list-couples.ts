// Script to list all couples in the database
// Run with: npx tsx list-couples.ts

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function listCouples() {
  try {
    console.log("🔍 Fetching couples from Firestore...\n");
    const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);
    const snapshot = await getDocs(couplesRef);

    if (snapshot.empty) {
      console.log("❌ No couples found!");
      return;
    }

    console.log(`Found ${snapshot.size} couples:\n`);

    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(
        `${index + 1}. Pro: "${data.leadName || "N/A"}" | Star: "${data.followName || "N/A"}"`,
      );
      console.log(`   ID: ${doc.id}`);
      console.log(`   Name: ${data.name || "N/A"}`);
      console.log(`   Order: ${data.order ?? "not set"}`);
      console.log(`   Music: ${data.music || "N/A"}`);
      console.log(`   Dance: ${data.dance || "N/A"}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error listing couples:", error);
    process.exit(1);
  }
}

listCouples();
