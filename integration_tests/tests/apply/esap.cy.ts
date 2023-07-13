import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import ApplyHelper from '../../helpers/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { setup } from './setup'

context('Apply - ESAP', () => {
  beforeEach(setup)

  it('allows completion of the ESAP flow', function test() {
    // Given I have completed the basic information of a form
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'ap-type',
      key: 'type',
      value: 'esap',
    })

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'managed-by-national-security-division',
      key: 'managedByNationalSecurityDivision',
      value: 'no',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'esap-exceptional-case',
      keyValuePairs: {
        ...DateFormats.isoDateToDateInputs('2023-07-01', 'agreementDate'),
        agreedCaseWithCommunityHopp: 'yes',
        communityHoppName: 'Some Manager',
        agreementSummary: 'Some Summary Text',
      },
    })

    apply.setupApplicationStubs(uiRisks)

    // And I start the application
    apply.startApplication()
    apply.completeBasicInformation()

    // And I complete the Esap flow
    apply.completeEsapFlow()

    // Then I should be asked if the person is managed by the National Security division
  })

  it('Tells me I am ineligible for ESAP', function test() {
    // Given I have completed the basic information of a form
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'ap-type',
      key: 'type',
      value: 'esap',
    })

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'managed-by-national-security-division',
      key: 'managedByNationalSecurityDivision',
      value: 'no',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'esap-exceptional-case',
      keyValuePairs: {
        agreedCaseWithCommunityHopp: 'no',
      },
    })

    apply.setupApplicationStubs(uiRisks)

    // And I start the application
    apply.startApplication()
    apply.completeBasicInformation()

    // And I complete the Esap flow
    apply.completeIneligibleEsapFlow()

    // Then I should be told I am ineligible for an ESAP placement
  })
})
