import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'

import ReasonForShortNotice, { shortNoticeReasons } from './reasonForShortNotice'

import { applicationFactory } from '../../../../testutils/factories'

jest.mock('../../../../utils/applications/noticeTypeFromApplication')

describe('ReasonForShortNotice', () => {
  const application = applicationFactory.build()

  it('should return the correct title and question for emergency applications', () => {
    ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
    const page = new ReasonForShortNotice({}, application)

    expect(page.title).toEqual('Emergency application')
    expect(page.question).toEqual(
      'What was the reason for submitting this application 7 days or less before the AP is needed?',
    )
  })

  it('should return the correct title and question for short notice applications', () => {
    ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('shortNotice')
    const page = new ReasonForShortNotice({}, application)

    expect(page.title).toEqual('Short notice application')
    expect(page.question).toEqual('Why is this application being submitted outside of National Standards timescales?')
  })

  it('should return the question for standard applications and not the title', () => {
    ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
    const page = new ReasonForShortNotice({}, application)

    expect(page.title).toBeUndefined()
    expect(page.question).toEqual('Why is this application being submitted outside of National Standards timescales?')
  })

  it('should set the body', () => {
    const page = new ReasonForShortNotice(
      {
        reason: 'other',
        other: 'Foo',
      },
      application,
    )

    expect(page.body).toEqual({
      reason: 'other',
      other: 'Foo',
    })
  })

  itShouldHaveNextValue(new ReasonForShortNotice({}, application), 'placement-purpose')
  itShouldHavePreviousValue(new ReasonForShortNotice({}, application), 'placement-date')

  describe('errors', () => {
    it('should return an empty object if all the fields are complete', () => {
      const page = new ReasonForShortNotice(
        {
          reason: 'other',
          other: 'Foo',
        },
        application,
      )

      expect(page.errors()).toEqual({})
    })

    it('should return an error if the reason is blank', () => {
      const page = new ReasonForShortNotice({}, application)

      expect(page.errors()).toEqual({ reason: 'You must specify a reason' })
    })

    it('should return an error if the other is selected and the other reason is blank', () => {
      const page = new ReasonForShortNotice({ reason: 'other' }, application)

      expect(page.errors()).toEqual({ other: 'You must specify what the other reason is' })
    })
  })

  describe('response', () => {
    it('should return the other reason if other is specified', () => {
      const page = new ReasonForShortNotice(
        {
          reason: 'other',
          other: 'Foo',
        },
        application,
      )

      expect(page.response()).toEqual({ [page.question]: 'Foo' })
    })

    it('should return a translated response', () => {
      const page = new ReasonForShortNotice(
        {
          reason: 'alternativeToRecall',
        },
        application,
      )

      expect(page.response()).toEqual({ [page.question]: 'AP placement is an alternative to recall' })
    })
  })

  describe('items', () => {
    it('should return the reasons as radio items with a conditional in the `other` option', () => {
      const page = new ReasonForShortNotice({}, application)
      const items = page.items('SOME HTML')

      expect(items.length).toEqual(Object.keys(shortNoticeReasons).length)
      expect(items.pop()).toEqual({
        checked: false,
        conditional: {
          html: 'SOME HTML',
        },
        text: 'Other, please specify',
        value: 'other',
      })
    })
  })
})
