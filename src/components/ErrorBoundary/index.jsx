import React, { Component } from 'react'
import Button from '../ui/Button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-navy-900">Something went wrong</h1>
            <p className="text-slate-600">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-w-xl overflow-auto rounded bg-slate-100 p-3 text-left text-xs text-red-700">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
