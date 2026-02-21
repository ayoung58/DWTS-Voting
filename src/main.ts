// Main entry point for voting page (index.html)
import "./style.css";
import { db, COMPETITION_ID } from "./firebase";
import {
  collection,
  getDocs,
  setDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { generateFingerprint } from "./utils";
import type { Couple } from "./types";

console.log("🪩 DWTS Voting App - Audience Page Loaded");

// Store vote selections and max hearts limit
const voteSelections: { [coupleId: string]: "yes" | "no" | null } = {};
let maxHearts: number | null = null; // null means unlimited
let userFingerprint: string | null = null;
let submissionStatus: string = "closed"; // Track submission status

async function loadMaxHearts(): Promise<void> {
  try {
    const statusDoc = await getDoc(
      doc(db, `competitions/${COMPETITION_ID}/status/current`),
    );
    if (statusDoc.exists()) {
      const data = statusDoc.data();
      maxHearts = data.maxHearts ?? null; // null if not set (unlimited)
      submissionStatus = data.submissionStatus || "closed";
    }
  } catch (error) {
    console.error("Error loading max hearts:", error);
  }
}

async function checkVotingStatus(): Promise<boolean> {
  try {
    const statusDoc = await getDoc(
      doc(db, `competitions/${COMPETITION_ID}/status/current`),
    );
    if (statusDoc.exists()) {
      const status = statusDoc.data().status;
      return status === "open";
    }
    // If no status document, assume open
    return true;
  } catch (error) {
    console.error("Error checking voting status:", error);
    return true; // Default to open if error
  }
}

function startVotingStatusListener() {
  const statusDocRef = doc(db, `competitions/${COMPETITION_ID}/status/current`);

  onSnapshot(statusDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const status = data.status;
      const newSubmissionStatus = data.submissionStatus || "closed";

      // Update submission status
      submissionStatus = newSubmissionStatus;
      updateSubmitButtonState();

      if (status === "closed") {
        // Voting was closed - show message and hide form
        const votingForm = document.getElementById("votingForm");
        const statusMessage = document.getElementById("statusMessage");
        const submitBtn = document.getElementById(
          "submitVotesBtn",
        ) as HTMLButtonElement;

        if (statusMessage) {
          statusMessage.innerHTML = `
            <div class="card text-center py-8 bg-red-500/20 border-red-500/50 animate-pulse">
              <h2 class="text-2xl font-bold text-red-400 mb-2">⛔ Voting Has Been Closed</h2>
              <p class="text-lg">Thank you for participating!</p>
            </div>
          `;
        }

        if (votingForm) {
          votingForm.classList.add("hidden");
        }

        if (submitBtn) {
          submitBtn.disabled = true;
        }
      }
    }
  });
}

function updateSubmitButtonState() {
  const submitBtn = document.getElementById(
    "submitVotesBtn",
  ) as HTMLButtonElement;
  const helpText = document.getElementById("submitHelpText");

  if (!submitBtn) return;

  if (submissionStatus === "open") {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    submitBtn.textContent = "Submit All Votes";
    if (helpText) {
      helpText.textContent = "Click to submit your votes when ready";
    }
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50", "cursor-not-allowed");
    submitBtn.textContent = "Submissions will open after all dances";
    if (helpText) {
      helpText.textContent =
        "The submit button will be enabled after all dances are finished";
    }
  }
}

