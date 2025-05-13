## ✅ PHASED IMPLEMENTATION CHECKLIST: CUSTOM SIGN TO AR IN-BROWSER

---

### 🧱 PHASE 1: Client-Side Upload + Compression

**Goal**: User uploads image → it's compressed → sent to backend for GLB swap.

- [x] **UI**: Add file input element (`<input type="file">`) to `App.tsx`.
  - [x] Set `accept="image/jpeg,image/png"` attribute.
  - [x] Add a button to trigger the file selection dialog.
  - [x] Implement loading/disabled state for the upload button while processing/uploading.
- [x] **Compression**: Integrate `browser-image-compression` library.
  - [x] Install the library (`pnpm add browser-image-compression`).
  - [x] Import and use the library within an event handler.
  - [x] Apply compression options:
    - `maxSizeMB: 2`
    - `maxWidthOrHeight: 1024`
    - `fileType: 'image/jpeg'`
  - [x] **Verification**:
    - `console.log` the original and compressed file sizes.
    - Handle compression errors gracefully.

- [x] **API Call**: Send compressed image to `/api/sign` using `FormData`.
  - [x] `fetch` to POST endpoint.
  - [x] Append `compressedBlob` to `FormData`.
  - [x] **Verification**:
    - Inspect request in browser DevTools.
    - Confirm image sent as `multipart/form-data`.

---

### 🔧 PHASE 2: Worker `/api/sign` Logic

**Goal**: Receive image → replace texture → upload to R2 → return links.

- [x] **Dependencies**: Add `@gltf-transform/core` + `@gltf-transform/extensions` to worker.
- [x] **Request Handling**:
  - Parse `FormData` and extract image blob.
  - Validate presence and type.
- [x] **Fetch Base GLB**: Load from `ardog-models-preview` bucket.
- [x] **GLTF Transformation**:
  - Use `WebIO` to load buffer.
  - Find `SignFront_MAT`, swap texture.
- [x] **Export Custom GLB**:
  - `io.writeBinary(doc)` → new GLB buffer.
- [x] **Upload to R2**:
  - Save `.glb` under `custom/` prefix.
  - Note: USDZ conversion not needed as iOS devices handle this automatically.
- [x] **Return Response**:
  - JSON containing URL: `glbUrl`.

---

### 🧹 PHASE 3: Auto-Cleanup

**Goal**: Delete user-generated assets after 24h.

- [x] **Lifecycle Rule**:
  - In R2 → `ardog-models-preview` → Lifecycle Rules.
  - Target prefix: `custom/`.
  - Action: Delete after 1 day.

---

### 🧪 PHASE 4: Client-Side Preview

**Goal**: Show the customized model in-browser and AR.

- [x] **State Management**:
  - Add state for `customModelUrl`.
  - Update on successful `/api/sign` call.
- [x] **Update `<model-viewer>`**:
  - Conditionally use custom URLs.
  - Fallback to selected model if none.
- [x] **Verification**:
  - Confirm `<model-viewer>` reflects custom upload.
  - Check AR functionality on iOS.

---
