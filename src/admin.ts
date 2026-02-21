// Main entry point for admin page (admin.html)
import "./style.css";
import { db, COMPETITION_ID } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { compressAndConvertToBase64 } from "./utils";
import type { Couple } from "./types";

console.log("🪩 DWTS Admin Dashboard Loaded");

// Tab switching functionality
function showTab(tabName: string) {
  // Hide all content
  document.querySelectorAll("[data-tab-content]").forEach((content) => {
    content.classList.add("hidden");
  });

  // Remove active class from all tabs
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.classList.remove("active", "bg-gold-bright", "text-purple-dark");
    tab.classList.add("bg-white/10", "text-white");
  });

  // Show selected content
  const selectedContent = document.querySelector(
    `[data-tab-content="${tabName}"]`,
  );
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
  }

  // Mark selected tab as active
  const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (selectedTab) {
    selectedTab.classList.remove("bg-white/10", "text-white");
    selectedTab.classList.add(
      "active",
      "bg-gold-bright",
      "text-purple-dark",
      "font-bold",
    );
  }

  // Load content for specific tabs
  if (tabName === "dashboard") {
    startDashboardListener();
  } else {
    stopDashboardListener();
  }

  if (tabName === "judges") {
    loadJudgeScores();
  }

  if (tabName === "presentation") {
    loadPresentationData();
  }

  if (tabName === "statistics") {
    loadStatistics();
  }

  if (tabName === "control") {
    startVotingStatusListener();
    loadVotingStatus();
  } else {
    stopVotingStatusListener();
  }
}

// Make showTab available globally for onclick handlers
(window as any).showTab = showTab;

// ===== VOTING CONTROL (Step 25) =====

let votingStatusUnsubscribe: (() => void) | null = null;

async function loadVotingStatus() {
  try {
    const statusDoc = await getDoc(
      doc(db, `competitions/${COMPETITION_ID}/status/current`),
    );

    let currentStatus = "open"; // Default to open
    let maxHearts = null;

    if (statusDoc.exists()) {
      const data = statusDoc.data();
      currentStatus = data.status || "open";
      maxHearts = data.maxHearts ?? null;
    } else {
      // Create initial status document if it doesn't exist
      await setDoc(doc(db, `competitions/${COMPETITION_ID}/status/current`), {
        status: "open",
        lastUpdated: new Date().toISOString(),
      });
    }

    updateVotingStatusUI(currentStatus);
    updateMaxHeartsUI(maxHearts);
  } catch (error) {
    console.error("Error loading voting status:", error);
  }
}

function startVotingStatusListener() {
  if (votingStatusUnsubscribe) return; // Already listening

  const statusDocRef = doc(db, `competitions/${COMPETITION_ID}/status/current`);

  votingStatusUnsubscribe = onSnapshot(statusDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const status = docSnapshot.data().status || "open";
      updateVotingStatusUI(status);
    }
  });
}

function stopVotingStatusListener() {
  if (votingStatusUnsubscribe) {
    votingStatusUnsubscribe();
    votingStatusUnsubscribe = null;
  }
}

function updateVotingStatusUI(status: string) {
  const statusText = document.getElementById("statusText");
  const statusIndicator = document.getElementById("statusIndicator");
  const openBtn = document.getElementById("openVotingBtn") as HTMLButtonElement;
  const closeBtn = document.getElementById(
    "closeVotingBtn",
  ) as HTMLButtonElement;

  if (!statusText || !statusIndicator || !openBtn || !closeBtn) return;

  if (status === "open") {
    statusText.textContent = "OPEN";
    statusText.className = "text-green-400";
    statusIndicator.textContent = "✅";
    statusIndicator.className =
      "w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-green-600/20 border-2 border-green-400";
    openBtn.disabled = true;
    closeBtn.disabled = false;
  } else {
    statusText.textContent = "CLOSED";
    statusText.className = "text-red-400";
    statusIndicator.textContent = "⛔";
    statusIndicator.className =
      "w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-red-600/20 border-2 border-red-400";
    openBtn.disabled = false;
    closeBtn.disabled = true;
  }
}

async function setVotingStatus(status: "open" | "closed") {
  try {
    // Fetch current status doc to preserve maxHearts
    const statusDoc = await getDoc(
      doc(db, `competitions/${COMPETITION_ID}/status/current`),
    );
    const existingData = statusDoc.exists() ? statusDoc.data() : {};

    await setDoc(doc(db, `competitions/${COMPETITION_ID}/status/current`), {
      ...existingData,
      status: status,
      lastUpdated: new Date().toISOString(),
    });

    console.log(`Voting status set to: ${status}`);

    // Show confirmation
    const message =
      status === "open"
        ? "✅ Voting is now OPEN! Audience can submit votes."
        : "⛔ Voting is now CLOSED. No more votes can be submitted.";
    alert(message);
  } catch (error) {
    console.error("Error setting voting status:", error);
    alert("Failed to update voting status. Check console for details.");
  }
}

// Make function available globally for onclick handlers
(window as any).setVotingStatus = setVotingStatus;

// ===== MAX HEARTS LIMIT =====

function updateMaxHeartsUI(maxHearts: number | null) {
  const currentMaxHeartsEl = document.getElementById("currentMaxHearts");
  const maxHeartsInput = document.getElementById(
    "maxHeartsInput",
  ) as HTMLInputElement;

  if (currentMaxHeartsEl) {
    currentMaxHeartsEl.textContent = maxHearts
      ? maxHearts.toString()
      : "Unlimited";
  }
  if (maxHeartsInput) {
    maxHeartsInput.value = maxHearts ? maxHearts.toString() : "";
  }
}

async function setMaxHearts() {
  const maxHeartsInput = document.getElementById(
    "maxHeartsInput",
  ) as HTMLInputElement;
  const value = maxHeartsInput.value.trim();

  let maxHearts: number | null = null;
  if (value !== "") {
    maxHearts = parseInt(value);
    if (isNaN(maxHearts) || maxHearts < 1) {
      alert(
        "Please enter a valid number (1 or greater), or leave empty for unlimited.",
      );
      return;
    }
  }

  try {
    // Fetch current status doc to preserve other fields
    const statusDoc = await getDoc(
      doc(db, `competitions/${COMPETITION_ID}/status/current`),
    );
    const existingData = statusDoc.exists()
      ? statusDoc.data()
      : { status: "open" };

    await setDoc(doc(db, `competitions/${COMPETITION_ID}/status/current`), {
      ...existingData,
      maxHearts: maxHearts,
      lastUpdated: new Date().toISOString(),
    });

    console.log(`Max hearts set to: ${maxHearts ?? "unlimited"}`);
    alert(
      maxHearts
        ? `✅ Max hearts limit set to ${maxHearts}.`
        : "✅ Max hearts limit removed (unlimited).",
    );
    updateMaxHeartsUI(maxHearts);
  } catch (error) {
    console.error("Error setting max hearts:", error);
    alert("Failed to update max hearts. Check console for details.");
  }
}

