import {
  ApprovedPremisesApplication as Application,
  PlacementApplication,
  type ReleaseTypeOption,
  SentenceTypeOption,
  SituationOption,
} from '@approved-premises/api'

import { AND, GIVEN, THEN, WHEN } from './index'
import { ShowPage } from '../pages/apply'
import Page from '../pages/page'
import UpdatesToApplication from '../pages/match/placementRequestForm/updatesToApplication'
import CheckYourAnswers from '../pages/match/placementRequestForm/checkYourAnswers'
import { sentenceTypes } from '../../server/utils/applications/adjacentPageFromSentenceType'
import { allReleaseTypes } from '../../server/utils/applications/releaseTypeUtils'
import { situations } from '../../server/form-pages/shared/situation'
import CheckSentenceTypePage from '../pages/match/placementRequestForm/checkSentenceType'

export interface SentenceTypeOptions {
  sentenceType?: SentenceTypeOption
  releaseType?: ReleaseTypeOption
  situation?: SituationOption
}

interface SentenceTypeOptionsWithPagelist extends SentenceTypeOptions {
  pageList: Array<Page>
}

export default class placementApplicationHelper {
  constructor(
    private readonly application: Application,
    private readonly placementApplication: PlacementApplication,
  ) {}

  /**
   * Starts a placement application up to the branch for different types, either following the route to select sentence type and release type or situation if sentence information supplied
   * or uses the sentence info from the application if not
   * * */
  startApplication({ sentenceType, releaseType, situation }: SentenceTypeOptions = {}) {
    GIVEN('I am on the readonly application view')
    const showPage = ShowPage.visit(this.application)

    WHEN('I click the Request Placement Application tab')
    showPage.clickRequestAPlacementTab()

    THEN('I should be able to create a placement request')
    showPage.clickCreatePlacementButton()

    GIVEN('I am on the sentence type confirmation page')
    const checkSentenceTypePage = Page.verifyOnPage(CheckSentenceTypePage)

    WHEN('I submit the page, I see an error')
    checkSentenceTypePage.clickButton('Save and continue')
    checkSentenceTypePage.shouldShowErrorMessagesForFields(['sentenceTypeCheck'], {
      sentenceTypeCheck: 'You must say if the sentence information is correct',
    })

    if (sentenceType) {
      WHEN('I select that the type has changed')
      checkSentenceTypePage.checkRadioByLabel('Yes')
      cy.task('stubPlacementApplicationFromLastUpdate', {
        placementApplication: this.placementApplication,
        update: { 'sentence-type-check': { sentenceTypeCheck: 'yes' } },
      })
      checkSentenceTypePage.clickButton('Save and continue')

      THEN('I should be on the sentence type selection page')
      const sentenceTypePage = Page.verifyOnPage(Page, 'Which sentence type does the person have?')

      WHEN('if try to submit, I should see an error')
      sentenceTypePage.clickButton('Save and continue')

      sentenceTypePage.shouldShowErrorMessagesForFields(['sentenceType'], {
        sentenceType: 'You must choose a sentence type',
      })

      WHEN(`I select ${sentenceTypes[sentenceType]} and submit`)
      sentenceTypePage.checkRadioByLabel(sentenceTypes[sentenceType])
      cy.task('stubPlacementApplicationFromLastUpdate', {
        placementApplication: this.placementApplication,
        update: {
          'sentence-type': {
            sentenceType,
          },
        },
      })
      sentenceTypePage.clickButton('Save and continue')

      if (releaseType) {
        THEN('I should be on the release type selection page')
        const releaseTypePage = Page.verifyOnPage(Page, 'What is the release type?')

        WHEN('I try to submit, I should see an error')
        releaseTypePage.clickButton('Save and continue')
        releaseTypePage.shouldShowErrorMessagesForFields(['releaseType'], {
          releaseType: 'You must choose a release type',
        })

        WHEN(`I select ${allReleaseTypes[releaseType]} and submit`)
        releaseTypePage.checkRadioByLabel(allReleaseTypes[releaseType])
        releaseTypePage.clickButton('Save and continue')
        cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication: this.placementApplication })

        return { checkSentenceTypePage, sentenceTypePage, releaseTypePage }
      }
      if (situation) {
        THEN('I should be on the situation selection page')
        const situationPage = Page.verifyOnPage(Page, 'What is the reason for placing this person in an AP?')

        WHEN('I try to submit, I should see an error')
        situationPage.clickButton('Save and continue')
        situationPage.shouldShowErrorMessagesForFields(['situation'], {
          situation: 'You must choose a situation',
        })

        WHEN(`I select ${situations[situation]} and submit`)
        situationPage.checkRadioByLabel(situations[situation])
        situationPage.clickButton('Save and continue')
        cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication: this.placementApplication })

        return { checkSentenceTypePage, sentenceTypePage, situationPage }
      }
    }
    WHEN('I select that the type has not changed')
    checkSentenceTypePage.checkRadioByLabel('No')
    cy.task('stubPlacementApplicationFromLastUpdate', {
      placementApplication: this.placementApplication,
      update: {
        'sentence-type-check': {
          sentenceTypeCheck: 'no',
        },
      },
    })
    checkSentenceTypePage.clickButton('Save and continue')
    cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication: this.placementApplication })

    return { checkSentenceTypePage }
  }

  /**
   * Completes a placement application from the application updates onwards
   * * */
  completeApplication({ pageList, releaseType, sentenceType, situation }: SentenceTypeOptionsWithPagelist) {
    AND('I complete the application updates page')
    const updatesToApplication = Page.verifyOnPage(UpdatesToApplication, this.placementApplication.id)
    updatesToApplication.completeForm()
    updatesToApplication.clickSubmit()
    cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication: this.placementApplication })

    THEN('I am on the check your answers page')
    const checkYourAnswersPage = new CheckYourAnswers()
    cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication: this.placementApplication })

    AND('I should be able go go back through the form using the back buttons and forward again')
    this.clickBackAndForward([...pageList, updatesToApplication, checkYourAnswersPage])

    WHEN('I submit the check your answers page')
    checkYourAnswersPage.completeForm()
    checkYourAnswersPage.clickSubmit()

    THEN('I should be taken to the confirmation page')
    Page.verifyOnPage(Page, 'Request for placement confirmed')

    AND('the correct submission should have been made')
    cy.task('verifyPlacementApplicationSubmit', this.placementApplication.id).then(requests => {
      const body = JSON.parse(requests[0].body)
      if (releaseType) {
        expect(body).to.have.keys('requestedPlacementPeriods', 'translatedDocument', 'sentenceType', 'releaseType')
        expect(body).to.contain({ releaseType, sentenceType })
      }
      if (situation) {
        expect(body).to.have.keys('requestedPlacementPeriods', 'translatedDocument', 'sentenceType', 'situationType')
        expect(body).to.contain({ situationType: situation, sentenceType })
      }
    })
  }

  clickBackAndForward(pageList: Array<Page>) {
    ;[...pageList].reverse().forEach((page: Page, index) => {
      page.checkOnPage()
      if (index + 1 < pageList.length) page.clickBack()
    })
    pageList.forEach((page: Page, index) => {
      page.checkOnPage()
      if (index + 1 < pageList.length) page.clickSubmit()
    })
  }
}
