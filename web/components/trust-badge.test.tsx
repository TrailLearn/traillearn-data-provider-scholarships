import { render, screen, fireEvent } from '@testing-library/react'
import { TrustBadge } from '@/components/trust-badge'
import { Scholarship } from '@/lib/types'

const mockScholarship: Scholarship = {
  id: '1',
  name: 'Test Scholarship',
  source_url: 'https://test.edu/apply',
  status: 'VERIFIED',
  health_score: 95,
  last_verified_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  data: {}
}

describe('TrustBadge', () => {
  it('renders the correct health score', () => {
    render(<TrustBadge scholarship={mockScholarship} />)
    expect(screen.getByText(/Health: 95/i)).toBeInTheDocument()
  })

  it('shows breakdown on hover', async () => {
    render(<TrustBadge scholarship={mockScholarship} />)
    const badge = screen.getByText(/Health: 95/i)
    
    fireEvent.mouseEnter(badge)
    
    expect(screen.getByText(/Health Score Breakdown/i)).toBeInTheDocument()
    expect(screen.getByText(/Freshness/i)).toBeInTheDocument()
    expect(screen.getByText(/Reliability/i)).toBeInTheDocument()
  })

  it('applies correct color for high score', () => {
    const { container } = render(<TrustBadge scholarship={mockScholarship} />)
    const badge = container.querySelector('.bg-green-100')
    expect(badge).toBeInTheDocument()
  })

  it('applies correct color for low score', () => {
    const lowScoreScholarship = { ...mockScholarship, health_score: 30 }
    const { container } = render(<TrustBadge scholarship={lowScoreScholarship} />)
    const badge = container.querySelector('.bg-red-100')
    expect(badge).toBeInTheDocument()
  })
})