// Make function available globally
(window as any).setMaxHearts = setMaxHearts;

// ===== CLEAR ALL VOTES (Testing) =====

async function clearAllVotes() {
  const confirmed = confirm(
    "⚠️ WARNING: This will permanently delete ALL votes from the database.\n\nAre you absolutely sure you want to continue?",
  );

  if (!confirmed) return;

  const doubleCheck = confirm(
    "🚨 FINAL CONFIRMATION: This action cannot be undone.\n\nClick OK to delete all votes.",
  );

  if (!doubleCheck) return;

  try {
    const votesRef = collection(db, `competitions/${COMPETITION_ID}/votes`);
    const snapshot = await getDocs(votesRef);

    if (snapshot.empty) {
      alert("No votes to delete.");
      return;
    }

    const deleteCount = snapshot.size;
    const deletePromises = snapshot.docs.map((docSnapshot) =>
      deleteDoc(
        doc(db, `competitions/${COMPETITION_ID}/votes`, docSnapshot.id),
      ),
    );

    await Promise.all(deletePromises);

    console.log(`✅ Deleted ${deleteCount} votes`);
    alert(
      `✅ Successfully deleted ${deleteCount} vote${deleteCount > 1 ? "s" : ""}.`,
    );

    // Refresh dashboard if visible
    startDashboardListener();
  } catch (error) {
    console.error("Error clearing votes:", error);
    alert("Failed to clear votes. Check console for details.");
  }
}

// Make function available globally
(window as any).clearAllVotes = clearAllVotes;

// ===== COUPLE MANAGEMENT (Step 11) =====

