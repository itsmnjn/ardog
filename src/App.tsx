import { Check, Copy, Info, Rocket, ShoppingBag, Upload } from "lucide-react" // Add Upload icon
import { Drawer } from "vaul"
import "@google/model-viewer" // Import to register the custom element
import { CONTRACT_ADDRESS, DEXSCREENER_LINK, X_COMMUNITY_LINK } from "@/lib/constants"
import imageCompression from "browser-image-compression" // Import the compression library
import { useRef, useState } from "react" // Import useRef, useState, and useEffect

const MAX_WIDTH = "max-w-xl" // Configurable max width
const DEFAULT_MODEL_URL = "/models/ardog.glb" // Default model URL

// New StyledDrawerContent component
interface StyledDrawerContentProps {
  title: string
  children: React.ReactNode
}

const StyledDrawerContent: React.FC<StyledDrawerContentProps> = ({ title, children }) => {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <Drawer.Content className="bg-black/50 border border-white/20 text-white backdrop-blur-lg flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 outline-none">
        <div className="p-4 bg-transparent rounded-t-[10px] flex-1 overflow-y-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
          <div className="max-w-md mx-auto">
            <Drawer.Title className="font-medium mb-4 text-lg text-center">
              {title}
            </Drawer.Title>
            {children}
          </div>
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  )
}

