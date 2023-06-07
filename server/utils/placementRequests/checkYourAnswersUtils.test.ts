import { PlacementApplication } from '../../@types/shared'
import paths from '../../paths/placementApplications'
import { addResponseToFormArtifact } from '../../testutils/addToApplication'
import { placementApplicationFactory } from '../../testutils/factories'
import {
  getPageTitle,
  mapPageForSummaryList,
  pageResponsesAsSummaryListItems,
  pagesForReview,
} from './checkYourAnswersUtils'

describe('checkYourAnswersUtils', () => {
  let placementApplication = placementApplicationFactory.build()
  placementApplication = addResponseToFormArtifact(placementApplication, {
    section: 'request-a-placement',
    page: 'same-ap',
    key: 'sameAp',
    value: 'Yes',
  }) as PlacementApplication

  describe('mapPageForSummaryList', () => {
    it('should return the correct object for the summary card', () => {
      expect(mapPageForSummaryList(placementApplication, 'same-ap')).toEqual({
        card: {
          title: { text: getPageTitle(placementApplication, 'same-ap') },
        },
        rows: pageResponsesAsSummaryListItems(placementApplication, 'same-ap'),
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
        expect(pageResponsesAsSummaryListItems(placementApplication, 'same-ap')).toEqual([
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
  })
})
