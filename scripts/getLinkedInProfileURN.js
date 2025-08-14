const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

async function getProfileURN() {
  const fetch = (await import("node-fetch")).default;
  if (!accessToken) {
    console.error("LINKEDIN_ACCESS_TOKEN not found in .env.local");
    process.exit(1);
  }
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("LinkedIn API error:", err);
    process.exit(1);
  }
  const data = await res.json();
  if (!data.sub) {
    console.error("No sub found in LinkedIn response:", data);
    process.exit(1);
  }
  const urn = `urn:li:person:${data.sub}`;
  console.log("Your LinkedIn Profile URN:", urn);
}

getProfileURN();
