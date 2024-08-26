const path = require("path");
require("dotenv").config({ path: path.join(process.argv[1], ".env") });

function parseError(error) {
  throw new Error(error.errors[0]?.message);
}

async function main() {
  const auth = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
  };
  const verify = await fetch(
    "https://api.cloudflare.com/client/v4/user/tokens/verify",
    {
      headers: {
        ...auth,
      },
    }
  );
  if (!verify.ok) {
    const error = await verify.json();
    parseError(error);
  }
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const subdomain = process.env.SUBDOMAIN;
  if (!zoneId) {
    throw new Error("No zone ID");
  }
  if (!subdomain) {
    throw new Error("No subdomain");
  }
  const ipResponse = await fetch("https://ipinfo.io/ip");
  const ip = await ipResponse.text();
  const recordsResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      headers: {
        ...auth,
      },
    }
  );
  if (!recordsResponse.ok) {
    const error = await recordsResponse.json();
    parseError(error);
  }
  const records = await recordsResponse.json();
  const record = records.result.find((record) => record.name === subdomain);
  if (record) {
    const recordId = record.id;
    const content = record.content;
    if (content === ip) {
      console.log("no change in ip");
      return 0;
    }
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      {
        method: "PATCH",
        headers: {
          ...auth,
        },
        body: JSON.stringify({
          content: ip,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      parseError(error);
    }
    console.log(`Updated ip -> ${ip}`);
  } else {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        method: "POST",
        headers: {
          ...auth,
        },
        body: JSON.stringify({
          content: ip,
          type: "A",
          name: subdomain,
          ttl: 5 * 60,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      parseError(error);
    }
    console.log(`Created record with ip -> ${ip}`);
  }
}

main();