async function loadCouples() {
  const couplesList = document.getElementById("couplesList");
  if (!couplesList) return;

  try {
    const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);
    const snapshot = await getDocs(couplesRef);

    if (snapshot.empty) {
      couplesList.innerHTML = `
        <div class="col-span-full text-center py-8 text-white/70">
          <p>No couples added yet. Add your first couple above!</p>
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

    couplesList.innerHTML = "";
    couples.forEach(({ id, data }) => {
      const coupleCard = createCoupleCard(id, data);
      couplesList.appendChild(coupleCard);
    });
  } catch (error) {
    console.error("Error loading couples:", error);
    couplesList.innerHTML = `
      <div class="col-span-full text-center py-8 text-red-400">
        <p>Error loading couples. Check console for details.</p>
      </div>
    `;
  }
}

function createCoupleCard(id: string, couple: Couple): HTMLElement {
  const card = document.createElement("div");
  card.className =
    "bg-white/10 rounded-lg p-4 border border-gold-bright/30 hover:bg-white/15 transition-all";

  const leadPhoto =
    couple.leadPhoto ||
    couple.headshot ||
    "https://via.placeholder.com/150?text=Pro";
  const followPhoto =
    couple.followPhoto || "https://via.placeholder.com/150?text=Star";

  const leadLabel = couple.leadName || "Pro";
  const followLabel = couple.followName || "Star";

  card.innerHTML = `
    <div class="flex gap-2 mb-3">
      <div class="flex-1 text-center">
        <img 
          src="${leadPhoto}" 
          alt="${leadLabel}"
          class="w-full h-32 object-cover rounded-lg"
        />
        <p class="text-xs text-white/70 mt-1 truncate">${leadLabel}</p>
      </div>
      <div class="flex-1 text-center">
        <img 
          src="${followPhoto}" 
          alt="${followLabel}"
          class="w-full h-32 object-cover rounded-lg"
        />
        <p class="text-xs text-white/70 mt-1 truncate">${followLabel}</p>
      </div>
    </div>
    <h4 class="text-lg font-semibold mb-2 text-gold-bright text-center">${couple.name}</h4>
    ${couple.music || couple.dance ? `<p class="text-sm font-semibold text-gold-bright text-center mb-2">${couple.music || ""}${couple.music && couple.dance ? " -- " : ""}${couple.dance || ""}</p>` : ""}
    <div class="flex flex-wrap gap-2">
      <button 
        onclick="editCoupleName('${id}', '${couple.name.replace(/'/g, "\\'")}')"
        class="flex-1 px-3 py-2 bg-gold-bright/20 text-gold-bright rounded hover:bg-gold-bright/30 text-sm"
      >
        Edit Name
      </button>
      <button
        onclick="editCouplePhotos('${id}')"
        class="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm"
      >
        Edit Photos
      </button>
      <button 
        onclick="editCoupleMusic('${id}', '${(couple.music || "").replace(/'/g, "\\'")}')"
        class="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 text-sm"
      >
        Edit Music
      </button>
      <button 
        onclick="editCoupleDance('${id}', '${(couple.dance || "").replace(/'/g, "\\'")}')"
        class="flex-1 px-3 py-2 bg-pink-500/20 text-pink-400 rounded hover:bg-pink-500/30 text-sm"
      >
        Edit Dance
      </button>
      <button 
        onclick="deleteCouple('${id}')"
        class="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
      >
        Delete
      </button>
    </div>
  `;

  return card;
}

async function addCouple(
  leadName: string,
  followName: string,
  leadPhotoFile: File | null,
  followPhotoFile: File | null,
  music: string,
  dance: string,
) {
  try {
    // Generate couple name from lead and follow names
    const name = `${leadName} & ${followName}`;

    let leadPhoto: string | null = null;
    let followPhoto: string | null = null;

    if (leadPhotoFile) {
      leadPhoto = await compressAndConvertToBase64(leadPhotoFile);
    }
    if (followPhotoFile) {
      followPhoto = await compressAndConvertToBase64(followPhotoFile);
    }

    const coupleData: Partial<Couple> = {
      name,
      leadName,
      followName,
      judgeScore: 0,
      order: Date.now(),
    };

    if (leadPhoto) coupleData.leadPhoto = leadPhoto;
    if (followPhoto) coupleData.followPhoto = followPhoto;
    if (music) coupleData.music = music;
    if (dance) coupleData.dance = dance;

    await addDoc(
      collection(db, `competitions/${COMPETITION_ID}/couples`),
      coupleData,
    );

    console.log("Couple added successfully!");
    await loadCouples();
  } catch (error) {
    console.error("Error adding couple:", error);
    alert("Failed to add couple. Check console for details.");
  }
}

async function editCoupleName(id: string, currentName: string) {
  const newName = prompt("Enter new name:", currentName);
  if (!newName || newName === currentName) return;

  try {
    const coupleRef = doc(db, `competitions/${COMPETITION_ID}/couples`, id);
    await updateDoc(coupleRef, { name: newName });
    console.log("Couple name updated!");
    await loadCouples();
  } catch (error) {
    console.error("Error updating couple:", error);
    alert("Failed to update couple name.");
  }
}

async function editCoupleMusic(id: string, currentMusic: string) {
  const newMusic = prompt("Enter music name:", currentMusic || "");
  if (newMusic === null || newMusic === currentMusic) return;

  try {
    const coupleRef = doc(db, `competitions/${COMPETITION_ID}/couples`, id);
    await updateDoc(coupleRef, { music: newMusic.trim() || "" });
    console.log("Couple music updated!");
    await loadCouples();
  } catch (error) {
    console.error("Error updating couple music:", error);
    alert("Failed to update couple music.");
  }
}

async function editCoupleDance(id: string, currentDance: string) {
  const newDance = prompt("Enter dance name:", currentDance || "");
  if (newDance === null || newDance === currentDance) return;

  try {
    const coupleRef = doc(db, `competitions/${COMPETITION_ID}/couples`, id);
    await updateDoc(coupleRef, { dance: newDance.trim() || "" });
    console.log("Couple dance updated!");
    await loadCouples();
  } catch (error) {
    console.error("Error updating couple dance:", error);
    alert("Failed to update couple dance.");
  }
}

async function deleteCouple(id: string) {
  if (!confirm("Are you sure you want to delete this couple?")) return;

  try {
    await deleteDoc(doc(db, `competitions/${COMPETITION_ID}/couples`, id));
    console.log("Couple deleted!");
    await loadCouples();
  } catch (error) {
    console.error("Error deleting couple:", error);
    alert("Failed to delete couple.");
  }
}

async function editCouplePhotos(id: string) {
  // Create a modal-style file picker
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4";
  overlay.innerHTML = `
    <div class="bg-purple-dark border border-gold-bright/50 rounded-xl p-6 max-w-md w-full space-y-4">
      <h3 class="text-xl font-bold text-gold-bright">Update Photos</h3>
      <div>
        <label class="block text-sm font-medium mb-1">Pro Name</label>
        <input type="text" id="editLeadName" class="w-full px-3 py-2 bg-white/10 border border-gold-bright/30 rounded text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Star Name</label>
        <input type="text" id="editFollowName" class="w-full px-3 py-2 bg-white/10 border border-gold-bright/30 rounded text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">New Pro Photo</label>
        <input type="file" id="editLeadPhoto" accept="image/*" class="w-full px-3 py-2 bg-white/10 border border-gold-bright/30 rounded text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gold-bright file:text-purple-dark file:cursor-pointer" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">New Star Photo</label>
        <input type="file" id="editFollowPhoto" accept="image/*" class="w-full px-3 py-2 bg-white/10 border border-gold-bright/30 rounded text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gold-bright file:text-purple-dark file:cursor-pointer" />
      </div>
      <p class="text-xs text-white/50">Leave a field blank to keep the current value.</p>
      <div class="flex gap-3">
        <button id="editPhotoSave" class="flex-1 btn-primary">Save</button>
        <button id="editPhotoCancel" class="flex-1 btn-secondary">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Load existing names and music/dance
  try {
    const coupleDoc = await getDoc(
      doc(db, `competitions/${COMPETITION_ID}/couples`, id),
    );
    if (coupleDoc.exists()) {
      const data = coupleDoc.data();
      (document.getElementById("editLeadName") as HTMLInputElement).value =
        data.leadName || "";
      (document.getElementById("editFollowName") as HTMLInputElement).value =
        data.followName || "";
    }
  } catch {
    /* ignore */
  }

  document.getElementById("editPhotoCancel")!.addEventListener("click", () => {
    overlay.remove();
  });

  document
    .getElementById("editPhotoSave")!
    .addEventListener("click", async () => {
      const leadPhotoInput = document.getElementById(
        "editLeadPhoto",
      ) as HTMLInputElement;
      const followPhotoInput = document.getElementById(
        "editFollowPhoto",
      ) as HTMLInputElement;
      const leadNameInput = document.getElementById(
        "editLeadName",
      ) as HTMLInputElement;
      const followNameInput = document.getElementById(
        "editFollowName",
      ) as HTMLInputElement;

      const updates: Record<string, any> = {};

      if (leadNameInput.value.trim())
        updates.leadName = leadNameInput.value.trim();
      if (followNameInput.value.trim())
        updates.followName = followNameInput.value.trim();

      if (leadPhotoInput.files?.[0]) {
        updates.leadPhoto = await compressAndConvertToBase64(
          leadPhotoInput.files[0],
        );
      }
      if (followPhotoInput.files?.[0]) {
        updates.followPhoto = await compressAndConvertToBase64(
          followPhotoInput.files[0],
        );
      }

      if (Object.keys(updates).length === 0) {
        overlay.remove();
        return;
      }

      try {
        await updateDoc(
          doc(db, `competitions/${COMPETITION_ID}/couples`, id),
          updates,
        );
        console.log("Photos/names updated!");
        await loadCouples();
      } catch (error) {
        console.error("Error updating photos:", error);
        alert("Failed to update. Check console.");
      }
      overlay.remove();
    });
}

// Make functions available globally
(window as any).editCoupleName = editCoupleName;
(window as any).editCoupleMusic = editCoupleMusic;
(window as any).editCoupleDance = editCoupleDance;
(window as any).deleteCouple = deleteCouple;
(window as any).editCouplePhotos = editCouplePhotos;

// ===== JUDGE SCORING (Step 12) =====

let scoringMode: "individual" | "quick" = "individual";

