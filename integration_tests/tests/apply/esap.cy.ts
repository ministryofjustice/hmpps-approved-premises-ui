import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import ApplyHelper from '../../helpers/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { setup } from './setup'
import Page from '../../pages/page'
import TaskListPage from '../../pages/apply/taskListPage'

context('Apply - ESAP', () => {
  beforeEach(setup)

  it('allows completion of the ESAP flow', function test() {
    // Given I have completed the basic information of a form
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    this.application.data['type-of-ap'] = {
      'ap-type': {
        type: 'esap',
      },
      'managed-by-national-security-division': {
        managedByNationalSecurityDivision: 'no',
      },
      'esap-exceptional-case': {
        agreedCaseWithCommunityHopp: 'yes',
        communityHoppName: 'Some Manager',
        ...DateFormats.isoDateToDateInputs('2023-07-01', 'agreementDate'),
        agreementSummary: 'Some Summary Text',
      },
      'esap-placement-screening': {
        esapReasons: ['secreting', 'cctv'],
      },
      'esap-placement-cctv': {
        cctvHistory: ['appearance', 'networks'],
        cctvIntelligence: 'yes',
        cctvIntelligenceDetails: 'Some Details',
        cctvNotes: 'Some notes',
      },
      'esap-placement-secreting': {
        secretingHistory: ['radicalisationLiterature', 'drugs'],
        secretingIntelligence: 'yes',
        secretingIntelligenceDetails: 'Some Details',
        secretingNotes: 'Some notes',
      },
    }

    apply.setupApplicationStubs(uiRisks)

    // And I start the application
    apply.startApplication()
    apply.completeBasicInformation()

    // And I complete the Esap flow
    apply.completeEsapFlow()

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the type-of-ap task should show as completed
    tasklistPage.shouldShowTaskStatus('type-of-ap', 'Completed')
  })

  it('Tells me I am ineligible for ESAP', function test() {
    // Given I have completed the basic information of a form
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    this.application = addResponseToFormArtifact(this.application, {
      task: 'type-of-ap',
      page: 'ap-type',
      key: 'type',
      value: 'esap',
    })

    this.application = addResponseToFormArtifact(this.application, {
      task: 'type-of-ap',
      page: 'managed-by-national-security-division',
      key: 'managedByNationalSecurityDivision',
      value: 'no',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      task: 'type-of-ap',
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
