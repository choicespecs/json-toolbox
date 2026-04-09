import { LeftEditors } from "@/components/app/LeftEditors"
import { TopBar } from "@/components/app/TopBar"
import { RightPane } from "@/components/app/RightPane"
import { useJsonToolboxApp } from "@/features/app/useJsonToolboxApp"

export default function App() {
  const app = useJsonToolboxApp()

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <TopBar
        showDiff={app.showDiff}
        setShowDiff={app.setShowDiff}
        showAnalyze={app.showAnalyze}
        setShowAnalyze={app.setShowAnalyze}
        showVisualize={app.showVisualize}
        setShowVisualize={app.setShowVisualize}
        showJsonToString={app.showJsonToString}
        toggleJsonToString={app.toggleJsonToString}
        setShowJsonToString={app.setShowJsonToString}
        indent={app.indent}
        setIndent={app.setIndent}
        sortKeys={app.sortKeys}
        setSortKeys={app.setSortKeys}
        prettify={app.prettify}
      />

      <div className="flex flex-1 min-h-0">
        {/* Left editor */}
        <div className="w-1/2 flex flex-col border-r min-h-0">
          <LeftEditors
            docs={app.docs}
            active={app.active}
            onActiveChange={app.setActive}
            onAddTab={app.addTab}
            onCloseTab={app.closeTab}
            onSetText={app.setText}
            onSetDiffText={app.setDiffText}
            showDiff={app.showDiff}
          />
        </div>

        {/* Right side */}
        <RightPane
          showDiff={app.showDiff}
          showAnalyze={app.showAnalyze}
          showVisualize={app.showVisualize}
          showJsonToString={app.showJsonToString}
          jsonStringOutput={app.jsonStringOutput}
          jsonStringError={app.jsonStringError}
          jsonText={app.activeDoc?.text ?? ""}
          diffs={app.diffs}
          treeNode={app.treeNode}
          viewMode={app.viewMode}
          setViewMode={app.setViewMode}
          diffError={app.diffError}
          hasCompared={app.hasCompared}
          expanded={app.expanded}
          setExpanded={app.setExpanded}
          onCompare={app.handleCompare}
          onClearDiff={app.clearDiff}
          analyzeRoot={app.analyzeRoot}
          analyzeError={app.analyzeError}
          analyzeExpanded={app.analyzeExpanded}
          setAnalyzeExpanded={app.setAnalyzeExpanded}
          onAnalyze={app.handleAnalyze}
          onClearAnalyze={app.clearAnalyze}
        />
      </div>
    </div>
  )
}
