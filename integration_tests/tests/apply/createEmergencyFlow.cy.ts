import { addDays } from 'date-fns'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import { tierDtoFactory, tierEnvelopeFactory, userFactory } from '../../../server/testutils/factories'
import ApplyHelper from '../../helpers/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { setup } from './setup'
import { GIVEN, THEN, WHEN } from '../../helpers'

context('Apply', () => {
  beforeEach(setup)

  it('allows completion of application emergency flow with a V3 tier', function test() {
    GIVEN('I need to complete I need a placement')
    const user = userFactory.build()
    this.application.createdByUserId = user.id
    this.application.submittedAt = undefined

    this.person.tier = tierDtoFactory.v3().build({ tierScore: 'B' })
    this.application.risks.tier = tierEnvelopeFactory.build({ value: { level: 'B', version: 'V3' } })
    cy.task('stubRiskProfile', { person: this.person, personRisks: this.application.risks })

    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences, user)
    const tomorrow = addDays(new Date(), 1)

    this.application = addResponsesToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'release-date',
      keyValuePairs: {
        ...DateFormats.dateObjectToDateInputs(tomorrow, 'releaseDate'),
        releaseDate: DateFormats.dateObjToIsoDate(tomorrow),
        knowReleaseDate: 'yes',
      },
    })

    this.application = addResponseToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'reason-for-short-notice',
      key: 'reason',
      value: 'riskEscalated',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      task: 'further-considerations',
      page: 'trigger-plan',
      keyValuePairs: {
        planInPlace: 'yes',
        additionalConditions: 'yes',
        additionalConditionsDetail: 'some details',
      },
    })
    WHEN('I start the application')
    apply.setupApplicationStubs(uiRisks)
    apply.startApplication({ withCas2Interstitial: true })

    THEN('I am able to complete the Emergency application flow')
    apply.completeEmergencyApplication()
  })
})