function startVoteDocumentListener() {
  if (!userFingerprint) return;

  const voteDocRef = doc(
    db,
    `competitions/${COMPETITION_ID}/votes`,
    userFingerprint,
  );

  onSnapshot(voteDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      // If the vote was just submitted (by user or auto-submitted by admin)
      if (data.submitted) {
        const voteCount = Object.keys(data.votes || {}).length;
        const statusMessage = document.getElementById("statusMessage");
        const votingForm = document.getElementById("votingForm");

        if (statusMessage) {
          statusMessage.innerHTML = `
            <div class="card text-center py-8 bg-green-500/20 border-green-500/50">
              <h2 class="text-3xl font-bold text-green-400 mb-2">✅ Votes Submitted!</h2>
              <p class="text-lg">Your votes have been recorded successfully!</p>
              <p class="text-sm text-white/70 mt-3">You selected ${voteCount} couple${voteCount !== 1 ? "s" : ""}</p>
            </div>
          `;
        }

        if (votingForm) {
          votingForm.classList.add("hidden");
        }
      }
    }
  });
}

async function loadCouples() {
  const couplesGrid = document.getElementById("couplesGrid");
  if (!couplesGrid) return;

  try {
    const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);
    const snapshot = await getDocs(couplesRef);

    if (snapshot.empty) {
      couplesGrid.innerHTML = `
        <div class="col-span-full card text-center py-12">
          <p class="text-lg">No couples available yet. Check back soon!</p>
        </div>
      `;
      return;
    }

    // Sort couples by order field
    const couples = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        data: doc.data() as Couple,
      }))
      .sort((a, b) => {
        const orderA = a.data.order ?? 9999;
        const orderB = b.data.order ?? 9999;
        return orderA - orderB;
      });

    couplesGrid.innerHTML = "";
    let coupleNumber = 1;

    couples.forEach(({ id, data }) => {
      const coupleCard = createCoupleCard(id, data, coupleNumber++);
      couplesGrid.appendChild(coupleCard);
    });
  } catch (error) {
    console.error("Error loading couples:", error);
    couplesGrid.innerHTML = `
      <div class="col-span-full card text-center py-12 text-red-400">
        <p>Error loading couples. Please refresh the page.</p>
      </div>
    `;
  }
}

function createCoupleCard(
  id: string,
  couple: Couple,
  number: number,
): HTMLElement {
  const card = document.createElement("div");
  card.className = "card hover:scale-[1.02] transition-transform";

  const leadPhoto =
    couple.leadPhoto ||
    couple.headshot ||
    "https://via.placeholder.com/300x400?text=Lead";
  const followPhoto =
    couple.followPhoto || "https://via.placeholder.com/300x400?text=Follow";
  const leadLabel = couple.leadName || "Lead";
  const followLabel = couple.followName || "Follow";

  card.innerHTML = `
    <div class="relative">
      <div class="absolute top-2 left-2 z-10 bg-gold-bright text-purple-dark font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg">
        ${number}
      </div>
      <div class="flex gap-2">
        <div class="flex-1 text-center">
          <img 
            src="${leadPhoto}" 
            alt="${leadLabel}"
            class="w-full h-40 sm:h-48 object-cover rounded-lg"
          />
          <p class="text-xs text-white/70 mt-1 truncate">${leadLabel}</p>
        </div>
        <div class="flex-1 text-center">
          <img 
            src="${followPhoto}" 
            alt="${followLabel}"
            class="w-full h-40 sm:h-48 object-cover rounded-lg"
          />
          <p class="text-xs text-white/70 mt-1 truncate">${followLabel}</p>
        </div>
      </div>
    </div>
    <h3 class="text-lg sm:text-xl font-bold text-gold-bright my-3 text-center">${couple.name}</h3>
    ${couple.music || couple.dance ? `<p class="text-sm font-semibold text-gold-bright text-center mb-2">${couple.music || ""}${couple.music && couple.dance ? " -- " : ""}${couple.dance || ""}</p>` : ""}
    
    <button 
      onclick="toggleHeart('${id}')"
      id="heart-${id}"
      class="w-full py-4 px-4 rounded-lg border-2 border-pink-500/30 bg-white/5 hover:bg-pink-500/20 hover:border-pink-500 transition-all font-semibold text-2xl flex items-center justify-center gap-2"
    >
      <span id="heart-icon-${id}" class="text-3xl">🤍</span>
      <span id="heart-text-${id}" class="text-sm sm:text-base">Tap to Vote</span>
    </button>
  `;

  return card;
}

