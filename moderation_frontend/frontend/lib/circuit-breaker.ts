/**
 * Circuit breaker implementation to prevent cascading failures
 */

interface CircuitBreakerOptions {
  failureThreshold: number
  resetTimeout: number
}

interface CircuitBreakerState {
  failures: number
  lastFailure: number
  status: "CLOSED" | "OPEN" | "HALF_OPEN"
}

export class CircuitBreaker {
  private states: Map<string, CircuitBreakerState> = new Map()
  private options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      ...options,
    }
  }

  /**
   * Check if a circuit is open (too many failures)
   */
  isOpen(key: string): boolean {
    const state = this.getState(key)

    if (state.status === "CLOSED") {
      return false
    }

    if (state.status === "OPEN") {
      // Check if it's time to try again
      if (Date.now() - state.lastFailure > this.options.resetTimeout) {
        this.halfOpen(key)
        return false
      }
      return true
    }

    // HALF_OPEN - allow one request through
    return false
  }

  /**
   * Record a successful operation
   */
  recordSuccess(key: string): void {
    const state = this.getState(key)

    if (state.status === "HALF_OPEN") {
      this.close(key)
    }
  }

  /**
   * Record a failed operation
   */
  recordFailure(key: string): void {
    const state = this.getState(key)

    if (state.status === "HALF_OPEN") {
      this.open(key)
      return
    }

    state.failures += 1
    state.lastFailure = Date.now()

    if (state.failures >= this.options.failureThreshold) {
      this.open(key)
    }
  }

  /**
   * Reset the circuit breaker for a key
   */
  reset(key: string): void {
    this.close(key)
  }

  /**
   * Get all circuit breaker states
   */
  getStates(): Record<string, CircuitBreakerState> {
    const result: Record<string, CircuitBreakerState> = {}
    this.states.forEach((state, key) => {
      result[key] = { ...state }
    })
    return result
  }

  private getState(key: string): CircuitBreakerState {
    if (!this.states.has(key)) {
      this.states.set(key, {
        failures: 0,
        lastFailure: 0,
        status: "CLOSED",
      })
    }
    return this.states.get(key)!
  }

  private open(key: string): void {
    const state = this.getState(key)
    state.status = "OPEN"
    state.lastFailure = Date.now()
  }

  private halfOpen(key: string): void {
    const state = this.getState(key)
    state.status = "HALF_OPEN"
  }

  private close(key: string): void {
    this.states.set(key, {
      failures: 0,
      lastFailure: 0,
      status: "CLOSED",
    })
  }
}

// Create a singleton instance
export const circuitBreaker = new CircuitBreaker()

