import { useState } from 'react'
import Button from '../../ui/Button'
import Input from '../../ui/Input'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setEmail('')
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
      <Button type="submit" variant="primary" size="sm" className="w-full">
        Subscribe
      </Button>
    </form>
  )
}
