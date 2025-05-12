import { R2Bucket } from "@cloudflare/workers-types"

// Define the environment bindings, including the R2 bucket.
// This tells TypeScript what properties to expect on the `env` object.
interface Env {
  MODELS_BUCKET: R2Bucket
  // If you have other bindings, like for static assets in a SPA, define them here.
  // ASSETS: Fetcher;
}

export default {
  // The fetch handler is the main entry point for incoming requests.
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Log the received path to the wrangler terminal
    console.log(`[Worker] Received request for path: ${pathname}`)

    // Handle API requests
    if (pathname.startsWith("/api/")) {
      // Route for fetching the sign model
      if (pathname === "/api/sign") {
        console.log("[Worker] Matched /api/sign route.")
        try {
          // env.MODELS_BUCKET refers to the R2 bucket binding.
          // When using 'wrangler dev --remote':
          // - It uses the 'preview_bucket_name' ("ardog-models-preview") if defined in wrangler.jsonc.
          // - Otherwise, it falls back to 'bucket_name' ("ardog-models").
          // Ensure "ardog_giantsign.glb" is in the *root* of "ardog-models-preview" for this test.
          const objectName = "ardog_giantsign.glb"
          console.log(`[Worker] Attempting to get object: '${objectName}' from R2 bucket.`)

          // env.MODELS_BUCKET refers to the R2 bucket binding configured in wrangler.jsonc.
          // - When deployed (`wrangler deploy`), this binds to the bucket specified by "bucket_name" ("ardog-models").
          // - When running in preview/development (`wrangler dev --remote` or `wrangler dev --preview`),
          //   it binds to the bucket specified by "preview_bucket_name" ("ardog-models-preview").
          // This allows you to use separate buckets for production and testing environments
          // while using the same binding name in your code.
          const object = await env.MODELS_BUCKET.get(objectName)

          if (object === null) {
            console.log(`[Worker] Object '${objectName}' not found in R2 bucket.`)
            return new Response(
              `Object '${objectName}' not found in R2 bucket.`,
              { status: 404 },
            )
          }

          console.log(`[Worker] Object '${objectName}' found in R2, preparing response.`)
          const headers = new Headers()
          object.writeHttpMetadata(headers)
          headers.set("etag", object.httpEtag) // Important for caching
          // Set appropriate Content-Type if known, R2 usually infers it from upload metadata
          // headers.set("Content-Type", "model/gltf-binary") // Example for .glb

          // Return the object's body directly as the response.
          // The body is a ReadableStream, which is efficiently streamed to the client.
          return new Response(object.body, {
            headers,
          })
        } catch (e: any) {
          console.error("[Worker] Error in /api/sign route:", e.message, e.stack)
          return new Response(`Error fetching object from R2: ${e.message}`, { status: 500 })
        }
      }

      // Existing dummy API route (can be removed if no longer needed)
      if (pathname === "/api/hello") {
        console.log("[Worker] Matched /api/hello route.")
        return Response.json({
          message: "This is the /api/hello response. If you called /api/sign, this is WRONG.",
          source: "worker/index.ts",
        })
      }
    }

    // If the request doesn't match any known API routes, return 404.
    // Note: In a real SPA setup with client-side routing, you might want
    // wrangler.jsonc's "assets" configuration to handle serving index.html
    // for non-API routes instead of returning 404 here.
    // Your current config `"not_found_handling": "single-page-application"`
    // in the top-level `assets` config might handle this, but explicitly returning
    // assets or letting the request fall through might be needed depending on setup.
    // For now, we explicitly 404 on non-matched paths.
    console.log(`[Worker] Path '${pathname}' did not match any known worker routes. Returning 404.`)
    return new Response("Worker: Route not found.", { status: 404 })
  },
} satisfies ExportedHandler<Env>
