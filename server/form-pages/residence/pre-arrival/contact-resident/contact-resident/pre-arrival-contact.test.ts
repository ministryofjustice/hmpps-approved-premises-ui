import PreArrivalContact from './pre-arrival-contact'

describe('PreArrivalContact', () => {
  it('should have basic properties', () => {
    const page = new PreArrivalContact({})
    expect(page.title).toBe('Pre-arrival contact')
    expect(page.next()).toBe('')
    expect(page.previous()).toBe('')
  })

  it('should generate a response', () => {
    const page = new PreArrivalContact({
      contactMethod: 'contact-method',
      contactDate: '2026-05-12',
      reasonForNoContact: 'Reason',
    })
    expect(page.response()).toEqual({
      'Contact date': '2026-05-12',
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

  it('should error if no contact and reason is empty', () => {
    const page = new PreArrivalContact({
      contactMethod: 'noContact',
      contactDate: '2026-05-12',
    })
    expect(page.errors()).toEqual({
      reasonForNoContact: 'You must enter a reason for not making contact',
    })
  })

  it('should clear the reason if any contact option', () => {
    const page = new PreArrivalContact({
      contactMethod: 'noContact',
      contactDate: '2026-05-12',
      reasonForNoContact: 'some reason',
    })
    expect(page.errors()).toEqual({})
    expect(page.body).toEqual({
      contactDate: '2026-05-12',
      contactMethod: 'noContact',
      reasonForNoContact: 'some reason',
    })
  })

  it('should clear the reason if any other contact option', () => {
    const page = new PreArrivalContact({
      contactMethod: 'faceToFace',
      contactDate: '2026-05-12',
      reasonForNoContact: 'some reason',
    })
    expect(page.errors()).toEqual({})
    expect(page.body).toEqual({ contactDate: '2026-05-12', contactMethod: 'faceToFace', reasonForNoContact: '' })
  })
})
