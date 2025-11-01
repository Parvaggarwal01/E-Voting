const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");

const prisma = new PrismaClient();

// Configure multer for permanent file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/manifestos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const partyId = req.user.id;
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${partyId}-${timestamp}-${originalName}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Upload manifesto (permanent storage)
const uploadManifesto = async (req, res) => {
  try {
    const { title, description } = req.body;
    const partyId = req.user.partyId || req.user.userId;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    console.log("📄 Processing manifesto upload for party:", partyId);

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    console.log("✅ PDF text extracted, length:", extractedText.length);

    // Get party info
    const party = await prisma.party.findUnique({
      where: { id: partyId },
      select: { name: true, symbolUrl: true },
    });

    // Save to database with permanent storage
    const manifesto = await prisma.manifesto.create({
      data: {
        partyId,
        title: title || req.file.originalname,
        description: description || "",
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        extractedText,
        processed: true,
      },
      include: {
        party: {
          select: { name: true, symbolUrl: true },
        },
      },
    });

    console.log("✅ Manifesto permanently stored:", manifesto.id);

    res.json({
      message: "Manifesto uploaded and stored permanently",
      manifesto: {
        id: manifesto.id,
        title: manifesto.title,
        description: manifesto.description,
        fileName: manifesto.fileName,
        fileSize: manifesto.fileSize,
        uploadedAt: manifesto.uploadedAt,
        party: manifesto.party,
        textLength: extractedText.length,
        processed: manifesto.processed,
      },
    });
  } catch (error) {
    console.error("❌ Manifesto upload error:", error);

    // Clean up uploaded file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Failed to upload manifesto",
      error: error.message,
    });
  }
};

// Get party manifestos (for party portal)
const getPartyManifestos = async (req, res) => {
  try {
    const partyId = req.user.partyId || req.user.userId;

    const manifestos = await prisma.manifesto.findMany({
      where: { partyId },
      include: {
        party: {
          select: { name: true, symbolUrl: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    res.json({
      manifestos: manifestos.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        fileName: m.fileName,
        fileSize: m.fileSize,
        uploadedAt: m.uploadedAt,
        processed: m.processed,
        party: m.party,
        textLength: m.extractedText?.length || 0,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching manifestos:", error);
    res.status(500).json({ message: "Failed to fetch manifestos" });
  }
};

// Get available parties with manifestos (for voter chatbot)
const getPartiesWithManifestos = async (req, res) => {
  try {
    const parties = await prisma.party.findMany({
      where: {
        manifestos: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        symbolUrl: true,
        _count: {
          select: {
            manifestos: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      parties: parties.map((p) => ({
        id: p.id,
        name: p.name,
        symbolUrl: p.symbolUrl,
        manifestoCount: p._count.manifestos,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching parties:", error);
    res.status(500).json({ message: "Failed to fetch parties" });
  }
};

// Chat with party manifesto using AI service
const chatWithManifesto = async (req, res) => {
  try {
    const { partyId, question, conversationHistory = [] } = req.body;

    if (!partyId || !question) {
      return res
        .status(400)
        .json({ message: "Party ID and question are required" });
    }

    console.log("🤖 Processing chat request for party:", partyId);

    // Get party manifesto
    const manifestos = await prisma.manifesto.findMany({
      where: { partyId },
      include: {
        party: {
          select: { name: true, symbolUrl: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    if (manifestos.length === 0) {
      return res.json({
        response: `Sorry, no manifesto is available for this party yet. Please ask them to upload their manifesto first.`,
        party: null,
        sources: [],
      });
    }

    // Combine all manifestos text for the party
    const combinedText = manifestos
      .map(
        (m) => `
Document: ${m.title}
Content: ${m.extractedText}
    `
      )
      .join("\n\n");

    console.log("📤 Sending request to AI service...");

    // Call AI service instead of Ollama directly
    const aiResponse = await axios.post(
      "http://localhost:5001/chat/manifesto",
      {
        question: question,
        manifesto_content: combinedText,
        party_name: manifestos[0].party.name,
        conversation_history: conversationHistory,
      },
      {
        timeout: 120000, // 2 minute timeout for AI processing
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const response = aiResponse.data;

    console.log("✅ AI service response received");

    res.json({
      response: response.response,
      party: {
        id: manifestos[0].partyId,
        name: manifestos[0].party.name,
        symbol: manifestos[0].party.symbolUrl,
      },
      sources: manifestos.map((m) => ({
        id: m.id,
        title: m.title,
        fileName: m.fileName,
      })),
      timestamp: new Date().toISOString(),
      model: response.model || "AI Service",
    });
  } catch (error) {
    console.error("❌ Chat error:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message:
          "AI service is not running. Please start the AI service first.",
        error: "Service unavailable",
      });
    }

    res.status(500).json({
      message: "Failed to process your question",
      error: error.response?.data?.error || error.message,
    });
  }
};

// Analyze manifesto using AI service
const analyzeManifesto = async (req, res) => {
  try {
    const { id } = req.params;
    const partyId = req.user.partyId || req.user.userId;

    const manifesto = await prisma.manifesto.findFirst({
      where: {
        id,
        partyId,
      },
      include: {
        party: {
          select: { name: true },
        },
      },
    });

    if (!manifesto) {
      return res.status(404).json({ message: "Manifesto not found" });
    }

    console.log("🔍 Analyzing manifesto:", manifesto.title);

    // Call AI service for analysis
    const analysisResponse = await axios.post(
      "http://localhost:5001/analyze/manifesto",
      {
        manifesto_text: manifesto.extractedText,
        party_name: manifesto.party.name,
      }
    );

    res.json({
      analysis: analysisResponse.data.analysis,
      manifesto: {
        id: manifesto.id,
        title: manifesto.title,
        party: manifesto.party.name,
      },
    });
  } catch (error) {
    console.error("❌ Analysis error:", error);
    res.status(500).json({
      message: "Failed to analyze manifesto",
      error: error.message,
    });
  }
};

// Delete manifesto (only by party)
const deleteManifesto = async (req, res) => {
  try {
    const { id } = req.params;
    const partyId = req.user.partyId || req.user.userId;

    const manifesto = await prisma.manifesto.findFirst({
      where: {
        id,
        partyId, // Ensure party can only delete their own manifestos
      },
    });

    if (!manifesto) {
      return res
        .status(404)
        .json({ message: "Manifesto not found or access denied" });
    }

    // Delete file from filesystem
    if (fs.existsSync(manifesto.filePath)) {
      fs.unlinkSync(manifesto.filePath);
      console.log("🗑️ File deleted:", manifesto.filePath);
    }

    // Delete from database
    await prisma.manifesto.delete({
      where: { id },
    });

    console.log("✅ Manifesto deleted:", id);

    res.json({
      message: "Manifesto deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ message: "Failed to delete manifesto" });
  }
};

// Download manifesto PDF
const downloadManifesto = async (req, res) => {
  try {
    const { id } = req.params;

    const manifesto = await prisma.manifesto.findUnique({
      where: { id },
      include: {
        party: {
          select: { name: true },
        },
      },
    });

    if (!manifesto) {
      return res.status(404).json({ message: "Manifesto not found" });
    }

    if (!fs.existsSync(manifesto.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${manifesto.fileName}"`
    );

    const fileStream = fs.createReadStream(manifesto.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("❌ Download error:", error);
    res.status(500).json({ message: "Failed to download manifesto" });
  }
};

module.exports = {
  upload,
  uploadManifesto,
  getPartyManifestos,
  getPartiesWithManifestos,
  chatWithManifesto,
  analyzeManifesto,
  deleteManifesto,
  downloadManifesto,
};
