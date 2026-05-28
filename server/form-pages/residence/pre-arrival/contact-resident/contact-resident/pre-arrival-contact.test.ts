import PreArrivalContact from './pre-arrival-contact'

describe('PreArrivalContact', () => {
  const validDate = '6/2/2026'

  it('should have basic properties', () => {
    const page = new PreArrivalContact({})
    expect(page.title).toBe('Pre-arrival contact')
    expect(page.next()).toBe('')
    expect(page.previous()).toBe('')
  })

  it('should generate a response', () => {
    const page = new PreArrivalContact({
      contactMethod: 'contact-method',
      contactDate: validDate,
      reasonForNoContact: 'Reason',
    })
    expect(page.response()).toEqual({
      'Contact date': validDate,
      'How did you contact the person?': 'contact-method',
      'Reason for no contact': 'Reason',
    })
  })

  it('should validate an empty page body', () => {
    const page = new PreArrivalContact({})
    expect(page.errors()).toEqual({
      contactDate: 'You must enter a contact date',
      contactMethod: 'You must enter a contact method',
    })
  })

  it('should validate the contact date', () => {
    const page = new PreArrivalContact({ contactDate: '29/02/2026', contactMethod: 'letter' })
    expect(page.errors()).toEqual({
      contactDate: 'The contact date is invalid',
    })
  })

  it('should error if no contact and reason is empty', () => {
    const page = new PreArrivalContact({
      contactMethod: 'noContact',
      contactDate: validDate,
    })
    expect(page.errors()).toEqual({
      reasonForNoContact: 'You must enter a reason for not making contact',
    })
  })

  it('should clear the reason if any contact option', () => {
    const page = new PreArrivalContact({
      contactMethod: 'noContact',
      contactDate: validDate,
      reasonForNoContact: 'some reason',
    })
    expect(page.errors()).toEqual({})
    expect(page.body).toEqual({
      contactDate: validDate,
      contactMethod: 'noContact',
      reasonForNoContact: 'some reason',
    })
  })

  it('should clear the reason if any other contact option', () => {
    const page = new PreArrivalContact({
      contactMethod: 'faceToFace',
      contactDate: validDate,
      reasonForNoContact: 'some reason',
    })
    expect(page.errors()).toEqual({})
    expect(page.body).toEqual({ contactDate: validDate, contactMethod: 'faceToFace', reasonForNoContact: '' })
  })
})