function toggleHeart(coupleId: string) {
  const currentSelection = voteSelections[coupleId];
  const heartBtn = document.getElementById(`heart-${coupleId}`);
  const heartIcon = document.getElementById(`heart-icon-${coupleId}`);
  const heartText = document.getElementById(`heart-text-${coupleId}`);

  if (currentSelection === "yes") {
    // Deselect (unvote)
    voteSelections[coupleId] = null;
    if (heartBtn) {
      heartBtn.classList.remove("bg-pink-500", "border-pink-500");
      heartBtn.classList.add("bg-white/5", "border-pink-500/30");
    }
    if (heartIcon) heartIcon.textContent = "🤍";
    if (heartText) heartText.textContent = "Tap to Vote";
    console.log("Heart removed:", coupleId);
  } else {
    // Check max hearts limit
    const currentHeartCount = Object.values(voteSelections).filter(
      (v) => v === "yes",
    ).length;

    if (maxHearts !== null && currentHeartCount >= maxHearts) {
      alert(
        `The maximum number that you can select is ${maxHearts}. You can deselect from other couples if you wish.`,
      );
      return;
    }

    // Select (vote yes)
    voteSelections[coupleId] = "yes";
    if (heartBtn) {
      heartBtn.classList.add("bg-pink-500", "border-pink-500");
      heartBtn.classList.remove("bg-white/5", "border-pink-500/30");
    }
    if (heartIcon) heartIcon.textContent = "❤️";
    if (heartText) heartText.textContent = "Selected!";
    console.log("Heart added:", coupleId);
  }

  // Auto-save selections to database (without submitted flag) so admin can auto-submit later
  autoSaveSelections();
}

// Auto-save selections to the database without marking as submitted
// This allows the admin to auto-submit pending votes when closing submissions
async function autoSaveSelections() {
  if (!userFingerprint) return;

  const voteDocRef = doc(
    db,
    `competitions/${COMPETITION_ID}/votes`,
    userFingerprint,
  );

  try {
    const voterNameInput = document.getElementById(
      "voterName",
    ) as HTMLInputElement;
    const voterName = voterNameInput?.value.trim() || "Anonymous";

    const votes = Object.fromEntries(
      Object.entries(voteSelections)
        .filter(([_, v]) => v === "yes")
        .map(([id]) => [id, "yes" as const]),
    );

    await setDoc(voteDocRef, {
      voterName,
      timestamp: serverTimestamp(),
      fingerprint: userFingerprint,
      votes,
      submitted: false, // NOT submitted yet - pending
    });

    console.log("📝 Selections auto-saved (pending submission)");
  } catch (error) {
    console.error("Error auto-saving selections:", error);
  }
}

async function saveVotes() {
  if (!userFingerprint) return;

  const voteDocRef = doc(
    db,
    `competitions/${COMPETITION_ID}/votes`,
    userFingerprint,
  );

  try {
    const voterNameInput = document.getElementById(
      "voterName",
    ) as HTMLInputElement;
    const voterName = voterNameInput?.value.trim() || "Anonymous";

    const votes = Object.fromEntries(
      Object.entries(voteSelections)
        .filter(([_, v]) => v === "yes")
        .map(([id]) => [id, "yes" as const]),
    );

    await setDoc(voteDocRef, {
      voterName,
      timestamp: serverTimestamp(),
      fingerprint: userFingerprint,
      votes,
      submitted: true, // Mark as officially submitted
    });

    console.log("✅ Votes submitted to database");
  } catch (error) {
    console.error("Error saving votes:", error);
    throw error;
  }
}

