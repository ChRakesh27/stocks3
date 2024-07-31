const express = require("express");
const openai = require("../config/openai");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { image } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "extract table from image and return JSON array as the result ex: {table:[...],total:0}",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    });
    console.log(
      "🚀 ~ router.post ~ completion.choices[0].message.content:",
      completion.choices[0].message.content
    );

    console.log(JSON.parse(completion.choices[0].message.content));

    res.status(200).json({
      data: JSON.parse(completion.choices[0].message.content),
    });
  } catch (error) {
    res.status(500).json({ message: "Error in openai", error });
    console.log("🚀 ~ router.post ~ :", { message: "Error in openai", error });
  }
});

module.exports = router;
