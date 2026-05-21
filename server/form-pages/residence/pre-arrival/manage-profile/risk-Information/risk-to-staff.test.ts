import RiskToStaff from './risk-to-staff'

describe('RiskToResidents', () => {
  it('should have basic properties', () => {
    const page = new RiskToStaff({})
    expect(page.title).toBe('Risk to staff')
    expect(page.next()).toBe('risk-to-residents')
    expect(page.previous()).toBe('')
  })

  it('should generate a response', () => {
    const page = new RiskToStaff({
      riskToStaffSummary: 'summary text',
    })
    expect(page.response()).toEqual({
      'Risk to staff': 'summary text',
    })
  })

  it('should validate an empty page body', () => {
    const page = new RiskToStaff({})
    expect(page.errors()).toEqual({
      riskToStaffSummary: 'You must enter a summary of the risk to staff',
    })
  })
})
