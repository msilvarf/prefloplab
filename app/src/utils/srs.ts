
export interface SRSCardState {
    interval: number // in minutes
    ease: number // multiplier
    due: number // timestamp in ms
    lapses: number
    lastReview: number // timestamp in ms
}

/**
 * Calculates the next state for a card based on the result.
 * Based on a simplified Anki/SM-2 algorithm for binary pass/fail.
 */
export const calculateNewSRSState = (
    currentState: SRSCardState | null,
    isCorrect: boolean,
    now = Date.now()
): SRSCardState => {
    // Defaults for a new card
    if (!currentState) {
        if (isCorrect) {
            // First success: due in 10 minutes
            return {
                interval: 10,
                ease: 2.5,
                due: now + 10 * 60 * 1000,
                lapses: 0,
                lastReview: now,
            }
        } else {
            // First failure: due in 1 minute
            return {
                interval: 1,
                ease: 2.5,
                due: now + 1 * 60 * 1000,
                lapses: 1,
                lastReview: now,
            }
        }
    }

    // Existing card logic
    let { interval, ease, lapses } = currentState

    if (isCorrect) {
        if (interval < 1) {
            interval = 1;
        }
        else if (interval === 1) {
            // Graduate to 10 minutes
            interval = 10
        } else if (interval >= 10 && interval < 60) {
            // Graduate to 1 hour (approx)
            interval = 60
        } else if (interval >= 60 && interval < 24 * 60) {
            // Graduate to 1 day
            interval = 24 * 60
        } else {
            // Exponential growth
            interval = Math.round(interval * ease)
        }

        // Ease logic: kept simple for binary outcome.
        // Could slightly increase ease on long-term successes, but keeping constant is safe.
    } else {
        // Lapse
        interval = 1 // Reset to 1 minute
        ease = Math.max(1.3, ease - 0.2) // Penalty to ease
        lapses += 1
    }

    return {
        interval,
        ease,
        due: now + interval * 60 * 1000,
        lapses,
        lastReview: now,
    }
}
