import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let cachedChatId: string | null = null;

// API routes FIRST
app.post("/api/book", async (req, res) => {
  try {
    const { name, phone, game } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and Phone are required" });
    }

    const token = "8885988428:AAEdekNhzks6Fbi5Yx_D5HoSZuRiqmS_SH8";
    let chatId = process.env.TELEGRAM_CHAT_ID || cachedChatId;

    if (!chatId) {
      try {
        const updateRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const updateData = await updateRes.json();
        if (updateData.ok && updateData.result && updateData.result.length > 0) {
          // Iterate backwards to find the latest valid chat ID
          for (let i = updateData.result.length - 1; i >= 0; i--) {
            const update = updateData.result[i];
            const msg = update.message || update.channel_post || update.edited_message;
            if (msg && msg.chat) {
              chatId = String(msg.chat.id);
              cachedChatId = chatId;
              break;
            }
          }
        }
      } catch (tgErr) {
        console.error("Failed to query telegram updates", tgErr);
      }
    }

    if (!chatId) {
      return res.status(422).json({
        error: "telegram_chat_id_not_found",
        message: "Не найден ID чата в Telegram. Пожалуйста, напишите вашему боту любое сообщение (например, /start) в Telegram первой строкой, чтобы он узнал ваш аккаунт, и попробуйте отправить форму заново!"
      });
    }

    const telegramText = `🔔 *Новая запись на Sochi VR!* 🔔\n\n👤 *Имя:* ${name}\n📞 *Телефон:* ${phone}\n🎮 *Выбранная игра:* ${game || "На месте"}\n🏝 *Локация:* Пляж Солоники-1\n🎟 *Скидка:* 10% гарантирована`;

    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: "Markdown"
      })
    });

    const telegramData = await telegramRes.json();
    if (!telegramData.ok) {
      return res.status(500).json({ error: "Telegram API Error", message: telegramData.description });
    }

    return res.json({ success: true, chatId });
  } catch (err: any) {
    console.error("Booking error:", err);
    return res.status(500).json({ error: "Server Error", message: err.message });
  }
});

async function startServer() {
  // Vite middleware for development
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
