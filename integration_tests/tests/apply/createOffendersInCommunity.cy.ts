import { addMonths, subDays } from 'date-fns'
import { addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import { personFactory } from '../../../server/testutils/factories'
import ApplyHelper from '../../helpers/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { setup } from './setup'
import { AND, THEN } from '../../helpers'

context('Apply', () => {
  beforeEach(setup)

  it('supports offenders already in the community', function test() {
    const person = personFactory.build({ status: 'InCommunity' })

    // A 'regular' placement date (not emergency or short notice)
    const placementDate = addMonths(new Date(), 7)
    // A release date in the past
    const releaseDate = subDays(new Date(), 1)
    this.application = addResponsesToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'placement-date',
      keyValuePairs: {
        ...DateFormats.dateObjectToDateInputs(placementDate, 'startDate'),
        startDate: DateFormats.dateObjToIsoDate(placementDate),
        startDateSameAsReleaseDate: 'no',
      },
    })
    this.application = addResponsesToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'release-date',
      keyValuePairs: {
        ...DateFormats.dateObjectToDateInputs(releaseDate, 'releaseDate'),
        releaseDate: DateFormats.dateObjToIsoDate(releaseDate),
      },
    })

    this.applicationData = this.application.data

    this.application.person = person

    AND('I complete the application')
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, person, this.offences)

    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()
    apply.completeApplication({ isExceptionalCase: false, isInComunity: true })

    THEN('the application should be submitted to the API')
    cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(apply.numberOfPages())
      const body = JSON.parse(requests[requests.length - 1].body)

      expect(body).to.have.keys(
        'duration',
        'requestedPlacementPeriod',
        'data',
        'document',
        'apType',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'isInapplicable',
        'isEmergencyApplication',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )

      expect(body.data).to.deep.equal(this.applicationData)
    })

    cy.task('verifyApplicationSubmit', this.application.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(`/cas1/applications/${this.application.id}/submission`)

      const body = JSON.parse(requests[0].body)
      expect(body).to.have.keys(
        'duration',
        'requestedPlacementPeriod',
        'translatedDocument',
        'apType',
        'isEmergencyApplication',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )
    })
  })
})
