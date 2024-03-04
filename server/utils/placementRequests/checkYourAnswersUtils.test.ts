import { PlacementApplication } from '../../@types/shared'
import paths from '../../paths/placementApplications'
import { addResponseToFormArtifact } from '../../testutils/addToApplication'
import { applicationFactory, documentFactory, placementApplicationFactory } from '../../testutils/factories'
import placementDates from '../../testutils/factories/placementDates'
import { DateFormats } from '../dateUtils'
import {
  getPageTitle,
  mapPageForSummaryList,
  pageResponsesAsSummaryListItems,
  placementApplicationQuestionsForReview,
} from './checkYourAnswersUtils'

jest.mock('../applications/forPagesInTask')

const datesMarkup = `<dl class="govuk-summary-list govuk-summary-list--embedded">
      <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
        <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
          When will the person arrive?
        </dt>
        <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
        ${DateFormats.dateObjtoUIDate(new Date('2023-08-01'))}
        </dd>
      </div>
      
      <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
        <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
          How long should the Approved Premises placement last?
        </dt>
        <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
        5 days
        </dd>
      </div>
      </dl><dl class="govuk-summary-list govuk-summary-list--embedded">
      <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
        <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
          When will the person arrive?
        </dt>
        <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
        ${DateFormats.dateObjtoUIDate(new Date('2024-08-01'))}
        </dd>
      </div>
      
      <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
        <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
          How long should the Approved Premises placement last?
        </dt>
        <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
        3 weeks, 4 days
        </dd>
      </div>
      </dl>`

