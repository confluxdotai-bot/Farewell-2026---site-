import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Path to store local backups of registrations
const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure registrations JSON file exists
if (!fs.existsSync(REGISTRATIONS_FILE)) {
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2));
}

// Lazy load Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  }
  return aiClient;
}

// Lazy load Firebase Firestore if config environment exists
let db: any = null;
let firebaseInitialized = false;
async function initFirebase() {
  if (firebaseInitialized) return db;
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const { initializeApp } = await import("firebase/app");
      const { getFirestore } = await import("firebase/firestore");
      
      const appInst = initializeApp(firebaseConfig);
      db = getFirestore(appInst, firebaseConfig.firestoreDatabaseId);
      firebaseInitialized = true;
      console.log("Firebase Firestore successfully initialized on backend!");
    } catch (e) {
      console.error("Failed to lazy initialize Firebase Firestore backend:", e);
    }
  }
  return db;
}

// Fallback message templates if AI is not initialized
const FALLBACK_MESSAGES = [
  "Your dedication has truly set a benchmark for all of us. Wishing you a thrilling career ahead where all your code compiles on the first try!",
  "Thank you for being the perfect seniors, always debugging our problems with patience. Farewell and shine bright in the digital universe!",
  "To the dream block, the best branch CSE! May your future be an ultimate loop of success, laughter, and high-performance algorithms.",
  "You leave behind footprints of inspiration in our labs and classrooms. Good luck in compiling your dreams into reality!",
  "You've shown us how to balance chaotic semester schedules and robust coding assignments with style. May your next chapter be zero-exception!"
];

function getRandomFallbackMessage(vibe: string): string {
  const index = Math.abs(vibe.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % FALLBACK_MESSAGES.length;
  return FALLBACK_MESSAGES[index];
}

// API endpoint to query registrations
app.get("/api/registrations", async (req, res) => {
  try {
    // Attempt load from Firebase first if provisioned
    const fireStoreDb = await initFirebase();
    if (fireStoreDb) {
      try {
        const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
        const q = query(collection(fireStoreDb, "registrations"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return res.json(list);
      } catch (fbError) {
        console.warn("Firestore query failed, defaulting to local data backup", fbError);
      }
    }

    // Default to JSON local storage backup
    const rawData = fs.readFileSync(REGISTRATIONS_FILE, "utf-8");
    const list = JSON.parse(rawData);
    // Sort by createdAt descending
    list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch registrations", details: String(error) });
  }
});

// API endpoint to submit registration
app.post("/api/registrations", async (req, res) => {
  try {
    const { name, email, phone, batch, photoUrl, mustCome, avatarColor } = req.body;
    
    if (!name || !batch || !phone || !mustCome) {
      return res.status(400).json({ error: "Name, batch, phone number, and attendance confirmation are required." });
    }

    // Generate unique ID
    const registrationId = "reg_" + Math.random().toString(36).substring(2, 11);
    const createdAt = new Date().toISOString();

    // 1. Craft personalized farewell message using Gemini AI safely
    let farewellMessage = "";
    const ai = getGeminiClient();
    
    if (ai) {
      try {
        const prompt = `You are representing the computer science juniors' organizing team for the CSE Farewell Event 'Sayonara 2.0 (Farewell 2026)' at Global Institute of Management and Technology.
Write a highly warm, welcoming, and encouraging invitation message (1 to 2 sentences, maximum 40 words) for our graduating senior, ${name} belonging to Batch ${batch}. Make it sound incredibly genuine, respectful, and celebrating their journey. Do NOT output markdown, intro/outro, or quote marks. Just the message text.`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (aiResponse && aiResponse.text) {
          farewellMessage = aiResponse.text.trim().replace(/^["']|["']$/g, "");
        }
      } catch (aiError) {
        console.error("Gemini invocation failed, building fallback message:", aiError);
      }
    }

    if (!farewellMessage) {
      farewellMessage = `Dear ${name}, we are absolutely thrilled to celebrate your beautiful journey. As a shining star of the CSE department, you have inspired us all. We look forward to welcome you warmly at Sayonara 2.0!`;
    }

    const newRegistration = {
      id: registrationId,
      name,
      email: email || "",
      phone: phone || "",
      photoUrl: photoUrl || "",
      mustCome: !!mustCome,
      department: "CSE",
      college: "Global Institute of Management and Technology",
      batch,
      vibe: "CSE Alumnus",
      favoriteMemory: "Attending Farewell Ceremony Sayonara 2.0",
      futureAspirations: "",
      messageToJuniors: "",
      farewellMessage,
      avatarColor: avatarColor || "rose",
      createdAt,
    };

    // 2. Save locally first (resilient backend schema)
    const localRaw = fs.readFileSync(REGISTRATIONS_FILE, "utf-8");
    const localList = JSON.parse(localRaw);
    localList.push(newRegistration);
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(localList, null, 2));

    // 3. Sync to Firebase Firestore if initialized
    const fireStoreDb = await initFirebase();
    if (fireStoreDb) {
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(fireStoreDb, "registrations", registrationId), newRegistration);
        console.log(`Synced registration ${registrationId} securely to Firestore.`);
      } catch (fbError) {
        console.warn("Could not save to active Firestore. Stored locally.", fbError);
      }
    }

    res.status(201).json(newRegistration);
  } catch (error) {
    res.status(500).json({ error: "Failed to save registration", details: String(error) });
  }
});

// API endpoint to delete registration
app.delete("/api/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete from local database file
    const rawData = fs.readFileSync(REGISTRATIONS_FILE, "utf-8");
    const list = JSON.parse(rawData);
    const updatedList = list.filter((reg: any) => reg.id !== id);
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(updatedList, null, 2));

    // 2. Delete from Firebase Firestore if active
    const fireStoreDb = await initFirebase();
    if (fireStoreDb) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(fireStoreDb, "registrations", id));
        console.log(`Deleted registration ${id} from Firestore backend.`);
      } catch (fbError) {
        console.warn("Could not sync delete to Firestore database.", fbError);
      }
    }

    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete registration", details: String(error) });
  }
});

// API endpoint to securely verify organizer passcode on backend
app.post("/api/verify-passcode", (req, res) => {
  try {
    const { passcode } = req.body;
    if (!passcode) {
      return res.status(400).json({ error: "Passcode is required." });
    }
    const normalized = passcode.trim().toUpperCase();
    if (normalized === "CSE2026" || normalized === "SAYONARA2026" || normalized === "GIMT2026") {
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, error: "Incorrect passcode." });
  } catch (error) {
    res.status(500).json({ error: "Server error during verification." });
  }
});

// Configure Vite middleware and SPA routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Farewell applet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
