import { PlacementApplication } from '../../@types/shared'
import paths from '../../paths/placementApplications'
import { addResponseToFormArtifact } from '../../testutils/addToApplication'
import { applicationFactory, documentFactory, placementApplicationFactory } from '../../testutils/factories'
import {
  getPageTitle,
  mapPageForSummaryList,
  pageResponsesAsSummaryListItems,
  pagesForReview,
} from './checkYourAnswersUtils'

describe('checkYourAnswersUtils', () => {
  const application = applicationFactory.build()
  let placementApplication = placementApplicationFactory.build()
  placementApplication = addResponseToFormArtifact(placementApplication, {
    section: 'request-a-placement',
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

  describe('pagesForReview', () => {
    it('should return all of the pages except the check-your-answers page', () => {
      placementApplication = addResponseToFormArtifact(placementApplication, {
        section: 'request-a-placement',
        page: 'check-your-answers',
        key: 'reviwed',
        value: '1',
      }) as PlacementApplication
      expect(pagesForReview(placementApplication)).toEqual(['same-ap'])
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
  })

  it('if the page name is "additional-documents"', () => {
    const documents = documentFactory.buildList(1)

    placementApplication.data['request-a-placement'] = {
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
})
