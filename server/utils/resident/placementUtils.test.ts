import { render } from 'nunjucks'
import { applicationFactory, cas1SpaceBookingShortSummaryFactory } from '../../testutils/factories'
import { applicationCardList, applicationDocumentAccordion, getStatusSpecificFields } from './placementUtils'
import { DateFormats } from '../dateUtils'

jest.mock('nunjucks')

describe('application utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
  })

  describe('applicationDocumentAccordion', () => {
    const application = applicationFactory.build()

    const expectedItem = (title: string, template = 'cardList.njk') => ({
      content: { html: `Nunjucks template manage/resident/partials/${template}` },
      heading: { text: title },
    })

    beforeEach(() => {
      jest.resetAllMocks()
      ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
    })

    it('should render the application document as a card accordion', () => {
      expect(applicationDocumentAccordion(application)).toEqual({
        id: 'applicationAccordion',
        items: [
          expectedItem('Person details', 'personDetails.njk'),
          expectedItem('Type of AP required'),
          expectedItem('Risk and need factors'),
          expectedItem('Considerations for when the placement ends'),
          expectedItem('Add documents'),
        ],
      })

      expect((render as jest.Mock).mock.calls[1][1]).toEqual({
        cardList: [
          {
            card: {
              attributes: { 'data-cy-section': 'basic-information' },
              title: { headingLevel: 2, text: 'Basic Information' },
            },
            rows: [],
          },
          {
            card: {
              attributes: { 'data-cy-section': 'type-of-ap' },
              title: { headingLevel: 2, text: 'Type of AP required' },
            },
            rows: [],
          },
        ],
      })
      expect((render as jest.Mock).mock.calls[4][1]).toEqual({
        cardList: [
          {
            card: {
              attributes: { 'data-cy-section': 'attach-required-documents' },
              title: { headingLevel: 2, text: 'Attach required documents' },
            },
            rows: [],
          },
        ],
      })
    })

    it('should render the alert and metadata cards', () => {
      expect(applicationCardList(application)).toEqual([
        { html: 'Nunjucks template manage/resident/partials/alert.njk' },
        { html: 'Nunjucks template partials/insetText.njk' },
      ])

      expect((render as jest.Mock).mock.calls[0]).toEqual([
        'manage/resident/partials/alert.njk',
        {
          html: 'Check this profile for the most up-to-date information for this resident.',
          title: 'This application may not show the latest resident information',
          variant: 'information',
        },
      ])
      expect((render as jest.Mock).mock.calls[1]).toEqual([
        'partials/insetText.njk',
        {
          html: `Application submitted by ${application.applicantUserDetails.name} on ${DateFormats.isoDateToUIDate(application.submittedAt)}`,
        },
      ])
    })
  })
})

describe('getStatusSpecificFields', () => {
  const getFieldLabels = (fields: ReturnType<typeof getStatusSpecificFields>) =>
    fields.filter(Boolean).map(f => (f.key as { text: string }).text)

  const commonFields = [
    'Approved Premises',
    'Date of booking',
    'AP type',
    'AP requirements',
    'Room requirements',
    'Delius event number',
  ]

  const statusSpecificFields = {
    upcoming: ['Expected arrival date', 'Expected departure date'],
    arrived: ['Actual arrival date', 'Expected departure date'],
    notArrived: ['Expected arrival date', 'Expected departure date', 'Non-arrival reason'],
    departed: ['Arrival date', 'Departure date', 'Departure reason', 'Move on', 'Notes'],
    cancelled: ['Expected arrival date', 'Expected departure date', 'Cancellation date'],
  }

  const statusFactories = {
    upcoming: cas1SpaceBookingShortSummaryFactory.upcoming(),
    arrived: cas1SpaceBookingShortSummaryFactory.current(),
    notArrived: cas1SpaceBookingShortSummaryFactory.nonArrival(),
    departed: cas1SpaceBookingShortSummaryFactory.departed(),
    cancelled: cas1SpaceBookingShortSummaryFactory.cancelled(),
  }

  it.each(Object.keys(statusSpecificFields))('should return correct fields for %s status', status => {
    const placement = statusFactories[status as keyof typeof statusFactories].build()
    const fieldLabels = getFieldLabels(getStatusSpecificFields(placement))
    const expectedFields = [...commonFields, ...statusSpecificFields[status as keyof typeof statusSpecificFields]]

    expect(fieldLabels.sort()).toEqual(expectedFields.sort())
  })
})
