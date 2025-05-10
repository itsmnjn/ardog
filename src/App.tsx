import { Info, Rocket, ShoppingBag } from "lucide-react" // Using ShoppingBag, Info, and Rocket icons
import { Drawer } from "vaul"
import "@google/model-viewer" // Import to register the custom element
import { useRef } from "react" // Import useRef

const MAX_WIDTH = "max-w-xl" // Configurable max width

// New StyledDrawerContent component
interface StyledDrawerContentProps {
  title: string
  children: React.ReactNode
}

const StyledDrawerContent: React.FC<StyledDrawerContentProps> = ({ title, children }) => {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0" />
      <Drawer.Content className="bg-white/10 text-white backdrop-blur-lg flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 outline-none">
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

  const handleArActivate = () => {
    if (modelViewerRef.current) {
      if (modelViewerRef.current.canActivateAR) {
        modelViewerRef.current.activateAR()
      } else {
        alert("AR is not supported on this device or browser. Please use Safari or Chrome on an iOS or Android device.")
      }
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#111111] text-foreground flex flex-col items-center relative">
      {/* model-viewer component - now takes full width and height */}
      <model-viewer
        ref={modelViewerRef} // Assign ref
        src="/ardog.glb" // Switched back to ardog.glb
        ios-src="/ardog.usdz"
        alt="A 3D model of a dog"
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
          background: "#111111",
        }}
      >
        {/* Slot to hide the default AR button */}
        <div slot="ar-button" style={{ display: "none" }}></div>
      </model-viewer>

      {/* Main container with max-width and centering for overlay content */}
      <div className={`w-full ${MAX_WIDTH} flex flex-col flex-grow relative pointer-events-none`}>
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-2 sm:p-4 pointer-events-auto">
          <div className="flex flex-row p-2 rounded-lg bg-background justify-center">
            <h1 className="text-3xl font-bold text-center text-primary">$ARDOG</h1>
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

          {/* Container for Items and More Info buttons */}
          <div className="flex gap-2">
            {/* Items Drawer */}
            <Drawer.Root shouldScaleBackground>
              <Drawer.Trigger asChild>
                <button className="w-1/2 py-3 px-4 shadow rounded-lg bg-[#ec8942] text-primary-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer">
                  <ShoppingBag size={20} />
                  Items
                </button>
              </Drawer.Trigger>
              <StyledDrawerContent title="Choose Your Items">
                {/* Grid for item thumbnails */}
                <div className="grid grid-cols-3 gap-4 p-4">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg flex items-center justify-center bg-muted/50 border border-border/50`} // Added some transparency to items as well
                      style={{ backgroundColor: `hsl(${index * 40}, 70%, 80%, 0.5)` }} // Mock colors with alpha
                    >
                      <span className="text-xs text-white">Item {index + 1}</span>
                    </div>
                  ))}
                </div>
              </StyledDrawerContent>
            </Drawer.Root>

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
                  <p className="text-sm">
                    $ARDOG is a community-owned memecoin with an innovative AR (Augmented Reality) component that lets
                    users see a virtual dog in their real environment.
                  </p>

                  <h3 className="mt-4 text-base font-bold">Key Features:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Augmented Reality Experience: Point your phone at a QR code to bring the AR dog into your world
                    </li>
                    <li>100% Community-Owned: Fully controlled by holders, not developers</li>
                    <li>0% Tax: No buy/sell taxes</li>
                    <li>100% Liquidity Burnt: Ensuring a fully decentralized token</li>
                  </ul>

                  <p className="mt-4">
                    Contract Address:{" "}
                    <code className="bg-black p-1 rounded text-xs">
                      85YgaPBNug3zUNLgXn2PLR4WXywjarELBCiQLswYpump
                    </code>
                  </p>

                  <p className="mt-4">
                    Visit{" "}
                    <a href="https://thedogiseverywhere.com/" className="text-blue-300 hover:underline">
                      thedogiseverywhere.com
                    </a>{" "}
                    for more information and to experience $ARDOG in AR.
                  </p>
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
