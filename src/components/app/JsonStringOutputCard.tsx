import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function JsonStringOutputCard({ value }: { value: string }) {
  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>JSON → String Output</CardTitle>
          <CardDescription>Click the “JSON → String” button above to convert your JSON.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <Textarea
            value={value}
            readOnly
            placeholder="Your escaped string will appear here"
            className="w-full h-full resize-none font-mono text-sm"
          />
        </CardContent>
      </Card>

      {!value && (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Enter JSON in the left editor and click “JSON → String”.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  )
}
