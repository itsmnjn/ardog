import "react"

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          alt?: string
          ar?: boolean
          "ar-modes"?: string
          "camera-controls"?: boolean
          "auto-rotate"?: boolean
          "shadow-intensity"?: string
          // Add other common model-viewer props here or use a more detailed approach if needed
          [key: string]: any // Allows any other attributes, less type-safe but often necessary for web components
        },
        HTMLElement
      >
    }
  }
}
