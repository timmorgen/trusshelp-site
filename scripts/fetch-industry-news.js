const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

const parser = new Parser();

const MAX_ITEMS = 5;
const HOURS = 720;
const NOW = Date.now();
const CUTOFF = NOW - HOURS * 60 * 60 * 1000;

const OUTPUT = path.join(__dirname, "../data/industry-news.json");

// Primary authoritative feeds
const PRIMARY_FEEDS = [
  { name: "SBCA", url: "https://www.sbcacomponents.com/rss.xml" },
  { name: "ANSI/TPI", url: "https://www.tpinst.org/rss.xml" },
  { name: "MiTek", url: "https://www.mitek-us.com/rss.xml" },
  { name: "Alpine", url: "https://alpineitw.com/feed/" },
  { name: "Simpson Strong-Tie", url: "https://www.strongtie.com/resources/rss" },
  { name: "ICC", url: "https://www.iccsafe.org/feed/" }
];

// Google News fallback (used only if primary returns zero)
const GOOGLE_FALLBACK =
  "https://news.google.com/rss/search?q=(wood+truss+OR+metal+plate+connected+truss)+site:sbcacomponents.com+OR+site:iccsafe.org+OR+site:strongtie.com+OR+site:alpineitw.com+OR+site:mitek-us.com&hl=en-US&gl=US&ceid=US:en";

function normalize(items) {
  return items
    .filter(i => i.pubDate && new Date(i.pubDate).getTime() >= CUTOFF)
    .map(i => ({
      title: i.title,
      link: i.link,
      source: i.source || i.creator || i.author || ""
    }));
}

async function pullFeeds(feeds) {
  let items = [];
  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);
      const normalized = normalize(
        data.items.map(i => ({ ...i, source: feed.name }))
      );
      items = items.concat(normalized);
    } catch (_) {
      // Ignore broken feeds
    }
  }
  return items;
}

(async () => {
  let items = await pullFeeds(PRIMARY_FEEDS);

  if (items.length === 0) {
    try {
      const google = await parser.parseURL(GOOGLE_FALLBACK);
      items = normalize(google.items);
    } catch (_) {}
  }

  items = items
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_ITEMS);

  fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2));
})();

