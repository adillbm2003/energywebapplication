import Button from '../../ui/Button'

export default function CTAButton({ children, ...props }) {
  return (
    <Button variant="primary" size="lg" {...props}>
      {children}
    </Button>
  )
}
