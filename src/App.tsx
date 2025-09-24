// src/App.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        Hello, Vite + React + Tailwind + shadcn/ui!
      </h1>

      {/* Card Example */}
      <Card className="w-80 shadow-lg">
        <CardContent className="p-6">
          <p className="text-gray-700 dark:text-gray-300">
            This is a card using shadcn/ui 🎴
          </p>

          {/* Button Example */}
          <div className="mt-4 flex justify-center">
            <Button onClick={() => alert("Clicked!")}>Click Me</Button>
          </div>

          {/* Dialog Example */}
          <div className="mt-4 flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hi there 👋</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 dark:text-gray-300">
                  This is a modal (Dialog) built with shadcn/ui.
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}