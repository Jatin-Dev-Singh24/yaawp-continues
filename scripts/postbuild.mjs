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

  // Ensure production manifest with real asset URLs replaces any dummy dev manifest
  const serverDir = path.resolve(".output/server");
  if (fs.existsSync(serverDir)) {
    const files = fs.readdirSync(serverDir);
    const realManifest = files.find(
      (f) => f.startsWith("_tanstack-start-manifest_v-") && f.endsWith(".mjs"),
    );
    if (realManifest) {
      const srcPath = path.join(serverDir, realManifest);
      const destPath = path.join(serverDir, "_tanstack-start-manifest_v.mjs");
      fs.copyFileSync(srcPath, destPath);
      console.log(`Replaced dummy manifest with production manifest: ${realManifest}`);
    }
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
