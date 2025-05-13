import { R2Bucket } from "@cloudflare/workers-types"
import { Document, WebIO } from "@gltf-transform/core"
import { EXTTextureWebP } from "@gltf-transform/extensions"

// Define the environment bindings, including the R2 bucket.
// This tells TypeScript what properties to expect on the `env` object.
interface Env {
  MODELS_BUCKET: R2Bucket
  // If you have other bindings, like for static assets in a SPA, define them here.
  // ASSETS: Fetcher;
}

// Constants for R2 bucket public URLs
const PREVIEW_BUCKET_URL = "https://pub-8d28dca4c0b24be488cc7ad0288df568.r2.dev"
const PRODUCTION_BUCKET_URL = "https://models.ar.dog"

// Helper function to get the appropriate bucket URL based on environment
function getBucketUrl(request: Request): string {
  // Check if we're in a development/preview environment
  // This can be expanded with more sophisticated environment detection if needed
  const hostname = new URL(request.url).hostname
  return hostname.includes("localhost") || hostname.includes("preview") || hostname.includes("workers.dev")
      || hostname.includes("192.168")
    ? PREVIEW_BUCKET_URL
    : PRODUCTION_BUCKET_URL
}

// Helper function to generate a unique ID for saving custom models
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Function to handle the /api/sign POST endpoint
async function handleSignRequest(request: Request, env: Env): Promise<Response> {
  console.log("[Worker] Processing /api/sign POST request.")

  // Check if it's a POST request
  if (request.method !== "POST") {
    return new Response("Method not allowed. Use POST.", { status: 405 })
  }

  try {
    // Parse the multipart form data to get the image
    const formData = await request.formData()
    const imageFile = formData.get("image")

    // Check if it's a valid file object (has size and type properties like a Blob/File)
    if (!imageFile || typeof imageFile !== "object" || !("size" in imageFile) || !("type" in imageFile)) {
      return new Response("No valid image file provided.", { status: 400 })
    }

    // Get the image MIME type and validate it
    const mimeType = imageFile.type
    if (!["image/jpeg", "image/png"].includes(mimeType)) {
      return new Response("Unsupported image format. Please use JPEG or PNG.", { status: 400 })
    }

    // Check file size (2MB max)
    if (imageFile.size > 2 * 1024 * 1024) {
      return new Response("Image too large. Maximum size is 2MB.", { status: 400 })
    }

    // Fetch the base GLB template from R2
    const baseModelName = "ardog_giantsign.glb"
    const baseModel = await env.MODELS_BUCKET.get(baseModelName)

    if (!baseModel) {
      return new Response(`Base model '${baseModelName}' not found.`, { status: 500 })
    }

    // Get the GLB as an ArrayBuffer
    const baseModelBuffer = await baseModel.arrayBuffer()

    // Use gltf-transform to modify the model
    const io = new WebIO().registerExtensions([EXTTextureWebP])
    const doc = await io.readBinary(new Uint8Array(baseModelBuffer))

    // Find the target material (SignFront_MAT)
    const targetMaterial = doc.getRoot()
      .listMaterials()
      .find(mat => mat.getName() === "SignFront_MAT")

    if (!targetMaterial) {
      return new Response("Target material 'SignFront_MAT' not found in GLB.", { status: 500 })
    }

    // Get the base color texture from the material
    const texture = targetMaterial.getBaseColorTexture()
    if (!texture) {
      return new Response("No base color texture found in target material.", { status: 500 })
    }

    // Replace the texture with the uploaded image
    const imageBuffer = await imageFile.arrayBuffer()
    texture.setImage(new Uint8Array(imageBuffer)).setMimeType(mimeType)

    // Generate the modified GLB
    const modifiedGlb = await io.writeBinary(doc)

    // Generate unique ID for this custom model
    const uniqueId = generateUniqueId()
    const customModelKey = `custom/${uniqueId}.glb`

    // Upload the custom model to R2
    await env.MODELS_BUCKET.put(customModelKey, modifiedGlb)

    // Build the URL for the custom model using the appropriate bucket URL
    const bucketUrl = getBucketUrl(request)
    const glbUrl = `${bucketUrl}/${customModelKey}`

    // Return the URL to the client
    return Response.json({
      glbUrl,
      success: true,
    })
  } catch (error: any) {
    console.error("[Worker] Error processing sign request:", error.message, error.stack)
    return new Response(`Error processing image: ${error.message}`, { status: 500 })
  }
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
      // Route for the /api/sign endpoint
      if (pathname === "/api/sign") {
        console.log("[Worker] Matched /api/sign route.")
        return handleSignRequest(request, env)
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