function App() {
  const modelViewerRef = useRef<any>(null) // Add ref for model-viewer
  const fileInputRef = useRef<HTMLInputElement>(null) // Add ref for file input
  const [copied, setCopied] = useState(false) // Add state for copy feedback
  const [isProcessingImage, setIsProcessingImage] = useState(false) // State for processing status
  const [selectedImage, setSelectedImage] = useState<File | null>(null) // State for selected image
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null) // State for custom model URL

  const handleArActivate = () => {
    if (modelViewerRef.current) {
      if (modelViewerRef.current.canActivateAR) {
        modelViewerRef.current.activateAR()
      } else {
        alert("AR is not supported on this device or browser. Please use Safari or Chrome on an iOS or Android device.")
      }
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileInputClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsProcessingImage(true)
      setSelectedImage(file)

      console.log("Original file size:", file.size / 1024 / 1024, "MB")

      // Compression options
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1024,
        fileType: "image/jpeg",
      }

      const compressedFile = await imageCompression(file, options)
      console.log("Compressed file size:", compressedFile.size / 1024 / 1024, "MB")

      // Create FormData and append the compressed image
      const formData = new FormData()
      formData.append("image", compressedFile)

      // Send the image to the /api/sign endpoint
      const response = await fetch("/api/sign", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${await response.text()}`)
      }

      const { glbUrl, success } = await response.json()
      if (success && glbUrl) {
        setCustomModelUrl(glbUrl)
      }
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Failed to process image. Please try again.")
      setCustomModelUrl(null)
    } finally {
      setIsProcessingImage(false)
    }
  }

  return (
    <div
      className="min-h-[100dvh] text-foreground flex flex-col items-center relative"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        className="absolute w-full h-full"
        style={{
          backgroundImage: "url(/earth.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        role="img"
        aria-label="Earth background"
      >
        <link
          rel="preload"
          as="image"
          href="/earth.jpeg"
          fetchPriority="high"
        />
        <img
          src="/earth.jpeg"
          alt=""
          className="hidden"
          loading="eager"
          decoding="async"
        />
      </div>
      {/* model-viewer component - now takes full width and height */}
      <model-viewer
        ref={modelViewerRef} // Assign ref
        src={customModelUrl || DEFAULT_MODEL_URL}
        alt="A 3D model of a custom sign or default dog"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        style={{
          width: "100vw", // Use viewport width
          height: "100dvh", // Use dynamic viewport height
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0, // Ensure it's behind other content
        }}
      >
        {/* Slot to hide the default AR button */}
        <div slot="ar-button" style={{ display: "none" }}></div>
      </model-viewer>

      {/* Main container with max-width and centering for overlay content */}
      <div className={`w-full ${MAX_WIDTH} flex flex-col flex-grow relative pointer-events-none`}>
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-2 sm:p-4 pointer-events-auto">
          <div className="flex flex-row p-2 justify-between items-center">
            <a
              href={DEXSCREENER_LINK}
              target="_blank"
              className="cursor-pointer"
            >
              <img src="/dex-logo.svg" alt="Dexscreener" className="w-[32px] h-[32px]" />
            </a>
            <img src="/ar.dog.svg" alt="AR.DOG" className="w-auto h-[36px]" />
            <a
              href={X_COMMUNITY_LINK}
              target="_blank"
              className="cursor-pointer justify-center items-center flex w-[32px] aspect-square"
            >
              <img src="/x-logo.svg" alt="X" className="w-6 h-6" />
            </a>
          </div>
        </header>

        {/* Placeholder for main content area if needed, or can be removed if model-viewer is the only main content */}
        <main className="flex-1 flex flex-col justify-center items-center pointer-events-none">
          {
            /* This area is now effectively transparent to allow interaction with model-viewer below,
              or could contain other UI elements that should be constrained by MAX_WIDTH
              and appear above the model-viewer.
              If no other content is needed here, this main can be simplified or removed.
           */
          }
        </main>

        {/* Stacked buttons for drawers */}
        <div className="p-2 sm:p-4 absolute bottom-0 left-0 right-0 space-y-2 pointer-events-auto">
          {/* Launch in AR Button */}
          <button
            onClick={handleArActivate}
            className="w-full py-3 px-4 shadow rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Rocket size={20} />
            Launch in AR
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/jpeg,image/png"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Container for Custom Sign and Info buttons */}
          <div className="flex gap-2">
            {/* Custom Sign Button */}
            <button
              onClick={handleFileInputClick}
              disabled={isProcessingImage}
              className="w-1/2 py-3 px-4 shadow rounded-lg bg-purple-500 hover:bg-purple-600 disabled:bg-purple-400 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Upload size={20} />
              {isProcessingImage ? "Processing..." : "Custom Sign"}
            </button>

            {/* More Info Drawer */}
            <Drawer.Root shouldScaleBackground>
              <Drawer.Trigger asChild>
                <button className="w-1/2 py-3 px-4 shadow rounded-lg bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer">
                  <Info size={20} />
                  Info
                </button>
              </Drawer.Trigger>
              <StyledDrawerContent title="About $ARDOG">
                <div className="prose prose-sm dark:prose-invert mx-auto">
                  <p className="text-base leading-relaxed mb-6">
                    Originally launched by a short-sighted dev looking to make a quick buck, $ARDOG was abandoned within
                    an hour. But legends don't die that easily. The next day, a few passionate holders stepped up to
                    revive the project by launching this website and building a new community on X.
                  </p>
                  <p className="text-base leading-relaxed mb-8">
                    Today, $ARDOG is 100% community-owned, unstoppable, and more memeable than ever!
                  </p>

                  <div>
                    <h3 className="text-lg font-bold mb-2">🔗 THE CONTRACT THAT LETS THE DOG OUT</h3>

                    <div
                      onClick={handleCopy}
                      className="bg-black/50 p-2 rounded items-center gap-2 cursor-pointer group hover:bg-black/60 transition-colors inline-flex"
                    >
                      <code className="text-[11px] sm:text-xs">
                        {CONTRACT_ADDRESS}
                      </code>
                      {copied
                        ? <Check size={16} className="text-green-500 flex-shrink-0" />
                        : <Copy size={16} className="text-gray-400 group-hover:text-white flex-shrink-0" />}
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-8">
                    <a
                      href={DEXSCREENER_LINK}
                      target="_blank"
                      className="cursor-pointer"
                    >
                      <img src="/dex-logo.svg" alt="Dexscreener" className="w-[32px] h-[32px]" />
                    </a>
                    <a
                      href={X_COMMUNITY_LINK}
                      target="_blank"
                      className="cursor-pointer justify-center items-center flex w-[32px] aspect-square"
                    >
                      <img src="/x-logo.svg" alt="X" className="w-6 h-6" />
                    </a>
                    <a
                      href="https://t.me/ARDOGCTO"
                      target="_blank"
                      className="cursor-pointer justify-center items-center flex w-[32px] aspect-square"
                    >
                      <img src="/telegram.svg" alt="Telegram" className="w-7.5 h-7.5" />
                    </a>
                  </div>
                </div>
              </StyledDrawerContent>
            </Drawer.Root>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
