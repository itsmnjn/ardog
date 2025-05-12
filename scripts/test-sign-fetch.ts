// Add an empty export to treat this file as a module, allowing top-level await.
export {}

import fs from "fs"
import path from "path"

/**
 * Script to test fetching the sign model from the local Cloudflare Worker.
 * Run this with `bun run scripts/test-sign-fetch.ts`
 *
 * Make sure `wrangler dev --remote` is running in another terminal.
 */

const workerUrl = "http://localhost:8787" // Default wrangler dev port
const signRoute = "/api/sign"
const targetUrl = `${workerUrl}${signRoute}`
const outputFile = path.join(__dirname, "fetched_ardog_giantsign.glb") // Save in the same directory as the script

console.log(`Attempting to fetch sign model from: ${targetUrl}`)

try {
  const response = await fetch(targetUrl)

  console.log(`Status: ${response.status} ${response.statusText}`)

  if (response.ok) {
    console.log("Successfully fetched the sign model.")
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(outputFile, buffer)
    console.log(`File saved to: ${outputFile}`)
    console.log("Test successful!")
  } else {
    console.error("Failed to fetch the sign model.")
    const errorBody = await response.text()
    console.error(`Error response body: ${errorBody}`)
    process.exit(1) // Exit with error code
  }
} catch (error) {
  console.error(`An error occurred during fetch:`, error)
  process.exit(1) // Exit with error code
}