function setScoringMode(mode: "individual" | "quick") {
  scoringMode = mode;

  // Update button styles
  const individualBtn = document.getElementById("individualModeBtn");
  const quickBtn = document.getElementById("quickModeBtn");

  if (mode === "individual") {
    individualBtn?.classList.add("bg-gold-bright", "text-purple-dark");
    individualBtn?.classList.remove(
      "bg-white/10",
      "text-white",
      "border",
      "border-gold-bright/30",
    );
    quickBtn?.classList.remove("bg-gold-bright", "text-purple-dark");
    quickBtn?.classList.add(
      "bg-white/10",
      "text-white",
      "border",
      "border-gold-bright/30",
    );
  } else {
    quickBtn?.classList.add("bg-gold-bright", "text-purple-dark");
    quickBtn?.classList.remove(
      "bg-white/10",
      "text-white",
      "border",
      "border-gold-bright/30",
    );
    individualBtn?.classList.remove("bg-gold-bright", "text-purple-dark");
    individualBtn?.classList.add(
      "bg-white/10",
      "text-white",
      "border",
      "border-gold-bright/30",
    );
  }

  loadJudgeScores();
}

async function loadJudgeScores() {
  const scoresList = document.getElementById("judgeScoresList");
  if (!scoresList) return;

  try {
    const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);
    const snapshot = await getDocs(couplesRef);

    if (snapshot.empty) {
      scoresList.innerHTML = `
        <div class="text-center py-8 text-white/70">
          <p>No couples added yet. Add couples in the "Manage Couples" tab first.</p>
        </div>
      `;
      return;
    }

    scoresList.innerHTML = "";
    snapshot.forEach((docSnapshot) => {
      const couple = docSnapshot.data() as Couple;
      const scoreCard = createScoreCard(docSnapshot.id, couple);
      scoresList.appendChild(scoreCard);
    });
  } catch (error) {
    console.error("Error loading judge scores:", error);
  }
}

