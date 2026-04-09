import CodeMirror from "@uiw/react-codemirror"
import { json, jsonParseLinter } from "@codemirror/lang-json"
import { linter, lintGutter } from "@codemirror/lint"
import { EditorView } from "@codemirror/view"

const jsonLinter = linter(jsonParseLinter())

const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { padding: "8px 0" },
})

const extensions = [json(), jsonLinter, lintGutter(), baseTheme]

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function JsonEditor({ value, onChange, placeholder }: Props) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      placeholder={placeholder}
      height="100%"
      style={{ height: "100%", overflow: "hidden" }}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        bracketMatching: true,
        autocompletion: false,
      }}
    />
  )
}
