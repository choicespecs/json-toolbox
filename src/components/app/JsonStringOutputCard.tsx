import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  value: string
  error: string
}

export function JsonStringOutputCard({ value, error }: Props) {
  return (
    <Card className="flex flex-col flex-1">
      <CardHeader>
        <CardTitle>JSON → String Output</CardTitle>
        <CardDescription>
          {error
            ? <span className="text-destructive">{error}</span>
            : value
            ? "Copy the escaped string below."
            : "Enter JSON in the left editor to see the output."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={value}
          readOnly
          placeholder="Your escaped string will appear here"
          className="w-full h-full resize-none font-mono text-sm min-h-64"
        />
      </CardContent>
    </Card>
  )
}
