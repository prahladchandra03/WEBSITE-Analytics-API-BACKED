const Event = require("../models/events");

// Submit analytics event
exports.collectEvent = async (req, res) => {
  const {
    event,
    url,
    referrer,
    device,
    ipAddress,
    timestamp,
    metadata,
    userId,
  } = req.body;

  if (!event || !url || !device || !ipAddress) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newEvent = new Event({
      event,
      url,
      referrer,
      device,
      ipAddress,
      timestamp: timestamp || new Date(),
      metadata,
      userId,
      appId: req.appId, // Attached by authenticateApiKey middleware
    });

    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event recorded successfully", event: newEvent });
  } catch (error) {
    console.error("Error saving event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get event summary
exports.getEventSummary = async (req, res) => {
  const { event, startDate, endDate, app_id } = req.query;

  if (!event) {
    return res.status(400).json({ message: "Event parameter is required" });
  }

  try {
    const query = { event, appId: app_id || req.appId }; // Use app_id if provided, else use authenticated appId

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      query.timestamp = { $gte: start, $lte: end };
    }

    const events = await Event.find(query);

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for the given criteria" });
    }

    const uniqueUsers = [...new Set(events.map((e) => e.userId))].length;
    const deviceData = events.reduce((acc, e) => {
      acc[e.device] = (acc[e.device] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      event,
      count: events.length,
      uniqueUsers,
      deviceData,
    });
  } catch (error) {
    console.error("Error fetching event summary:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId parameter is required" });
  }

  try {
    const events = await Event.find({ userId, appId: req.appId });

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for the given user" });
    }

    const totalEvents = events.length;
    const recentEvent = events[events.length - 1];

    const deviceDetails = {
      browser: recentEvent.metadata?.browser || "Unknown",
      os: recentEvent.metadata?.os || "Unknown",
    };

    const ipAddress = recentEvent.ipAddress || "Unknown";

    res.status(200).json({
      userId,
      totalEvents,
      deviceDetails,
      ipAddress,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
