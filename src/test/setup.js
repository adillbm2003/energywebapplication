import '@testing-library/jest-dom'

// Make requestAnimationFrame synchronous so hook state updates are predictable in tests
globalThis.requestAnimationFrame = (cb) => { cb(); return 0 }
globalThis.cancelAnimationFrame = () => {}
