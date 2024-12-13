const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate AI summary for long notes
async function generateAISummary(content) {
  if (!content) return "";

  // // If content is short (less than 100 characters), use it as is
  // if (content.length <= 100) {
  //   return content;
  // }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content:
            "Summarize the text below in less than 20 words, highlighting main points and avoiding unnecessary details.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      max_completion_tokens: 150,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content.trim();
    console.log("Generated AI summary:", summary);
    return summary;
  } catch (error) {
    console.error("Error generating AI summary:", error);
    // Fallback to basic summary if AI fails
    return content.substring(0, 100) + "...";
  }
}
function generateBasicSummary(content) {
  if (!content) return "";

  if (content.length <= 100) {
    return content;
  }

  // Try to cut at the end of a sentence within first 100 characters
  const truncated = content.substring(0, 100);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastPeriod > 50) {
    return truncated.substring(0, lastPeriod + 1);
  }

  return truncated.substring(0, lastSpace) + "...";
}
// Define User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Define Note Schema and Model
// Note Schema with summary
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  // summary: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // isAISummary: { type: Boolean, default: false }, // Track if summary was AI-generated
});
const Note = mongoose.model("Note", noteSchema);

// Update timestamps middleware
noteSchema.pre("save", function (next) {
  if (this.isNew) {
    this.createdAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "secret", (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    console.log("Authenticated User ID:", req.user.id);
    next();
  });
};

// Auth Routes
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    console.log("User registered:", user);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Username already exists" });
    } else {
      res.status(400).json({ message: "Error registering user" });
    }
  }
});
app.get("/verify-token", authenticateToken, (req, res) => {
  try {
    // If the authenticateToken middleware passes, the token is valid
    res.json({ valid: true, userId: req.user.id });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ valid: false });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id.toString() }, "secret", {
        expiresIn: "1h",
      });
      res.json({ token });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(400).send("Error logging in");
  }
});
// GET notes route with sorting
app.get("/notes", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching notes for user:", req.user.id);
    const notes = await Note.find({ userId: req.user.id })
      .sort({ updatedAt: -1, createdAt: -1 }) // Sort by updated date, then created date
      .exec();

    console.log("Found notes:", notes);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).send("Error fetching notes");
  }
});
// Update the POST endpoint for notes
app.post("/notes", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Generate summary based on content length
    const generatedTitle = await generateAISummary(content);
    // const summary = generateBasicSummary(content);

    const note = new Note({
      title: generatedTitle,
      content,
      // summary: summary,
      userId: req.user.id,
      // isAISummary: content.length > 100,
    });

    const savedNote = await note.save();
    console.log("Saved note with summary as title:", savedNote);
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).send("Error saving note");
  }
});

// Update the PUT endpoint for notes
app.put("/notes/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Generate new summary if content changed

    // const summary = generateBasicSummary(content);

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        title,
        content,
        // summary: summary,
        updatedAt: Date.now(),
        // isAISummary: content.length > 100,
      },
      { new: true },
    );

    if (!note) {
      return res.status(404).send("Note not found or unauthorized");
    }

    console.log("Updated note with new summary as title:", note);
    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).send("Error updating note");
  }
});
app.delete("/notes/:id", authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    console.log(`Attempting to delete note ${noteId} for user ${userId}`);

    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      userId: userId,
    });

    if (!deletedNote) {
      console.log("Note not found or unauthorized");
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    console.log("Note deleted successfully:", deletedNote);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Error deleting note" });
  }
});
app.post("/notes/generate-title", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const title = await generateAISummary(content);
    res.json(title);
  } catch (error) {
    console.error("Error generating title:", error);
    res.status(500).send("Error generating title");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
