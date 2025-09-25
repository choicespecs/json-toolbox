// src/App.tsx
import { useEffect, useRef, useState } from "react"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"

type Doc = { id: string; title: string; text: string }
const makeDoc = (n: number): Doc => ({
  id: crypto.randomUUID?.() ?? String(Date.now() + n),
  title: `JSON ${n}`,
  text: "{\n  \"hello\": \"world\"\n}",
})

export default function App() {
  const [docs, setDocs] = useState<Doc[]>([makeDoc(1)])
  const [active, setActive] = useState(docs[0].id)

  // --- tab strip scroll state ---
  const stripRef = useRef<HTMLDivElement | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateScrollAffordances = () => {
    const el = stripRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 2)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 2)
  }

  useEffect(() => {
    updateScrollAffordances()
    const el = stripRef.current
    if (!el) return
    const onScroll = () => updateScrollAffordances()
    el.addEventListener("scroll", onScroll)
    const onResize = () => updateScrollAffordances()
    window.addEventListener("resize", onResize)
    return () => {
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  useEffect(() => {
    updateScrollAffordances()
  }, [docs])

  const scrollByPage = (dir: -1 | 1) => {
    const el = stripRef.current
    if (!el) return
    const amount = Math.floor(el.clientWidth * 0.9) * dir
    el.scrollBy({ left: amount, behavior: "smooth" })
  }

  // ---- tabs model helpers ----
  useEffect(() => {
    if (!docs.find((d) => d.id === active) && docs.length) {
      setActive(docs[docs.length - 1].id)
    }
  }, [docs, active])

  const addTab = () => {
    const next = makeDoc(docs.length + 1)
    setDocs((prev) => [...prev, next])
    setActive(next.id)
  }

  const closeTab = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id))
  const setText = (id: string, text: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, text } : d)))

  return (
    <div className="flex w-full min-h-screen">
      {/* LEFT: half screen, tabs + textarea (inside same <Tabs>) */}
      <div className="w-1/2 flex flex-col border-r">
        <Tabs value={active} onValueChange={setActive} className="flex flex-col flex-1">
          {/* Tab strip with chevrons + scroll */}
          <div className="flex items-center border-b gap-1">
            {/* Left chevron */}
            <div className="shrink-0 pl-2">
              {canLeft ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => scrollByPage(-1)}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <div className="h-7 w-7" aria-hidden />
              )}
            </div>

            {/* Scrollable strip */}
            <div ref={stripRef} className="flex-1 min-w-0 overflow-x-auto">
              <TabsList className="flex h-11 bg-transparent p-0 px-2 gap-1 whitespace-nowrap">
                {docs.map((d) => (
                  <div key={d.id} className="inline-flex">
                    <TabsTrigger
                      value={d.id}
                      className="group relative rounded-t px-3 py-2 data-[state=active]:bg-muted"
                    >
                      <span className="max-w-[8rem] truncate">{d.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-5 w-5 opacity-60 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(d.id)
                        }}
                        aria-label={`Close ${d.title}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </TabsTrigger>
                  </div>
                ))}
              </TabsList>
            </div>

            {/* Right chevron */}
            <div className="shrink-0">
              {canRight ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => scrollByPage(1)}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="h-7 w-7" aria-hidden />
              )}
            </div>

            {/* New tab button */}
            <div className="px-2 shrink-0">
              <Button size="sm" variant="outline" onClick={addTab}>
                <Plus className="mr-1 h-4 w-4" /> New
              </Button>
            </div>
          </div>

          {/* Tab contents */}
          <div className="flex-1 p-4 overflow-hidden">
            {docs.map((d) => (
              <TabsContent key={d.id} value={d.id} className="h-full m-0">
                <Textarea
                  value={d.text}
                  onChange={(e) => setText(d.id, e.target.value)}
                  className="w-full h-full resize-none font-mono text-sm"
                  placeholder='{"key":"value"}'
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* RIGHT: half screen, login card centered */}
      <div className="w-1/2 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">Sign Up</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password" required />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}