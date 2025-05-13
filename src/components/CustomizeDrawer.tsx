import { ShoppingBag } from "lucide-react"
import { Drawer } from "vaul"

// Define the type for our model data
interface Model {
  name: string
  glb: string
  usdz: string
  thumbnail: string
}

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

interface CustomizeDrawerProps {
  models: Model[]
  selectedModel: Model | null
  onModelSelect: (model: Model) => void
}

export function CustomizeDrawer({ models, selectedModel, onModelSelect }: CustomizeDrawerProps) {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        <button className="w-1/2 py-3 px-4 shadow rounded-lg bg-[#ec8942] text-primary-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer">
          <ShoppingBag size={20} />
          Customize
        </button>
      </Drawer.Trigger>
      <StyledDrawerContent title="Customize">
        {models.length > 0
          ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
              {models.map((model) => (
                <button
                  key={model.name}
                  onClick={() => onModelSelect(model)}
                  className={`flex flex-col cursor-pointer items-center p-2 rounded-lg transition-all
                          ${
                    selectedModel?.name === model.name
                      ? "bg-blue-500/30 ring-2 ring-blue-500"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <img
                    src={`/models/${model.thumbnail}`}
                    alt={model.name}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")} // Fallback image
                  />
                  <span className="text-xs text-center">{model.name}</span>
                </button>
              ))}
            </div>
          )
          : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-2xl font-semibold mb-4">Loading Items...</h3>
              <p className="text-gray-300">
                Please wait while we fetch the available models.
              </p>
            </div>
          )}
      </StyledDrawerContent>
    </Drawer.Root>
  )
}
