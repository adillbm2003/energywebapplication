import { useState } from 'react'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import { apiClient } from '../../../services/client'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    setServerError(null)
    try {
      await apiClient.post('/api/newsletter', { email })
      setSubmitted(true)
      setEmail('')
    } catch (err) {
      setServerError(err.message ?? 'Failed to subscribe. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p className="text-sm text-teal-400" role="status">
        Thank you for subscribing to energy updates.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {serverError && (
        <p className="text-sm text-red-400" role="alert">{serverError}</p>
      )}
      <Input
        type="email"
        name="newsletter-email"
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-navy-800 border-navy-700 text-white placeholder:text-slate-500"
      />
      <Button type="submit" variant="primary" size="sm" className="w-full" disabled={submitting}>
        {submitting ? 'Subscribing…' : 'Subscribe'}
      </Button>
    </form>
  )
}
