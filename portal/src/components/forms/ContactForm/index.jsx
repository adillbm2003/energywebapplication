import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import Select from '../../ui/Select'

function getInitialForm(searchParams) {
  const enquiry = searchParams.get('enquiry')
  const company = searchParams.get('company')
  if (enquiry === 'installer' && company) {
    return {
      name: '',
      email: '',
      subject: 'installer',
      message: `I would like to request a quote from ${company} for a solar installation project.`,
    }
  }
  return { name: '', email: '', subject: '', message: '' }
}

const SUBJECTS = [
  { value: '', label: 'Select a subject' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'policy', label: 'Policy & Legislation' },
  { value: 'renewable', label: 'Renewable Energy' },
  { value: 'installer', label: 'Installer Enquiry' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'bursary', label: 'Bursary Programme' },
  { value: 'space', label: 'Space & Satellite' },
]

export default function ContactForm() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(() => getInitialForm(searchParams))
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.subject) next.subject = 'Please select a subject'
    if (!form.message.trim()) next.message = 'Message is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
  }

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  if (submitted) {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-6 text-center" role="status">
        <h3 className="text-lg font-semibold text-teal-800">Message Sent</h3>
        <p className="mt-2 text-sm text-teal-700">
          Thank you for contacting the Department of Energy. We will respond within 3 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name" name="name" value={form.name} onChange={update('name')} error={errors.name} required />
        <Input label="Email" name="email" type="email" value={form.email} onChange={update('email')} error={errors.email} required />
      </div>
      <Select label="Subject" name="subject" options={SUBJECTS} value={form.subject} onChange={update('subject')} />
      {errors.subject && <p className="text-sm text-danger" role="alert">{errors.subject}</p>}
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={update('message')}
          className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          required
          aria-invalid={errors.message ? 'true' : undefined}
        />
        {errors.message && <p className="mt-1 text-sm text-danger" role="alert">{errors.message}</p>}
      </div>
      <Button type="submit" variant="primary" size="lg">
        Send Message
      </Button>
    </form>
  )
}
