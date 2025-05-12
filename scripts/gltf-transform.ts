/**
 * scripts/gltf-transform.ts
 * --------------------------------------------------------------------------
 * • Loads a GLB template.
 * • Reads ANY PNG/JPEG (<= 2 MiB) and swaps it into the first texture.
 * • Writes the customised GLB back to disk.
 *
 * No native modules, no sharp, so this logic can be copy-pasted into a
 * Cloudflare Worker (swap NodeIO → WebIO there).
 * -------------------------------------------------------------------------- */

import { NodeIO } from "@gltf-transform/core"
import { EXTTextureWebP } from "@gltf-transform/extensions"
import fs from "node:fs/promises"
import path from "node:path"

/*───────────────────────────────────────────────────────────────────────────*/
/* 1.  EDIT PATHS / LIMITS HERE                                            */
/*───────────────────────────────────────────────────────────────────────────*/

const INPUT_GLB = path.resolve("./public/models/ardog_giantsign.glb")
const INPUT_IMG = path.resolve("./public/chart.png") // png or jpg OK
const OUTPUT_GLB = path.resolve("./scripts/ardog_giantsign_custom.glb")
const MAX_BYTES = 2_000_000 // 2 MiB cap

/*───────────────────────────────────────────────────────────────────────────*/

async function main() {
  console.log("▶︎ Checking files …")
  for (const p of [INPUT_GLB, INPUT_IMG]) {
    try {
      await fs.access(p)
    } catch {
      throw new Error(`File not found: ${p}`)
    }
  }

  /* 2. ───── Read & size-gate the image ───────────────────────────────────*/
  const imgBuf = await fs.readFile(INPUT_IMG)
  if (imgBuf.byteLength > MAX_BYTES) {
    throw new Error(`Image exceeds ${MAX_BYTES} bytes; supply a smaller file.`)
  }

  const ext = path.extname(INPUT_IMG).toLowerCase()
  const mime = ext === ".png"
    ? "image/png"
    : ext === ".jpg" || ext === ".jpeg"
    ? "image/jpeg"
    : (() => {
      throw new Error("Only PNG or JPEG allowed.")
    })()

  console.log(`▶︎ Using ${mime}  (${Math.round(imgBuf.byteLength / 1024)} kB)`)

  /* 3. ───── Load GLB template ────────────────────────────────────────────*/
  const io = new NodeIO() // in Worker swap to WebIO()
    .registerExtensions([EXTTextureWebP])
  const doc = await io.read(INPUT_GLB)

  /* 4. ───── Replace first texture ────────────────────────────────────────*/
  // Find the target material
  const targetMaterial = doc.getRoot().listMaterials()
    .find(mat => mat.getName() === "SignFront_MAT")

  if (!targetMaterial) {
    throw new Error("Material 'SignFront_MAT' not found in the GLB.")
  }

  // Get the base color texture from the material
  const tex = targetMaterial.getBaseColorTexture()
  if (!tex) throw new Error("Material 'SignFront_MAT' has no base color texture to replace.")

  tex.setImage(imgBuf).setMimeType(mime)
  console.log(`▶︎ Replaced base color texture on material → ${targetMaterial.getName()}`)

  /* 6. ───── Export new GLB ───────────────────────────────────────────────*/
  const out = await io.writeBinary(doc)
  await fs.writeFile(OUTPUT_GLB, out)
  console.log(`✅  Wrote customised GLB → ${OUTPUT_GLB}`)
}

/*───────────────────────────────────────────────────────────────────────────*/

main().catch(err => {
  console.error("💥", err.message)
  process.exit(1)
})
