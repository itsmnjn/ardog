import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import cloudflareLogo from './assets/Cloudflare_Logo.svg'
import { Button } from "@/components/ui/button"

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('unknown')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-6 mb-8">
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='h-16 w-16 transition-all hover:scale-110' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='h-16 w-16 transition-all hover:scale-110' alt='React logo' />
        </a>
        <a href='https://workers.cloudflare.com/' target='_blank'>
          <img src={cloudflareLogo} className='h-16 w-16 transition-all hover:scale-110' alt='Cloudflare logo' />
        </a>
      </div>
      
      <h1 className="text-4xl font-bold mb-8">Vite + React + Cloudflare</h1>
      
      <div className="grid gap-8 w-full max-w-md">
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card shadow-sm">
          <Button
            onClick={() => setCount((count) => count + 1)}
            variant="default"
            size="lg"
            className="w-full"
          >
            Count is {count}
          </Button>
          <p className="text-sm text-muted-foreground">
            Edit <code className="font-mono bg-muted px-1 py-0.5 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card shadow-sm">
          <Button
            onClick={() => {
              fetch('/api/')
                .then((res) => res.json() as Promise<{ name: string }>)
                .then((data) => setName(data.name))
            }}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Name from API is: {name}
          </Button>
          <p className="text-sm text-muted-foreground">
            Edit <code className="font-mono bg-muted px-1 py-0.5 rounded">worker/index.ts</code> to change the name
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-center text-muted-foreground">
        Click on the Vite, React, and Cloudflare logos to learn more
      </p>
    </div>
  )
}

export default App
