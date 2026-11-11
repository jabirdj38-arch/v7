const moment = require("moment-timezone");

module.exports.config = {
  name: "autotime",
  version: "3.1.1",
  role: 0,
  credit: "MOHAMMAD BADOL",
  description: "প্রতি ঘন্টায় সব গ্রুপে স্টাইলিশ টাইম + নামাজের রিমাইন্ডার",
  category: "system",
  prefix: true,
  cooldown: 5
};

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

function toBanglaNum(n) {
  return String(n).replace(/[0-9]/g, d => BN_DIGITS[+d]);
}

function buildMessage() {
  const now = moment.tz("Asia/Dhaka");
  const hour = now.format("hh");
  const minute = now.format("mm");
  const second = now.format("ss");
  const ampm = now.format("A");
  const bnDay = BN_DAYS[now.day()];
  const day = toBanglaNum(now.format("DD"));
  const month = BN_MONTHS[now.month()];
  const year = toBanglaNum(now.format("YYYY"));
  const hourNum = parseInt(now.format("H"));

  let greeting = "";
  let emoji = "";
  let namazNote = "";
  let isNamazTime = false;

  if (hourNum >= 5 && hourNum < 12) {
    greeting = "শুভ সকাল";
    emoji = "🌅";
  } else if (hourNum >= 12 && hourNum < 15) {
    greeting = "শুভ দুপুর";
    emoji = "☀️";
  } else if (hourNum >= 15 && hourNum < 18) {
    greeting = "শুভ বিকেল";
    emoji = "🌤️";
  } else if (hourNum >= 18 && hourNum < 21) {
    greeting = "শুভ সন্ধ্যা";
    emoji = "🌆";
  } else {
    greeting = "শুভ রাত";
    emoji = "🌙";
  }

  if (hourNum === 5) {
    isNamazTime = true;
    namazNote = `\n🕌 ═══ ফজরের সময় ═══ 🕌\n🤲 @everyone উঠো সবাই! ফজরের আজান হয়েছে\n⏰ নামাজ পড়ে দিন শুরু করো, আল্লাহ বরকত দিবেন 💖\n🕌═══════════════════🕌\n`;
  } else if (hourNum === 13) {
    isNamazTime = true;
    namazNote = `\n🕌 ═══ যোহরের সময় ═══ 🕌\n🤲 @everyone সব কাজ বন্ধ করে নামাজে যাও\n⏰ আল্লাহর ডাক এসেছে, নামাজ আদায় করো 🕌✨\n🕌═══════════════════🕌\n`;
  } else if (hourNum === 16) {
    isNamazTime = true;
    namazNote = `\n🕌 ═══ আসরের সময় ═══ 🕌\n🤲 @everyone আসরের আজান হয়েছে\n⏰ নামাজ বেহেশতের চাবি, মিস করো না 🗝️✨\n🕌═══════════════════🕌\n`;
  } else if (hourNum === 18) {
    isNamazTime = true;
    namazNote = `\n🕌 ═══ মাগরিবের সময় ═══ 🕌\n🤲 @everyone সূর্য ডুবার আগে নামাজ পড়ে নাও\n⏰ সময় খুব কম, এখনই মসজিদে যাও 🕌\n🕌═══════════════════🕌\n`;
  } else if (hourNum === 19) {
    isNamazTime = true;
    namazNote = `\n🕌 ═══ এশার সময় ═══ 🕌\n🤲 @everyone দিনের শেষ নামাজ\n⏰ এশা পড়ে রাতের বরকত নাও ✨🕌\n🕌═══════════════════🕌\n`;
  }

  const header = isNamazTime? "🕌 𝗡𝗔𝗠𝗔𝗭 𝗧𝗜𝗠𝗘 🕌" : "🕰️ 𝗧𝗜𝗠𝗘 𝗨𝗣𝗗𝗔𝗧𝗘 🕰️";

  return `╔══════════════════╗
║ ${header} ║
╚══════════════════╝
${emoji} ${greeting}! ${emoji}
━━━━━━━━━━━━━━━━━━━━
⏰ সময়: ${hour}:${minute}:${second} ${ampm}
📅 তারিখ: ${day} ${month} ${year}
📆 বার: ${bnDay}
━━━━━━━━━━━━━━━━━━━━${namazNote}
✨ আপনার দিনটি সুন্দর কাটুক ✨
═════════════════════
🤖 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲 + 𝗡𝗮𝗺𝗮𝘇 𝗦𝘆𝘀𝘁𝗲𝗺 🤖
═════════════════════`;
}