function createScoreCard(id: string, couple: Couple): HTMLElement {
  const card = document.createElement("div");
  card.className = "bg-white/10 rounded-lg p-6 border border-gold-bright/30";

  const currentScore = couple.judgeScore || 0;

  if (scoringMode === "individual") {
    card.innerHTML = `
      <h4 class="text-xl font-semibold mb-4 text-gold-bright">${couple.name}</h4>
      <p class="text-sm text-white/70 mb-3">Enter scores from 6 judges (0-10 each, max 60 total)</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        ${[1, 2, 3, 4, 5, 6]
          .map(
            (judgeNum) => `
          <div>
            <label class="text-xs text-white/70">Judge ${judgeNum}</label>
            <input 
              type="number" 
              min="0" 
              max="10" 
              class="w-full px-3 py-2 bg-white/5 border border-gold-bright/30 rounded text-white judge-score-input"
              data-couple-id="${id}"
              data-judge="${judgeNum}"
            />
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="flex items-center justify-between bg-gold-bright/20 rounded-lg p-3">
        <span class="font-semibold">Total Score:</span>
        <span id="avg-${id}" class="text-2xl font-bold text-gold-bright">${currentScore.toFixed(1)}</span> / 60
        <span class="text-sm text-white/70 ml-2">(normalized: ${((currentScore / 60) * 50).toFixed(1)} / 50)</span>
      </div>
      <button 
        onclick="saveIndividualScores('${id}')"
        class="mt-4 btn-primary w-full"
      >
        Save Judge Scores
      </button>
    `;

    // Add event listeners for auto-calculate
    setTimeout(() => {
      const inputs = card.querySelectorAll(".judge-score-input");
      inputs.forEach((input) => {
        input.addEventListener("input", () => calculateAverage(id));
      });
    }, 0);
  } else {
    // Quick mode
    card.innerHTML = `
      <h4 class="text-xl font-semibold mb-4 text-gold-bright">${couple.name}</h4>
      <p class="text-sm text-white/70 mb-3">Enter combined judge score (0-60 from 60 judges)</p>
      <div class="flex gap-3 items-end">
        <div class="flex-1">
          <input 
            type="number" 
            min="0" 
            max="60" 
            step="0.1"
            value="${currentScore}"
            id="quick-${id}"
            class="w-full px-4 py-3 bg-white/5 border border-gold-bright/30 rounded text-white text-lg"
            placeholder="Enter score"
          />
        </div>
        <button 
          onclick="saveQuickScore('${id}')"
          class="btn-primary px-6 py-3"
        >
          Save
        </button>
      </div>
      <div class="mt-3 text-sm text-white/70">
        Current score: <span class="text-gold-bright font-semibold">${currentScore.toFixed(1)}</span> / 60
        <span class="text-white/50 ml-2">(normalized: ${((currentScore / 60) * 50).toFixed(1)} / 50)</span>
      </div>
    `;
  }

  return card;
}

function calculateAverage(coupleId: string) {
  const inputs = document.querySelectorAll(
    `input.judge-score-input[data-couple-id="${coupleId}"]`,
  ) as NodeListOf<HTMLInputElement>;
  let sum = 0;
  let count = 0;

  inputs.forEach((input) => {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      sum += value;
      count++;
    }
  });

  const total = sum; // Changed from average to total sum
  const avgDisplay = document.getElementById(`avg-${coupleId}`);
  if (avgDisplay) {
    avgDisplay.textContent = total.toFixed(1);
  }
}

async function saveIndividualScores(coupleId: string) {
  const inputs = document.querySelectorAll(
    `input.judge-score-input[data-couple-id="${coupleId}"]`,
  ) as NodeListOf<HTMLInputElement>;
  let sum = 0;
  let count = 0;

  inputs.forEach((input) => {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      sum += value;
      count++;
    }
  });

  if (count === 0) {
    alert("Please enter at least one judge score");
    return;
  }

  const totalScore = sum; // Changed from average to total

  try {
    const coupleRef = doc(
      db,
      `competitions/${COMPETITION_ID}/couples`,
      coupleId,
    );
    await updateDoc(coupleRef, { judgeScore: totalScore });

    // Show success message
    const normalized = (totalScore / 60) * 50;
    alert(
      `✅ Judge scores saved! Total: ${totalScore.toFixed(1)} / 60 (normalized: ${normalized.toFixed(1)} / 50)`,
    );
    await loadJudgeScores();
  } catch (error) {
    console.error("Error saving judge scores:", error);
    alert("Failed to save scores. Check console for details.");
  }
}

async function saveQuickScore(coupleId: string) {
  const input = document.getElementById(
    `quick-${coupleId}`,
  ) as HTMLInputElement;
  const score = parseFloat(input.value);

  if (isNaN(score) || score < 0 || score > 60) {
    alert("Please enter a valid score between 0 and 60");
    return;
  }

  try {
    const coupleRef = doc(
      db,
      `competitions/${COMPETITION_ID}/couples`,
      coupleId,
    );
    await updateDoc(coupleRef, { judgeScore: score });

    alert(`✅ Score saved: ${score.toFixed(1)}`);
    await loadJudgeScores();
  } catch (error) {
    console.error("Error saving score:", error);
    alert("Failed to save score. Check console for details.");
  }
}

// Make functions available globally
(window as any).setScoringMode = setScoringMode;
(window as any).saveIndividualScores = saveIndividualScores;
(window as any).saveQuickScore = saveQuickScore;

// ===== REAL-TIME DASHBOARD (Step 13) =====

let dashboardUnsubscribe: (() => void) | null = null;

function startDashboardListener() {
  if (dashboardUnsubscribe) {
    dashboardUnsubscribe(); // Unsubscribe from existing listener
  }

  const votesRef = collection(db, `competitions/${COMPETITION_ID}/votes`);
  const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);

  // Real-time listener for votes
  dashboardUnsubscribe = onSnapshot(votesRef, async (votesSnapshot) => {
    // Update total votes
    const totalVotesEl = document.getElementById("totalVotes");
    if (totalVotesEl) {
      totalVotesEl.textContent = votesSnapshot.size.toString();
    }

    // Count unique voters
    const uniqueVotersEl = document.getElementById("uniqueVoters");
    if (uniqueVotersEl) {
      uniqueVotersEl.textContent = votesSnapshot.size.toString();
    }

    // Get couples to calculate votes per couple
    const couplesSnapshot = await getDocs(couplesRef);
    const totalCouplesEl = document.getElementById("totalCouples");
    if (totalCouplesEl) {
      totalCouplesEl.textContent = couplesSnapshot.size.toString();
    }

    // Calculate votes per couple
    const voteCounts: {
      [coupleId: string]: { yes: number; no: number; name: string };
    } = {};

    couplesSnapshot.forEach((coupleDoc) => {
      const couple = coupleDoc.data() as Couple;
      voteCounts[coupleDoc.id] = { yes: 0, no: 0, name: couple.name };
    });

    votesSnapshot.forEach((voteDoc) => {
      const voteData = voteDoc.data();
      if (voteData.votes) {
        Object.entries(voteData.votes).forEach(([coupleId, vote]) => {
          if (voteCounts[coupleId]) {
            if (vote === "yes") {
              voteCounts[coupleId].yes++;
            } else if (vote === "no") {
              voteCounts[coupleId].no++;
            }
          }
        });
      }
    });

    // Display votes per couple
    const votesPerCoupleEl = document.getElementById("votesPerCouple");
    if (votesPerCoupleEl) {
      if (Object.keys(voteCounts).length === 0) {
        votesPerCoupleEl.innerHTML = `
          <div class="text-center py-4 text-white/70">
            No couples or votes yet
          </div>
        `;
      } else {
        votesPerCoupleEl.innerHTML = Object.entries(voteCounts)
          .map(([, data]) => {
            const total = data.yes + data.no;
            const percentage =
              total > 0 ? ((data.yes / total) * 100).toFixed(1) : "0.0";
            return `
              <div class="bg-white/5 rounded-lg p-4 border border-gold-bright/20">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-semibold text-gold-bright">${data.name}</span>
                  <span class="text-sm text-white/70">${percentage}% Yes</span>
                </div>
                <div class="flex gap-4 text-sm">
                  <span class="text-green-400">✓ ${data.yes} Yes</span>
                  <span class="text-red-400">✗ ${data.no} No</span>
                  <span class="text-white/70">Total: ${total}</span>
                </div>
              </div>
            `;
          })
          .join("");
      }
    }

    // Display recent voters
    const recentVotersEl = document.getElementById("recentVoters");
    if (recentVotersEl) {
      if (votesSnapshot.empty) {
        recentVotersEl.innerHTML = `
          <div class="text-center py-4 text-white/70">
            No votes yet
          </div>
        `;
      } else {
        const votes = votesSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => {
            const aTime = a.timestamp?.toMillis() || 0;
            const bTime = b.timestamp?.toMillis() || 0;
            return bTime - aTime;
          })
          .slice(0, 10); // Show last 10 voters

        recentVotersEl.innerHTML = votes
          .map((vote: any) => {
            const time = vote.timestamp
              ? new Date(vote.timestamp.toMillis()).toLocaleString()
              : "Unknown time";
            return `
              <div class="bg-white/5 rounded-lg p-3 border border-gold-bright/20 text-sm">
                <div class="flex justify-between">
                  <span class="font-semibold">${vote.voterName || "Anonymous"}</span>
                  <span class="text-white/70">${time}</span>
                </div>
              </div>
            `;
          })
          .join("");
      }
    }
  });
}

function stopDashboardListener() {
  if (dashboardUnsubscribe) {
    dashboardUnsubscribe();
    dashboardUnsubscribe = null;
  }
}

// ===== PRESENTATION MODE (Day 3 - Steps 17-21) =====

interface CoupleWithScores {
  id: string;
  name: string;
  headshot?: string;
  leadPhoto?: string;
  followPhoto?: string;
  leadName?: string;
  followName?: string;
  music?: string;
  dance?: string;
  judgeScore: number;
  audienceScore: number;
  finalScore: number;
  yesVotes: number;
  totalVotes: number;
  audienceRevealed: boolean;
  judgesRevealed: boolean;
}

let presentationCouples: CoupleWithScores[] = [];

// Step 19: Calculate and Normalize Scores
function calculateAudienceScore(yesVotes: number, totalVotes: number): number {
  if (totalVotes === 0) return 0;
  // Normalize to 0-50
  return (yesVotes / totalVotes) * 50;
}

function normalizeJudgeScore(judgeScore: number): number {
  // Judge score is 0-60 (6 judges × 0-10 each), normalize to 0-50
  return (judgeScore / 60) * 50;
}

function calculateFinalScore(
  audienceScore: number,
  judgeScore: number,
): number {
  return audienceScore + judgeScore;
}

async function loadPresentationData() {
  try {
    // Fetch couples
    const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);
    const couplesSnapshot = await getDocs(couplesRef);

    // Fetch all votes
    const votesRef = collection(db, `competitions/${COMPETITION_ID}/votes`);
    const votesSnapshot = await getDocs(votesRef);

    // Count votes per couple
    const voteCounts: { [coupleId: string]: { yes: number; total: number } } =
      {};

    votesSnapshot.forEach((voteDoc) => {
      const voteData = voteDoc.data();
      const votes = voteData.votes || {};

      Object.entries(votes).forEach(([coupleId, vote]) => {
        if (!voteCounts[coupleId]) {
          voteCounts[coupleId] = { yes: 0, total: 0 };
        }
        voteCounts[coupleId].total++;
        if (vote === "yes") {
          voteCounts[coupleId].yes++;
        }
      });
    });

    // Build couples with scores
    presentationCouples = [];
    couplesSnapshot.forEach((coupleDoc) => {
      const coupleData = coupleDoc.data();
      const coupleId = coupleDoc.id;
      const votes = voteCounts[coupleId] || { yes: 0, total: 0 };

      const judgeScoreNormalized = normalizeJudgeScore(
        coupleData.judgeScore || 0,
      );
      const audienceScore = calculateAudienceScore(votes.yes, votes.total);
      const finalScore = calculateFinalScore(
        audienceScore,
        judgeScoreNormalized,
      );

      presentationCouples.push({
        id: coupleId,
        name: coupleData.name,
        headshot: coupleData.headshot,
        leadPhoto: coupleData.leadPhoto,
        followPhoto: coupleData.followPhoto,
        leadName: coupleData.leadName,
        followName: coupleData.followName,
        music: coupleData.music,
        dance: coupleData.dance,
        judgeScore: judgeScoreNormalized,
        audienceScore: audienceScore,
        finalScore: finalScore,
        yesVotes: votes.yes,
        totalVotes: votes.total,
        audienceRevealed: false,
        judgesRevealed: false,
      });
    });

    // Sort by final score descending
    presentationCouples.sort((a, b) => b.finalScore - a.finalScore);

    generatePodiumView();
  } catch (error) {
    console.error("Error loading presentation data:", error);
  }
}

// Generate the podium view in fullscreen mode
function generatePodiumView() {
  const container = document.getElementById("barChartContainer");
  if (!container) return;

  // We repurpose the barChartContainer as the main podium area
  container.innerHTML = `
    <div class="flex justify-center items-end gap-4 md:gap-8 min-h-[70vh] pt-12" id="podiumStage">
      <!-- 2nd Place -->
      <div id="podium-2nd" class="flex flex-col items-center opacity-0 transition-all duration-[2000ms]">
        <div class="text-center mb-4">
          <div class="text-5xl md:text-6xl mb-2">🥈</div>
          <div id="podium-2nd-photos" class="flex gap-2 justify-center mb-3">
            <img id="podium-2nd-lead" class="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-gray-300" alt="2nd place pro" />
            <img id="podium-2nd-follow" class="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-gray-300" alt="2nd place star" />
          </div>
          <h3 id="podium-2nd-name" class="text-xl md:text-2xl font-bold text-white mb-1 opacity-0 transition-opacity duration-[3000ms]"></h3>
          <p id="podium-2nd-music" class="text-sm text-white/60 opacity-0 transition-opacity duration-[3000ms]"></p>
          <p id="podium-2nd-score" class="text-lg md:text-xl text-gold-bright font-semibold mt-1 opacity-0 transition-opacity duration-[3000ms]"></p>
        </div>
        <div class="w-36 md:w-48 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-center justify-center" style="height: 180px">
          <span class="text-5xl md:text-6xl font-bold text-white/30">2</span>
        </div>
      </div>

      <!-- 1st Place (Tallest) -->
      <div id="podium-1st" class="flex flex-col items-center opacity-0 transition-all duration-[2000ms]">
        <div class="text-center mb-4">
          <div class="text-6xl md:text-7xl mb-2">🥇</div>
          <div id="podium-1st-photos" class="flex gap-2 justify-center mb-3">
            <img id="podium-1st-lead" class="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-4 border-gold-bright" alt="1st place pro" />
            <img id="podium-1st-follow" class="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-4 border-gold-bright" alt="1st place star" />
          </div>
          <h3 id="podium-1st-name" class="text-2xl md:text-3xl font-bold text-gold-bright mb-1 opacity-0 transition-opacity duration-[3000ms]"></h3>
          <p id="podium-1st-music" class="text-sm text-white/60 opacity-0 transition-opacity duration-[3000ms]"></p>
          <p id="podium-1st-score" class="text-xl md:text-2xl text-gold-bright font-bold mt-1 opacity-0 transition-opacity duration-[3000ms]"></p>
        </div>
        <div class="w-44 md:w-56 bg-gradient-to-t from-gold-dark to-gold-bright rounded-t-lg flex items-center justify-center" style="height: 240px">
          <span class="text-6xl md:text-7xl font-bold text-white/30">1</span>
        </div>
      </div>

      <!-- 3rd Place -->
      <div id="podium-3rd" class="flex flex-col items-center opacity-0 transition-all duration-[2000ms]">
        <div class="text-center mb-4">
          <div class="text-5xl md:text-6xl mb-2">🥉</div>
          <div id="podium-3rd-photos" class="flex gap-2 justify-center mb-3">
            <img id="podium-3rd-lead" class="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-amber-700" alt="3rd place pro" />
            <img id="podium-3rd-follow" class="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-amber-700" alt="3rd place star" />
          </div>
          <h3 id="podium-3rd-name" class="text-xl md:text-2xl font-bold text-white mb-1 opacity-0 transition-opacity duration-[3000ms]"></h3>
          <p id="podium-3rd-music" class="text-sm text-white/60 opacity-0 transition-opacity duration-[3000ms]"></p>
          <p id="podium-3rd-score" class="text-lg md:text-xl text-gold-bright font-semibold mt-1 opacity-0 transition-opacity duration-[3000ms]"></p>
        </div>
        <div class="w-36 md:w-48 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg flex items-center justify-center" style="height: 140px">
          <span class="text-5xl md:text-6xl font-bold text-white/30">3</span>
        </div>
      </div>
    </div>
  `;

  // Pre-fill data (hidden until revealed)
  if (presentationCouples.length >= 3) {
    const places = [
      { place: "1st", index: 0 },
      { place: "2nd", index: 1 },
      { place: "3rd", index: 2 },
    ];

    places.forEach(({ place, index }) => {
      const couple = presentationCouples[index];
      const leadImg = document.getElementById(
        `podium-${place}-lead`,
      ) as HTMLImageElement;
      const followImg = document.getElementById(
        `podium-${place}-follow`,
      ) as HTMLImageElement;
      const nameEl = document.getElementById(`podium-${place}-name`);
      const musicEl = document.getElementById(`podium-${place}-music`);
      const scoreEl = document.getElementById(`podium-${place}-score`);

      if (leadImg)
        leadImg.src =
          couple.leadPhoto ||
          couple.headshot ||
          "https://via.placeholder.com/150?text=Pro";
      if (followImg)
        followImg.src =
          couple.followPhoto || "https://via.placeholder.com/150?text=Star";
      if (nameEl) nameEl.textContent = couple.name;
      if (musicEl && couple.music && couple.dance) {
        musicEl.textContent = `${couple.music} -- ${couple.dance}`;
      } else if (musicEl && couple.music) {
        musicEl.textContent = couple.music;
      } else if (musicEl && couple.dance) {
        musicEl.textContent = couple.dance;
      }
      if (scoreEl)
        scoreEl.textContent = `${couple.finalScore.toFixed(1)} / 100`;
    });
  }
}

function revealPlace(place: "3rd" | "2nd" | "1st") {
  const podiumDiv = document.getElementById(`podium-${place}`);
  const nameEl = document.getElementById(`podium-${place}-name`);
  const musicEl = document.getElementById(`podium-${place}-music`);
  const scoreEl = document.getElementById(`podium-${place}-score`);

  if (!podiumDiv) return;

  // Show the podium block (fade in the whole column)
  podiumDiv.style.opacity = "1";

  // After the podium fades in, fade in the name with slow motion
  setTimeout(() => {
    if (nameEl) nameEl.style.opacity = "1";
    if (musicEl) musicEl.style.opacity = "1";
    if (scoreEl) scoreEl.style.opacity = "1";
  }, 1500);

  // Trigger confetti for 1st place
  if (place === "1st") {
    triggerConfetti();
  }
}

// Step 21: Add Confetti Animation
function triggerConfetti() {
  // Use canvas-confetti library (will be loaded via CDN in HTML)
  if (typeof (window as any).confetti === "function") {
    const duration = 10000; // 10 seconds
    const end = Date.now() + duration;

    const colors = ["#FFD700", "#764BA2", "#D4AF37"]; // Gold and purple

    (function frame() {
      (window as any).confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      (window as any).confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } else {
    console.warn("Confetti library not loaded");
  }
}

// ===== LDOC WINNERS FUNCTIONALITY =====

interface LdocWinner {
  couple: CoupleWithScores;
  rank: number; // Rank by audience score only (1-based)
}

// Get LDOC winners - top 2 by audience score that are NOT in top 3 by final score
function getLdocWinners(): LdocWinner[] {
  if (presentationCouples.length < 5) return []; // Need at least 5 couples

  // Get top 3 couple IDs by final score
  const top3Ids = new Set(presentationCouples.slice(0, 3).map((c) => c.id));

  // Sort all couples by audience score descending
  const byAudienceScore = [...presentationCouples].sort(
    (a, b) => b.audienceScore - a.audienceScore,
  );

  // Find couples with highest audience score NOT in top 3
  const ldocWinners: LdocWinner[] = [];
  let audienceRank = 0;

  for (const couple of byAudienceScore) {
    audienceRank++;
    if (!top3Ids.has(couple.id)) {
      ldocWinners.push({ couple, rank: audienceRank });
      if (ldocWinners.length >= 2) break;
    }
  }

  return ldocWinners;
}

// Reveal LDOC winner (1 or 2)
function revealLdoc(position: number) {
  const ldocWinners = getLdocWinners();
  const ldocIndex = position - 1; // 0 or 1

  if (ldocIndex >= ldocWinners.length) {
    alert(`LDOC Winner #${position} not available (need at least 5 couples).`);
    return;
  }

  const { couple, rank } = ldocWinners[ldocIndex];
  showCoupleReveal(
    couple,
    `🎉 LDOC Winner #${position}`,
    `#${rank} Audience Favorite`,
  );

  // Disable the button
  const btn = document.getElementById(
    `reveal-ldoc-${position}-btn`,
  ) as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// Reveal place in fullscreen mode
function revealPlaceFullscreen(place: "3rd" | "2nd" | "1st") {
  const placeIndex = place === "1st" ? 0 : place === "2nd" ? 1 : 2;
  if (presentationCouples.length <= placeIndex) {
    alert(`Not enough couples for ${place} place reveal.`);
    return;
  }

  const couple = presentationCouples[placeIndex];
  const emoji = place === "1st" ? "🥇" : place === "2nd" ? "🥈" : "🥉";
  const title = `${emoji} ${place.charAt(0).toUpperCase() + place.slice(1)} Place`;

  showCoupleReveal(couple, title);

  // Also reveal on the podium
  revealPlace(place);

  // Disable the button
  const btn = document.getElementById(
    `reveal-${place}-fullscreen-btn`,
  ) as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// Show couple in fullscreen reveal overlay
function showCoupleReveal(
  couple: CoupleWithScores,
  title: string,
  subtitle?: string,
) {
  const overlay = document.getElementById("coupleRevealOverlay");
  const content = document.getElementById("coupleRevealContent");

  if (!overlay || !content) return;

  const leadPhoto =
    couple.leadPhoto ||
    couple.headshot ||
    "https://via.placeholder.com/200?text=Pro";
  const followPhoto =
    couple.followPhoto || "https://via.placeholder.com/200?text=Star";

  content.innerHTML = `
    <div class="animate-fade-in">
      <h2 class="text-gold-bright text-4xl md:text-6xl font-bold mb-4 font-display">${title}</h2>
      ${subtitle ? `<p class="text-white/70 text-xl mb-6">${subtitle}</p>` : ""}
      <div class="flex gap-6 justify-center mb-6">
        <div class="text-center">
          <img src="${leadPhoto}" alt="${couple.leadName || "Pro"}" class="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-gold-bright shadow-2xl" />
          <p class="text-white/80 mt-3 text-lg">${couple.leadName || "Pro"}</p>
        </div>
        <div class="text-center">
          <img src="${followPhoto}" alt="${couple.followName || "Star"}" class="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-gold-bright shadow-2xl" />
          <p class="text-white/80 mt-3 text-lg">${couple.followName || "Star"}</p>
        </div>
      </div>
      <h3 class="text-gold-bright text-3xl md:text-5xl font-bold mb-4">${couple.name}</h3>
      ${couple.music || couple.dance ? `<p class="text-white/60 text-xl mb-4">${couple.music || ""}${couple.music && couple.dance ? " — " : ""}${couple.dance || ""}</p>` : ""}
    </div>
  `;

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");

  // Play confetti for 1st place
  if (title.includes("1st")) {
    triggerConfetti();
  }
}

// Close reveal overlay
function closeRevealOverlay() {
  const overlay = document.getElementById("coupleRevealOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
  }
}

// ===== STATISTICS TAB =====

async function loadStatistics() {
  const tableBody = document.getElementById("statisticsTableBody");
  if (!tableBody) return;

  try {
    // Fetch couples
    const couplesRef = collection(db, `competitions/${COMPETITION_ID}/couples`);
    const couplesSnapshot = await getDocs(couplesRef);

    // Fetch all votes
    const votesRef = collection(db, `competitions/${COMPETITION_ID}/votes`);
    const votesSnapshot = await getDocs(votesRef);

    // Count votes per couple
    const voteCounts: { [coupleId: string]: { yes: number; total: number } } =
      {};

    votesSnapshot.forEach((voteDoc) => {
      const voteData = voteDoc.data();
      const votes = voteData.votes || {};

      Object.entries(votes).forEach(([coupleId, vote]) => {
        if (!voteCounts[coupleId]) {
          voteCounts[coupleId] = { yes: 0, total: 0 };
        }
        voteCounts[coupleId].total++;
        if (vote === "yes") {
          voteCounts[coupleId].yes++;
        }
      });
    });

    // Build statistics data
    const stats: Array<{
      name: string;
      audienceScore: number;
      judgeScore: number;
      finalScore: number;
      yesVotes: number;
      totalVotes: number;
    }> = [];

    couplesSnapshot.forEach((coupleDoc) => {
      const coupleData = coupleDoc.data();
      const coupleId = coupleDoc.id;
      const votes = voteCounts[coupleId] || { yes: 0, total: 0 };

      const judgeScoreNormalized = normalizeJudgeScore(
        coupleData.judgeScore || 0,
      );
      const audienceScore = calculateAudienceScore(votes.yes, votes.total);
      const finalScore = calculateFinalScore(
        audienceScore,
        judgeScoreNormalized,
      );

      stats.push({
        name: coupleData.name,
        audienceScore,
        judgeScore: judgeScoreNormalized,
        finalScore,
        yesVotes: votes.yes,
        totalVotes: votes.total,
      });
    });

    // Sort by final score descending
    stats.sort((a, b) => b.finalScore - a.finalScore);

    if (stats.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-white/70">No couples found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = stats
      .map(
        (stat, index) => `
      <tr class="border-b border-white/10 hover:bg-white/5">
        <td class="px-4 py-3 font-bold text-gold-bright">${index + 1}</td>
        <td class="px-4 py-3 font-semibold">${stat.name}</td>
        <td class="px-4 py-3 text-right">${stat.audienceScore.toFixed(2)} / 50</td>
        <td class="px-4 py-3 text-right">${stat.judgeScore.toFixed(2)} / 50</td>
        <td class="px-4 py-3 text-right font-bold text-gold-bright">${stat.finalScore.toFixed(2)} / 100</td>
        <td class="px-4 py-3 text-right text-green-400">${stat.yesVotes}</td>
        <td class="px-4 py-3 text-right text-white/70">${stat.totalVotes}</td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading statistics:", error);
    tableBody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-red-400">Error loading statistics.</td></tr>`;
  }
}

function refreshStatistics() {
  loadStatistics();
}

// Make functions available globally
(window as any).revealPlace = revealPlace;
(window as any).revealLdoc = revealLdoc;
(window as any).revealPlaceFullscreen = revealPlaceFullscreen;
(window as any).closeRevealOverlay = closeRevealOverlay;
(window as any).refreshStatistics = refreshStatistics;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin dashboard ready!");

  // Start dashboard listener (default tab)
  startDashboardListener();

  // Load couples
  loadCouples();

  // Handle add couple form
  const addCoupleForm = document.getElementById(
    "addCoupleForm",
  ) as HTMLFormElement;
  if (addCoupleForm) {
    addCoupleForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const leadNameInput = document.getElementById(
        "leadName",
      ) as HTMLInputElement;
      const followNameInput = document.getElementById(
        "followName",
      ) as HTMLInputElement;
      const leadPhotoInput = document.getElementById(
        "leadPhoto",
      ) as HTMLInputElement;
      const followPhotoInput = document.getElementById(
        "followPhoto",
      ) as HTMLInputElement;
      const musicInput = document.getElementById(
        "coupleMusic",
      ) as HTMLInputElement;
      const danceInput = document.getElementById(
        "coupleDance",
      ) as HTMLInputElement;

      const leadName = leadNameInput?.value.trim() || "";
      const followName = followNameInput?.value.trim() || "";
      const leadPhotoFile = leadPhotoInput?.files?.[0] || null;
      const followPhotoFile = followPhotoInput?.files?.[0] || null;
      const music = musicInput?.value.trim() || "";
      const dance = danceInput?.value.trim() || "";

      if (!leadName || !followName) {
        alert("Please enter both pro and star names");
        return;
      }

      // Show loading state
      const submitBtn = addCoupleForm.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Adding...";
      submitBtn.disabled = true;

      await addCouple(
        leadName,
        followName,
        leadPhotoFile,
        followPhotoFile,
        music,
        dance,
      );

      // Reset form
      addCoupleForm.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }

  // ===== PRESENTATION MODE INITIALIZATION =====
  const enterFullscreenBtn = document.getElementById("enterFullscreen");
  const exitFullscreenBtn = document.getElementById("exitFullscreen");
  const presentationFullscreen = document.getElementById(
    "presentationFullscreen",
  );

  if (enterFullscreenBtn && exitFullscreenBtn && presentationFullscreen) {
    enterFullscreenBtn.addEventListener("click", () => {
      presentationFullscreen.classList.remove("hidden");
      loadPresentationData();
    });

    exitFullscreenBtn.addEventListener("click", () => {
      presentationFullscreen.classList.add("hidden");
    });
  }

  // Close reveal overlay button
  const closeRevealBtn = document.getElementById("closeRevealOverlay");
  if (closeRevealBtn) {
    closeRevealBtn.addEventListener("click", closeRevealOverlay);
  }
});
