const fs = require("fs");
const path = require("path");

const site = "https://trusshelp.com";
const news = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../news/news.json"), "utf8")
);

// ---------- RSS ----------
let rssItems = news.map(item => `
  <item>
    <title>${item.title}</title>
    <link>${site}/news/${item.slug}/</link>
    <guid isPermaLink="true">${site}/news/${item.slug}/</guid>
    <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    <description>${item.summary}</description>
  </item>
`).join("");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TrussHelp Industry News</title>
    <link>${site}/news/</link>
    <description>Industry news related to wood trusses and structural building components.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

fs.writeFileSync(path.join(__dirname, "../rss.xml"), rss);

// ---------- SITEMAP ----------
let urls = news.map(item => `
  <url>
    <loc>${site}/news/${item.slug}/</loc>
    <lastmod>${item.date}</lastmod>
  </url>
`).join("");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
  </url>
  <url>
    <loc>${site}/news/</loc>
  </url>
  ${urls}
</urlset>`;

fs.writeFileSync(path.join(__dirname, "../sitemap.xml"), sitemap);

console.log("RSS and sitemap generated.");

