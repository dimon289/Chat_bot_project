const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------------------
// Питання тесту (темперамент)
// ---------------------------
const questions = [
  {
    q: "Як ти реагуєш на стрес?",
    options: ["Спокійно", "Емоційно", "Агресивно", "Уникаю"],
  },
  {
    q: "Як ти приймаєш рішення?",
    options: ["Швидко", "Довго думаю", "Під емоціями", "Питаю інших"],
  },
  {
    q: "Як працюєш у команді?",
    options: ["Лідер", "Спостерігач", "Емоційний учасник", "Уникаю команд"],
  },
  {
    q: "Твій темп життя?",
    options: ["Швидкий", "Рівний", "Нестабільний", "Повільний"],
  },
  {
    q: "Як реагуєш на критику?",
    options: ["Спокійно", "Ображаюсь", "Злюсь", "Ігнорую"],
  },
  {
    q: "Як часто змінюється настрій?",
    options: ["Рідко", "Іноді", "Часто", "Дуже часто"],
  },
  {
    q: "Як починаєш нову справу?",
    options: ["Впевнено", "Обережно", "Емоційно", "Без бажання"],
  },
  {
    q: "Як поводишся у конфліктах?",
    options: ["Мирно", "Уникаю", "Емоційно", "Агресивно"],
  },
  {
    q: "Як ставишся до змін?",
    options: ["Позитивно", "Нейтрально", "Нервую", "Не люблю"],
  },
  {
    q: "Як працюєш під тиском?",
    options: ["Добре", "Середньо", "Погано", "Зупиняюсь"],
  },
];

// ---------------------------
// Стан користувача
// ---------------------------
const userState = {};

// ---------------------------
// /start
// ---------------------------
bot.start(async (ctx) => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  userState[ctx.from.id] = {
    index: 0,
    score: 0,
    startTime: Date.now(),
    questions: shuffled,
  };

  await ctx.reply("Привіт! Це тест на темперамент. Почнемо!");
  sendQuestion(ctx);
});

// ---------------------------
// Відправка питання
// ---------------------------
function sendQuestion(ctx) {
  const state = userState[ctx.from.id];
  const current = state.questions[state.index];

  const keyboard = current.options.map((opt) => [opt]);

  ctx.reply(current.q, {
    reply_markup: {
      keyboard,
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });
}

// ---------------------------
// Обробка відповіді
// ---------------------------
bot.on("text", async (ctx) => {
  const state = userState[ctx.from.id];
  if (!state) return;

  state.score += Math.floor(Math.random() * 4) + 1;
  state.index++;

  if (state.index < state.questions.length) {
    sendQuestion(ctx);
  } else {
    const endTime = Date.now();
    const duration = Math.floor((endTime - state.startTime) / 1000);

    // ---------------------------
    // Визначення темпераменту
    // ---------------------------
    let temperament = "";

    if (state.score <= 15) {
      temperament = "🟦 Флегматик — спокійний, врівноважений, стабільний";
    } else if (state.score <= 25) {
      temperament = "🟩 Сангвінік — активний, товариський, оптимістичний";
    } else if (state.score <= 35) {
      temperament = "🟨 Холерик — емоційний, імпульсивний, енергійний";
    } else {
      temperament = "🟥 Меланхолік — чутливий, глибокий, аналітичний";
    }

    let result =
      `🎯 ТЕСТ ЗАВЕРШЕНО!\n\n` +
      `📊 Бали: ${state.score}\n` +
      `🧠 Тип: ${temperament}\n\n` +
      `⏱ Час: ${duration} сек\n` +
      `📅 Дата: ${new Date().toLocaleString()}`;

    await ctx.reply(result);

    delete userState[ctx.from.id];
  }
});

// ---------------------------
bot.launch();

console.log("Bot started...");