import { addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import ApplyHelper from '../../helpers/apply'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { setup } from './setup'

context('Apply - Missing information', () => {
  beforeEach(setup)

  it('handles missing Oasys information', function test() {
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)
    const oasysMissing = true

    apply.setupApplicationStubs(uiRisks, oasysMissing)
    apply.startApplication()
    apply.completeBasicInformation({ isEmergencyApplication: false })
    apply.completeTypeOfApSection()
    apply.completeOasysSection(oasysMissing)
  })

  it('handles disappearing Oasys information - where a section is removed from Oasys after selection (APS-1772)', function test() {
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)
    // Given I start an application
    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()
    apply.completeBasicInformation({ isEmergencyApplication: false })
    apply.completeTypeOfApSection()
    // When I select all the oasys sections
    apply.selectAllOasysSections()
    // and remove one of the sections I selected from the mock
    apply.stubOasysEndpoints(true)
    // Then I can submit the page successfully
    apply.submitOasysSectionsPage()
  })

  it('handles missing Nomis information', function test() {
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)

    this.application = addResponsesToFormArtifact(this.application, {
      task: 'prison-information',
      page: 'case-notes',
      keyValuePairs: {
        informationFromPrison: 'yes',
        informationFromPrisonDetail: 'Some Detail',
        additionalConditionsDetail: 'some details',
      },
    })

    const apply = new ApplyHelper(this.application, this.person, this.offences)
    const nomisMissing = true

    apply.setupApplicationStubs(uiRisks, false, nomisMissing)
    apply.startApplication()
    apply.completeBasicInformation({ isEmergencyApplication: false })
    apply.completeTypeOfApSection()
    apply.completeOasysSection()
    apply.completeRiskManagementSection()
    apply.completePrisonInformationSection(nomisMissing)
  })
})