module.exports.onLoad = async function ({ api }) {
  if (global.autoTimeInterval) clearInterval(global.autoTimeInterval);
  if (global.autoTimeTimeout) clearTimeout(global.autoTimeTimeout);

  async function sendToAll() {
    const msg = buildMessage();
    const threads = global.data?.allThreadID || [];

    if (threads.length === 0) {
      return console.log("[AUTOTIME] No groups found");
    }

    console.log(`[AUTOTIME] Sending to ${threads.length} groups`);

    for (const tid of threads) {
      try {
        await api.sendMessage(msg, tid);
        await new Promise(r => setTimeout(r, 1500));
      } catch (e) {
        console.log(`[AUTOTIME] Failed ${tid}`);
      }
    }
  }

  const now = moment.tz("Asia/Dhaka");
  const msUntilNextHour = (60 - now.minutes()) * 60 * 1000 - now.seconds() * 1000 - now.milliseconds();

  console.log(`[AUTOTIME] Next update in ${Math.floor(msUntilNextHour / 60000)} minutes`);

  global.autoTimeTimeout = setTimeout(() => {
    sendToAll();
    global.autoTimeInterval = setInterval(sendToAll, 3600000);
  }, msUntilNextHour);

  console.log("[AUTOTIME] Command loaded successfully with Namaz reminder");
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID } = event || {};

  if (!threadID) return console.log("[AUTOTIME] threadID not found");

  // ✅ PREFIX সেফ চেক - এরর খাবে না
  const prefix = global.config?.PREFIX || ".";

  if (args[0] === "off" || args[0] === "stop") {
    if (global.autoTimeInterval) clearInterval(global.autoTimeInterval);
    if (global.autoTimeTimeout) clearTimeout(global.autoTimeTimeout);

    return api.sendMessage(`╔══════════════════╗
║ ⚠️ সিস্টেম বন্ধ ⚠️ ║
╚══════════════════╝
❌ AutoTime বন্ধ করা হয়েছে
━━━━━━━━━━━━━━━━━━━━
💡 চালু করতে টাইপ করুন: ${prefix}autotime on
💡 অথবা: ${prefix}autotime start
════════════════════
🤖 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲 + 𝗡𝗮𝗺𝗮𝘇 𝗦𝘆𝘀𝘁𝗲𝗺 🤖
════════════════════`, threadID, messageID);
  }

  if (args[0] === "on" || args[0] === "start") {
    if (global.autoTimeInterval) {
      return api.sendMessage(`╔══════════════════╗
║ ⚠️ ইতিমধ্যে চালু ⚠️ ║
╚══════════════════╝
✅ AutoTime অলরেডি চালু আছে
━━━━━━━━━━━━━━━━━━━━
💡 বন্ধ করতে টাইপ করুন: ${prefix}autotime off
💡 অথবা: ${prefix}autotime stop
════════════════════
🤖 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲 + 𝗡𝗮𝗺𝗮𝘇 𝗦𝘆𝘀𝘁𝗲𝗺 🤖
════════════════════`, threadID, messageID);
    }

    module.exports.onLoad({ api });

    return api.sendMessage(`╔══════════════════╗
║ ✅ সিস্টেম চালু ✅ ║
╚══════════════════╝
🚀 AutoTime সফলভাবে চালু হয়েছে
━━━━━━━━━━━━━━━━━━━━
⏰ প্রতি ঘন্টায় অটো টাইম পাঠাবে
🕌 নামাজের টাইমে রিমাইন্ডার দিবে
💡 বন্ধ করতে: ${prefix}autotime off
════════════════════
🤖 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲 + 𝗡𝗮𝗺𝗮𝘇 𝗦𝘆𝘀𝘁𝗲𝗺 🤖
════════════════════`, threadID, messageID);
  }

  return api.sendMessage(buildMessage(), threadID, messageID);
};
