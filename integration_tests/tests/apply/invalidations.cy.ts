import { addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import * as ApplyPages from '../../pages/apply'
import { setup } from './setup'

context('Apply', () => {
  beforeEach(setup)

  it('invalidates the check your answers step if an answer is changed', function test() {
    // Given there is a complete application in the database
    const application = { ...this.application, status: 'started' }
    cy.task('stubApplicationGet', { application })

    // And I visit the tasklist
    ApplyPages.TaskListPage.visit(application)

    // And I click on a task
    cy.get('[data-cy-task-name="location-factors"]').click()

    // And I change my response
    this.application = addResponsesToFormArtifact(this.application, {
      task: 'location-factors',
      page: 'describe-location-factors',
      keyValuePairs: {
        ...this.application.data['location-factors']['describe-location-factors'],
        postcodeArea: 'WS1',
      },
    })

    const describeLocationFactorsPage = new ApplyPages.DescribeLocationFactors(this.application)
    describeLocationFactorsPage.clearAllInputs()
    describeLocationFactorsPage.completeForm()
    describeLocationFactorsPage.clickSubmit()

    // Then the application should be updated with the Check Your Answers section removed
    cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(1)
      const body = JSON.parse(requests[0].body)

      expect(body).to.have.keys(
        'data',
        'arrivalDate',
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
      )
      expect(body.data).not.to.have.keys(['check-your-answers'])
    })
  })

  it('does not invalidate the check your answers step if an answer is reviewed and not changed', function test() {
    // Given there is a complete application in the database
    const application = { ...this.application, status: 'started' }
    cy.task('stubApplicationGet', { application })

    // And I visit the tasklist
    ApplyPages.TaskListPage.visit(application)

    // And I click on a task
    cy.get('[data-cy-task-name="location-factors"]').click()

    // And I review a section
    const describeLocationFactorsPage = new ApplyPages.DescribeLocationFactors(this.application)
    describeLocationFactorsPage.clickSubmit()

    // Then the application should be updated with the Check Your Answers section removed
    cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(1)
      const body = JSON.parse(requests[0].body)

      expect(body).to.have.keys(
        'data',
        'arrivalDate',
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
      )
      expect(body.data).to.have.any.keys(['check-your-answers'])
    })
  })
})