describe('checkYourAnswersUtils', () => {
  const application = applicationFactory.build()
  let placementApplication = placementApplicationFactory.build()
  placementApplication = addResponseToFormArtifact(placementApplication, {
    task: 'request-a-placement',
    page: 'same-ap',
    key: 'sameAp',
    value: 'Yes',
  }) as PlacementApplication

  describe('mapPageForSummaryList', () => {
    it('should return the correct object for the summary card', () => {
      expect(mapPageForSummaryList(placementApplication, 'same-ap', application)).toEqual({
        card: {
          title: { text: getPageTitle(placementApplication, 'same-ap') },
        },
        rows: pageResponsesAsSummaryListItems(placementApplication, 'same-ap', application),
      })
    })
  })

  describe('pageResponsesAsSummaryListItems', () => {
    it('should return the correct object for the summary card', () => {
      expect(pageResponsesAsSummaryListItems(placementApplication, 'same-ap', application)).toEqual([
        {
          key: { text: 'Do you want this person to stay in the same Approved Premises (AP)?' },
          value: { text: 'Yes' },
          actions: {
            items: [
              {
                href: paths.placementApplications.pages.show({
                  task: 'request-a-placement',
                  page: 'same-ap',
                  id: placementApplication.id,
                }),
                text: 'Change',
                visuallyHiddenText: 'Do you want this person to stay in the same Approved Premises (AP)?',
              },
            ],
          },
        },
      ])
    })

    it('if the page name is "additional-documents"', () => {
      const documents = documentFactory.buildList(1)

      ;(placementApplication.data as Record<string, unknown>)['request-a-placement'] = {
        'additional-documents': {
          selectedDocuments: documents,
        },
      }

      expect(pageResponsesAsSummaryListItems(placementApplication, 'additional-documents', application)).toEqual([
        {
          key: {
            html: `<a href="/applications/people/${application.person.crn}/documents/${documents[0].id}" data-cy-documentId="${documents[0].id}">${documents[0].fileName}</a>`,
          },
          value: {
            text: documents[0].description,
          },

          actions: {
            items: [
              {
                href: `/placement-applications/${application.id}/tasks/request-a-placement/pages/additional-documents`,
                text: 'Change',
                visuallyHiddenText: documents[0].fileName,
              },
            ],
          },
        },
      ])
    })

    describe('if the page name is "dates-of-placement"', () => {
      describe('and there are is a placementDates key on the placement application', () => {
        it('returns the dates from the placement application', () => {
          const placementDate1 = placementDates.build({ duration: 5, expectedArrival: '2023-08-01' })
          const placementDate2 = placementDates.build({ duration: 25, expectedArrival: '2024-08-01' })
          const rotlPlacementApplication = placementApplicationFactory.build({
            placementDates: [placementDate1, placementDate2],
            applicationId: application.id,
          })

          expect(pageResponsesAsSummaryListItems(rotlPlacementApplication, 'dates-of-placement', application)).toEqual([
            {
              key: {
                text: 'Dates of placement',
              },
              value: {
                html: datesMarkup,
              },

              actions: {
                items: [
                  {
                    href: `/placement-applications/${rotlPlacementApplication.id}/tasks/request-a-placement/pages/dates-of-placement`,
                    text: 'Change',
                    visuallyHiddenText: 'Dates of placement',
                  },
                ],
              },
            },
          ])
        })
      })

      describe('and there are is not a placementDates key on the placement application', () => {
        it('returns the dates from the data blob', () => {
          const rotlPlacementApplication = placementApplicationFactory.build({
            placementDates: undefined,
            applicationId: application.id,
          })

          ;(rotlPlacementApplication.data as Record<string, unknown>)['request-a-placement'] = {
            'dates-of-placement': {
              datesOfPlacement: [
                {
                  arrivalDate: '2023-08-01',
                  'arrivalDate-day': '01',
                  'arrivalDate-month': '8',
                  'arrivalDate-year': '2023',
                  duration: '5',
                  durationDays: '5',
                  durationWeeks: '0',
                },
                {
                  arrivalDate: '2024-08-02',
                  'arrivalDate-day': '01',
                  'arrivalDate-month': '8',
                  'arrivalDate-year': '2024',
                  duration: '25',
                  durationDays: '4',
                  durationWeeks: '3 ',
                },
              ],
            },
          }

          expect(pageResponsesAsSummaryListItems(rotlPlacementApplication, 'dates-of-placement', application)).toEqual([
            {
              key: {
                text: 'Dates of placement',
              },
              value: {
                html: datesMarkup,
              },

              actions: {
                items: [
                  {
                    href: `/placement-applications/${rotlPlacementApplication.id}/tasks/request-a-placement/pages/dates-of-placement`,
                    text: 'Change',
                    visuallyHiddenText: 'Dates of placement',
                  },
                ],
              },
            },
          ])
        })
      })
    })
  })

  describe('placementApplicationQuestionsForReview', () => {
    it('should return the responses in the correct format when the values are primitives', () => {
      const placementApp = placementApplicationFactory.build({
        document: { 'request-a-placement': [{ 'question 1': 'answer 1', 'question 2': 'answer 2' }] },
      })

      const expected = {
        card: {
          title: {
            text: 'Placement application information',
          },
        },
        rows: [
          { key: { text: 'question 1' }, value: { text: 'answer 1' } },
          { key: { text: 'question 2' }, value: { text: 'answer 2' } },
        ],
      }

      expect(placementApplicationQuestionsForReview(placementApp)).toEqual(expected)
    })

    it('should use the placementDates from the application if they exist', () => {
      const placementApp = placementApplicationFactory.build({
        document: {
          'request-a-placement': [
            {
              'Dates of placement': [],
            },
          ],
        },
        placementDates: [
          { duration: 5, expectedArrival: '2023-08-01' },
          { duration: 25, expectedArrival: '2024-08-01' },
        ],
      })
      const expected = {
        card: {
          title: {
            text: 'Placement application information',
          },
        },
        rows: [
          {
            key: { text: 'Dates of placement' },
            value: {
              html: datesMarkup,
            },
          },
        ],
      }

      expect(placementApplicationQuestionsForReview(placementApp)).toEqual(expected)
    })

    it('should responses from the document if placementDates dont exist', () => {
      const placementApp = placementApplicationFactory.build({
        placementDates: undefined,
        document: {
          'request-a-placement': [
            {
              'Dates of placement': [
                {
                  'When will the person arrive?': DateFormats.dateObjtoUIDate(new Date(2023, 7, 1)),
                  'How long should the Approved Premises placement last?': '5 days',
                },
                {
                  'When will the person arrive?': DateFormats.dateObjtoUIDate(new Date(2024, 7, 1)),
                  'How long should the Approved Premises placement last?': '3 weeks, 4 days',
                },
              ],
            },
          ],
        },
      })
      const expected = {
        card: {
          title: {
            text: 'Placement application information',
          },
        },
        rows: [
          {
            key: { text: 'Dates of placement' },
            value: {
              html: datesMarkup,
            },
          },
        ],
      }

      expect(placementApplicationQuestionsForReview(placementApp)).toEqual(expected)
    })
  })
})
