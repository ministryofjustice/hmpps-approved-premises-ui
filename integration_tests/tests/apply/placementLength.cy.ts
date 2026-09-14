import { addDays } from 'date-fns'
import * as ApplyPages from '../../pages/apply'
import Page from '../../pages/page'
import { tierDtoFactory } from '../../../server/testutils/factories'
import { arrivalDateFromApplication } from '../../../server/utils/applications/arrivalDateFromApplication'
import { DateFormats } from '../../../server/utils/dateUtils'
import { setup } from './setup'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Apply - placement length and dates', () => {
  beforeEach(setup)

  const defaultDurationDays = 112

  it('shows the placement length and dates when the person has a version 3 tier', function test() {
    GIVEN('there is an application for a person with a version 3 tier')
    const application = { ...this.application, status: 'started' }
    application.person = { ...this.person, tier: tierDtoFactory.v3().build({ tierScore: 'B' }) }
    cy.task('stubApplicationGet', { application })

    AND('a placement duration has been calculated for the application')
    cy.task('stubGetPlacementDuration', {
      applicationId: application.id,
      durationObj: { defaultDurationDays, maxDurationDays: defaultDurationDays },
    })

    WHEN('I visit the tasklist')
    ApplyPages.TaskListPage.visit(application)

    AND(`I click the 'Add move on information' task`)
    cy.get('[data-cy-task-name="move-on"]').click()

    THEN('I am shown the placement length and dates')
    const placementDurationPage = Page.verifyOnPage(ApplyPages.PlacementDurationPage, application)
    placementDurationPage.checkPlacementLength('16 weeks')

    AND('the placement dates are based on the release date and the placement length')
    const arrivalDate = DateFormats.isoToDateObj(arrivalDateFromApplication(application))
    placementDurationPage.checkPlacementDates(
      DateFormats.dateObjtoUIDate(arrivalDate),
      DateFormats.dateObjtoUIDate(addDays(arrivalDate, defaultDurationDays)),
    )
  })
})
