import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

export function useMpesaPolling(checkoutRequestId, { onSuccess, onFailure, enabled = true } = {}) {
  const [status, setStatus] = useState('PENDING') // PENDING | CONFIRMED | FAILED
  const [attempts, setAttempts] = useState(0)
  const intervalRef = useRef(null)
  const MAX_ATTEMPTS = 24 // ~2 minutes at 5s intervals

  useEffect(() => {
    if (!checkoutRequestId || !enabled) return

    const poll = async () => {
      try {
        const res = await api.get(`/mpesa/status/${checkoutRequestId}`)
        const { status: s, bookingRef } = res.data.data

        if (s === 'CONFIRMED') {
          clearInterval(intervalRef.current)
          setStatus('CONFIRMED')
          onSuccess?.(bookingRef)
        } else if (s === 'FAILED') {
          clearInterval(intervalRef.current)
          setStatus('FAILED')
          onFailure?.('Payment was not completed.')
        }
      } catch {
        // silently continue polling
      }

      setAttempts((a) => {
        if (a + 1 >= MAX_ATTEMPTS) {
          clearInterval(intervalRef.current)
          setStatus('FAILED')
          onFailure?.('Payment timed out. Please try again.')
        }
        return a + 1
      })
    }

    intervalRef.current = setInterval(poll, 5000)
    poll() // immediate first check

    return () => clearInterval(intervalRef.current)
  }, [checkoutRequestId, enabled])

  return { status, attempts }
}
