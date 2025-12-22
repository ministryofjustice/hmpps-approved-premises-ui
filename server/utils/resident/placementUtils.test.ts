import { render } from 'nunjucks'
import { applicationFactory } from '../../testutils/factories'
import { applicationCardList, applicationDocumentAccordion } from './placementUtils'
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
        id: 'applicationId',
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