// Check if user already submitted votes
async function checkExistingSubmission(): Promise<boolean> {
  if (!userFingerprint) return false;

  try {
    const voteDocRef = doc(
      db,
      `competitions/${COMPETITION_ID}/votes`,
      userFingerprint,
    );
    const existingDoc = await getDoc(voteDocRef);

    if (existingDoc.exists()) {
      const data = existingDoc.data();

      // If already submitted, show message and hide form
      if (data.submitted) {
        const voteCount = Object.keys(data.votes || {}).length;
        const statusMessage = document.getElementById("statusMessage");
        const votingForm = document.getElementById("votingForm");

        if (statusMessage) {
          statusMessage.innerHTML = `
            <div class="card text-center py-8 bg-green-500/20 border-green-500/50">
              <h2 class="text-3xl font-bold text-green-400 mb-2">✅ Already Voted</h2>
              <p class="text-lg">You have already submitted your votes!</p>
              <p class="text-sm text-white/70 mt-3">You selected ${voteCount} couple${voteCount !== 1 ? "s" : ""}</p>
            </div>
          `;
        }

        if (votingForm) {
          votingForm.classList.add("hidden");
        }

        return true;
      }
    }
  } catch (error) {
    console.error("Error checking existing submission:", error);
  }
  return false;
}

// Submit votes with confirmation
async function submitVotes() {
  // Check if at least one vote was cast
  const voteCount = Object.values(voteSelections).filter(
    (v) => v === "yes",
  ).length;

  if (voteCount === 0) {
    alert("Please select at least one couple before submitting!");
    return;
  }

  const submitBtn = document.getElementById(
    "submitVotesBtn",
  ) as HTMLButtonElement;

  if (!submitBtn) return;

  // Disable button to prevent double submission
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    // Save votes to database
    await saveVotes();

    // Show success message
    const votingForm = document.getElementById("votingForm");
    const statusMessage = document.getElementById("statusMessage");

    if (statusMessage) {
      statusMessage.innerHTML = `
        <div class="card text-center py-8 bg-green-500/20 border-green-500/50">
          <h2 class="text-3xl font-bold text-green-400 mb-2">✅ Thank You!</h2>
          <p class="text-lg">Your votes have been submitted successfully!</p>
          <p class="text-sm text-white/70 mt-3">You selected ${voteCount} couple${voteCount !== 1 ? "s" : ""}</p>
        </div>
      `;
    }

    if (votingForm) {
      votingForm.classList.add("hidden");
    }

    console.log("✅ Votes submitted successfully");
  } catch (error) {
    console.error("Error submitting votes:", error);
    alert("Failed to submit votes. Please try again.");

    // Re-enable button on error
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit All Votes";
  }
}

// Make toggleHeart function available globally
(window as any).toggleHeart = toggleHeart;

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Voting page ready!");

  // Generate fingerprint upfront
  userFingerprint = await generateFingerprint();

  // Check voting status
  const isOpen = await checkVotingStatus();
  const statusMessage = document.getElementById("statusMessage");

  if (!isOpen) {
    if (statusMessage) {
      statusMessage.innerHTML = `
        <div class="card text-center py-8 bg-red-500/20 border-red-500/50">
          <h2 class="text-2xl font-bold text-red-400 mb-2">Voting is Closed</h2>
          <p class="text-lg">Thank you for your interest!</p>
        </div>
      `;
    }
    const votingForm = document.getElementById("votingForm");
    if (votingForm) votingForm.classList.add("hidden");
    return;
  }

  // Load max hearts setting
  await loadMaxHearts();

  // Check if user already submitted
  const alreadySubmitted = await checkExistingSubmission();
  if (alreadySubmitted) {
    return; // Don't show voting form if already submitted
  }

  // Start listening for vote document changes (to detect auto-submission)
  startVoteDocumentListener();

  // Load couples (this creates the UI)
  await loadCouples();

  // Update submit button based on submission status
  updateSubmitButtonState();

  // Start real-time voting status listener
  startVotingStatusListener();

  // Handle submit button
  const submitBtn = document.getElementById("submitVotesBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", submitVotes);
  }
});
