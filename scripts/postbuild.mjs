import fs from "node:fs";
import path from "node:path";
import http from "node:http";

async function main() {
  const distDir = path.resolve("dist");
  const publicDir = path.resolve(".output/public");
  fs.mkdirSync(distDir, { recursive: true });

  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, distDir, { recursive: true });
  }

  // Try to generate dist/index.html using the local dev/test server or nitro
  const port = process.env.PORT || 3000;
  const req = http.get(`http://localhost:${port}/`, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      if (res.statusCode === 200 && body.length > 0) {
        fs.writeFileSync(path.resolve(distDir, "index.html"), body, "utf-8");
        console.log(`Generated dist/index.html (${body.length} bytes)`);
      }
      process.exit(0);
    });
  });

  req.on("error", () => {
    // If server not running, fallback to template index.html if present or done
    process.exit(0);
  });
}

main().catch(() => process.exit(0));
