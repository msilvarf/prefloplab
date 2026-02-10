import { useState } from 'react'
import type { Folder, Range } from '@/types'
import { useDrillSession } from '@/hooks/useDrillSession'
import { SelectionView } from '@/components/treinador/SelectionView'
import { StatsPanel } from '@/components/treinador/StatsPanel'
import { DrillCard } from '@/components/treinador/DrillCard'
import { ActionButtons } from '@/components/treinador/ActionButtons'
import { ReferenceRange } from '@/components/treinador/ReferenceRange'
import { ResultFeedback } from '@/components/treinador/ResultFeedback'
import { RangeTrainingView } from '@/components/treinador/RangeTrainingView'
import { SessionSummary } from '@/components/treinador/SessionSummary'

interface TreinadorViewProps {
  folders: Folder[]
}

export function TreinadorView({ folders }: TreinadorViewProps) {
  const [isStatsOpen, setIsStatsOpen] = useState(true)
  const [rangeTrainingMode, setRangeTrainingMode] = useState(false)
  const [rangeTrainingData, setRangeTrainingData] = useState<{ range: Range; folderName?: string } | null>(null)

  const {
    isTraining,
    sessionComplete,
    currentHand,
    currentHandIndex,
    score,
    accuracy,
    progress,
    showResult,
    lastAnswer,
    trainingHistory,
    activeScenarios,
    currentRange,
    currentRanges,
    currentCardColors,
    startTraining,
    submitAnswer,
    stopTraining,
    goToNextHand,
    restartTraining,
  } = useDrillSession()

  // Actions to display based on current range or demo
  // For multi-range, combine all unique actions
  const actionsToDisplay = (() => {
    if (currentRanges.length > 1) {
      // Multi-range: collect unique actions from all ranges
      const seenActions = new Set<string>()
      const actions: { name: string; color: string }[] = []

      currentRanges.forEach(range => {
        range.actions.forEach(a => {
          const key = `${a.name}:${a.color}`
          if (!seenActions.has(key)) {
            seenActions.add(key)
            actions.push({ name: a.name, color: a.color })
          }
        })
      })

      return actions
    } else if (currentRange) {
      return currentRange.actions.map(a => ({ name: a.name, color: a.color }))
    } else {
      return [
        { name: 'Fold', color: '#6b7280' },
        { name: 'Raise/shove/call', color: '#3b82f6' },
        { name: 'Open shove', color: '#22c55e' },
        { name: 'Limp/fold', color: '#eab308' },
        { name: 'Raise/call/fold', color: '#8b5cf6' },
        { name: 'Raise/fold', color: '#ef4444' },
        { name: 'Limp/call/call', color: '#6b7280' },
        { name: 'Limp/call/fold', color: '#d97706' },
        { name: 'Raise/call/call', color: '#06b6d4' },
      ]
    }
  })()

  // Show reference range ONLY if result is shown AND answer was incorrect
  const showReferenceRange = !!(showResult && lastAnswer && !lastAnswer.correct)

  // Handler for starting range training
  const handleStartRangeTraining = (range: Range, folderName?: string) => {
    setRangeTrainingData({ range, folderName })
    setRangeTrainingMode(true)
  }

  // Handler for going back from range training
  const handleBackFromRangeTraining = () => {
    setRangeTrainingMode(false)
    setRangeTrainingData(null)
  }

  // If in range training mode, show the range training view
  if (rangeTrainingMode && rangeTrainingData) {
    return (
      <RangeTrainingView
        range={rangeTrainingData.range}
        folderName={rangeTrainingData.folderName}
        onBack={handleBackFromRangeTraining}
      />
    )
  }

  // If session is complete, show summary
  if (sessionComplete) {
    return (
      <SessionSummary
        history={trainingHistory}
        score={score}
        totalAnswered={trainingHistory.length}
        onRestart={restartTraining}
        onHome={stopTraining}
      />
    )
  }

  // If not training, show selection view
  if (!isTraining) {
    return (
      <SelectionView
        folders={folders}
        onStartTraining={startTraining}
        onStartRangeTraining={handleStartRangeTraining}
      />
    )
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Stats Panel - Collapsible */}
      <StatsPanel
        isOpen={isStatsOpen}
        onToggle={setIsStatsOpen}
        onStop={stopTraining}
        accuracy={accuracy}
        score={score}
        totalAnswered={currentHandIndex}
        history={trainingHistory}
      />

      {/* Training area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative min-w-[400px]">
        {/* Progress bar at top */}
        <div className="absolute top-6 left-8 right-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className="font-medium">{currentHandIndex + 1} / {activeScenarios.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Context info */}
          <div className="flex items-center justify-center gap-3 mt-4 text-sm scale-95 origin-top">
            <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground">
              <span className="font-bold text-foreground">{currentHand.stackSize}</span>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{currentHand.situation}</span>
            {currentRanges.length > 1 && currentHand.rangeName && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">
                  {currentHand.rangeName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Poker table & cards */}
        <DrillCard
          hand={currentHand.hand}
          cardColors={currentCardColors}
          isStatsOpen={isStatsOpen}
          showNextButton={showResult && !lastAnswer?.correct}
          onNext={goToNextHand}
        />

        {/* Action buttons */}
        <ActionButtons
          actions={actionsToDisplay}
          onAnswer={submitAnswer}
          disabled={showResult}
          showResult={showResult}
          correctAction={currentHand.correctAction}
          lastAnswer={lastAnswer}
        />

        {/* Result feedback */}
        <ResultFeedback
          show={showResult}
          correct={lastAnswer?.correct || false}
          correctAction={currentHand.correctAction}
        />
      </div>

      {/* Range preview */}
      <ReferenceRange
        currentRange={currentRange}
        activeScenarios={activeScenarios}
        currentHand={currentHand}
        isStatsOpen={isStatsOpen}
        showReference={showReferenceRange}
      />
    </div>
  )
}
