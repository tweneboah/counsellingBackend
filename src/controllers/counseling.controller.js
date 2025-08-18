const Chat = require("../models/chat.model");
const Journal = require("../models/journal.model");
const geminiService = require("../services/gemini.service");

// Start or continue a chat session
exports.chatWithAI = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const studentId = req.user.id;

    if (!message) {
      return res.status(400).json({
        status: "fail",
        message: "Message content is required",
      });
    }

    let chat;

    // If chatId is provided, find and continue existing chat
    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        student: studentId,
        isActive: true,
      });

      if (!chat) {
        return res.status(404).json({
          status: "fail",
          message: "Chat session not found or inactive",
        });
      }
    } else {
      // Create a new chat session
      chat = new Chat({
        student: studentId,
        title: "New Conversation",
        messages: [],
        startedAt: Date.now(),
        isActive: true,
      });
    }

    // Add student message to chat
    chat.messages.push({
      sender: "student",
      content: message,
      timestamp: Date.now(),
    });

    // Analyze message for risk factors
    const riskAnalysis = await geminiService.analyzeForRiskFactors(message);

    // Get chat history for context (limit to last 10 messages)
    const chatHistory = chat.messages.slice(-10);

    // Process message with Gemini AI
    const aiResponse = await geminiService.processChatMessage(
      message,
      chatHistory
    );

    // Add AI response to chat
    chat.messages.push({
      sender: "ai",
      content: aiResponse,
      timestamp: Date.now(),
    });

    // Update chat title if it's a new conversation
    if (chat.messages.length <= 2 && chat.title === "New Conversation") {
      // Extract a title from the first exchange
      const firstMessages = chat.messages.map((m) => m.content).join(" ");
      chat.title =
        firstMessages.length > 50
          ? `${firstMessages.substring(0, 47)}...`
          : firstMessages;
    }

    // Save the updated chat
    await chat.save();

    res.status(200).json({
      status: "success",
      data: {
        chat: {
          id: chat._id,
          title: chat.title,
          latestMessage: {
            sender: "ai",
            content: aiResponse,
            timestamp: Date.now(),
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in chat with AI:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a list of chat sessions for a student
exports.getChatSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10, isActive } = req.query;

    const query = { student: studentId };

    // Filter by active status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const options = {
      sort: { updatedAt: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };

    const chats = await Chat.find(query, null, options);
    const totalChats = await Chat.countDocuments(query);

    // Format the response
    const formattedChats = chats.map((chat) => {
      const lastMessage =
        chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null;

      return {
        id: chat._id,
        title: chat.title,
        startedAt: chat.startedAt,
        lastMessageAt: lastMessage ? lastMessage.timestamp : chat.startedAt,
        messageCount: chat.messages.length,
        category: chat.category,
        isActive: chat.isActive,
      };
    });

    res.status(200).json({
      status: "success",
      results: formattedChats.length,
      totalChats,
      totalPages: Math.ceil(totalChats / limit),
      currentPage: parseInt(page),
      data: {
        chats: formattedChats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a specific chat session with all messages
exports.getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;
    const studentId = req.user.id;

    const chat = await Chat.findOne({
      _id: chatId,
      student: studentId,
    });

    if (!chat) {
      return res.status(404).json({
        status: "fail",
        message: "Chat session not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        chat: {
          id: chat._id,
          title: chat.title,
          startedAt: chat.startedAt,
          endedAt: chat.endedAt,
          category: chat.category,
          isActive: chat.isActive,
          messages: chat.messages,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// End a chat session
exports.endChatSession = async (req, res) => {
  try {
    const chatId = req.params.id;
    const studentId = req.user.id;
    const { feedback, moodRating } = req.body;

    const chat = await Chat.findOne({
      _id: chatId,
      student: studentId,
      isActive: true,
    });

    if (!chat) {
      return res.status(404).json({
        status: "fail",
        message: "Active chat session not found",
      });
    }

    // Update chat session
    chat.isActive = false;
    chat.endedAt = Date.now();

    // Add mood rating if provided
    if (moodRating && moodRating >= 1 && moodRating <= 5) {
      chat.moodRating = moodRating;
    }

    // Add end message with feedback if provided
    if (feedback) {
      chat.messages.push({
        sender: "student",
        content: `Feedback: ${feedback}`,
        timestamp: Date.now(),
      });
    }

    await chat.save();

    res.status(200).json({
      status: "success",
      message: "Chat session ended successfully",
      data: {
        chatId: chat._id,
        endedAt: chat.endedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create a new journal entry
exports.createJournalEntry = async (req, res) => {
  try {
    const { title, content, mood, tags, isPrivate, isAnonymized } = req.body;
    const studentId = req.user.id;

    // Create the journal entry
    const journal = new Journal({
      student: studentId,
      title,
      content,
      mood: mood || "Neutral",
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      isAnonymized: isAnonymized !== undefined ? isAnonymized : false,
    });

    // Generate AI analysis if content is provided
    if (content) {
      const aiAnalysis = await geminiService.generateJournalInsights(content);
      journal.aiAnalysis = aiAnalysis;

      // Analyze for risk factors
      const riskAnalysis = await geminiService.analyzeForRiskFactors(content);
    }

    await journal.save();

    res.status(201).json({
      status: "success",
      data: {
        journal: {
          id: journal._id,
          title: journal.title,
          mood: journal.mood,
          createdAt: journal.createdAt,
          aiAnalysis: journal.aiAnalysis,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get journal entries for a student
exports.getJournalEntries = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10, mood } = req.query;

    const query = { student: studentId };

    // Filter by mood if provided
    if (mood) {
      query.mood = mood;
    }

    const options = {
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };

    const journals = await Journal.find(query, null, options);
    const totalEntries = await Journal.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: journals.length,
      totalEntries,
      totalPages: Math.ceil(totalEntries / limit),
      currentPage: parseInt(page),
      data: {
        journals,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a specific journal entry
exports.getJournalById = async (req, res) => {
  try {
    const journalId = req.params.id;
    const studentId = req.user.id;

    const journal = await Journal.findOne({
      _id: journalId,
      student: studentId,
    });

    if (!journal) {
      return res.status(404).json({
        status: "fail",
        message: "Journal entry not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        journal,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update a journal entry
exports.updateJournalEntry = async (req, res) => {
  try {
    const journalId = req.params.id;
    const studentId = req.user.id;
    const { title, content, mood, tags, isPrivate, isAnonymized } = req.body;

    const journal = await Journal.findOne({
      _id: journalId,
      student: studentId,
    });

    if (!journal) {
      return res.status(404).json({
        status: "fail",
        message: "Journal entry not found",
      });
    }

    // Update journal fields
    if (title) journal.title = title;
    if (content) journal.content = content;
    if (mood) journal.mood = mood;
    if (tags) journal.tags = tags;
    if (isPrivate !== undefined) journal.isPrivate = isPrivate;
    if (isAnonymized !== undefined) journal.isAnonymized = isAnonymized;

    // Generate new AI analysis if content was updated
    if (content && content !== journal.content) {
      const aiAnalysis = await geminiService.generateJournalInsights(content);
      journal.aiAnalysis = aiAnalysis;

      // Analyze for risk factors
      const riskAnalysis = await geminiService.analyzeForRiskFactors(content);
    }

    await journal.save();

    res.status(200).json({
      status: "success",
      data: {
        journal,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete a journal entry
exports.deleteJournalEntry = async (req, res) => {
  try {
    const journalId = req.params.id;
    const studentId = req.user.id;

    const journal = await Journal.findOneAndDelete({
      _id: journalId,
      student: studentId,
    });

    if (!journal) {
      return res.status(404).json({
        status: "fail",
        message: "Journal entry not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
