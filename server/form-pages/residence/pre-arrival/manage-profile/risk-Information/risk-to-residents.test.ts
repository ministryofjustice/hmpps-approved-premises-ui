import RiskToResidents from './risk-to-residents'

describe('RiskToResidents', () => {
  it('should have basic properties', () => {
    const page = new RiskToResidents({})
    expect(page.title).toBe('Risk to other residents')
    expect(page.next()).toBe('')
    expect(page.previous()).toBe('risk-to-staff')
  })

  it('should generate a response', () => {
    const page = new RiskToResidents({
      riskToResidentsSummary: 'summary text',
    })
    expect(page.response()).toEqual({
      'Risk to other residents': 'summary text',
    })
  })

  it('should validate an empty page body', () => {
    const page = new RiskToResidents({})
    expect(page.errors()).toEqual({
      riskToResidentsSummary: 'You must enter a summary of the risk to other residents',
    })
  })
})
