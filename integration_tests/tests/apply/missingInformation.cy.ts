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

  it('handles missing Nomis information', function test() {
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'prison-information',
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
