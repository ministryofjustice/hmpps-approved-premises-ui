import { PlacementApplication } from '../../@types/shared'
import paths from '../../paths/placementApplications'
import { addResponseToFormArtifact } from '../../testutils/addToApplication'
import { applicationFactory, documentFactory, placementApplicationFactory } from '../../testutils/factories'
import { embeddedSummaryListItem } from '../applications/summaryListUtils/embeddedSummaryListItem'
import { DateFormats } from '../dateUtils'
import {
  getPageTitle,
  mapPageForSummaryList,
  pageResponsesAsSummaryListItems,
  placementApplicationQuestionsForReview,
} from './reviewUtils'

jest.mock('../applications/forPagesInTask')

const datesMarkup = embeddedSummaryListItem([
  {
    'When will the person arrive?': DateFormats.dateObjtoUIDate(new Date('2023-08-01')),
    'Is the date flexible?': 'Yes',
    'How long should the Approved Premises placement last?': '5 nights',
  },
  {
    'When will the person arrive?': DateFormats.dateObjtoUIDate(new Date('2024-08-01')),
    'Is the date flexible?': 'No',
    'How long should the Approved Premises placement last?': '25 nights',
  },
])

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
            html: `<a href="/applications/people/${application.person.crn}/documents/${documents[0].id}" data-debounce-link data-cy-documentId="${documents[0].id}">${documents[0].fileName}</a>`,
          },
          value: {
            text: documents[0].description,
          },

          actions: {
            items: [
              {
                href: `/placement-applications/${placementApplication.id}/tasks/request-a-placement/pages/additional-documents`,
                text: 'Change',
                visuallyHiddenText: documents[0].fileName,
              },
            ],
          },
        },
      ])
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

    it('should show date responses from the document', () => {
      const placementApp = placementApplicationFactory.build({
        placementDates: undefined,
        document: {
          'request-a-placement': [
            {
              'Dates of placement': [
                {
                  'When will the person arrive?': DateFormats.dateObjtoUIDate(new Date(2023, 7, 1)),
                  'Is the date flexible?': 'Yes',
                  'How long should the Approved Premises placement last?': '5 nights',
                },
                {
                  'When will the person arrive?': DateFormats.dateObjtoUIDate(new Date(2024, 7, 1)),
                  'Is the date flexible?': 'No',
                  'How long should the Approved Premises placement last?': '25 nights',
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
