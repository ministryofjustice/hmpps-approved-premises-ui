import { Cas1SpaceBooking } from '@approved-premises/api'
import TaskList from '../../../taskListPage'

import { AND, GIVEN, THEN, WHEN } from '../../../../helpers'

export default class PreArrivalTasklist extends TaskList {
  constructor(private placement: Cas1SpaceBooking) {
    super('Complete Pre-arrival tasks')
  }

  shouldCompleteContactResident(id: string) {
    GIVEN('I am on the task list page and the contact resident task is not started')
    this.shouldShowTaskStatus('contact-resident', 'Not started')

    WHEN('I start the contact resident task')
    this.clickLink('Contact resident')

    THEN('I should be on the task page')
    cy.get('h1').contains('Pre-arrival contact')

    WHEN('I save the empty form')
    this.clickButton('Save and continue')

    THEN('I should see error messages')
    this.shouldShowErrorMessagesForFields(['contactDate', 'contactMethod'], {
      contactDate: 'You must enter a contact date',
      contactMethod: 'You must enter a contact method',
    })

    WHEN('I complete the date and method, and submit')
    this.completeDatePicker('contactDate', '2026-03-20')
    this.checkRadioByLabel('I could not contact them')
    this.clickButton('Save and continue')

    THEN('I should see an error for missing reason')
    this.shouldShowErrorMessagesForFields(['reasonForNoContact'], {
      reasonForNoContact: 'You must enter a reason for not making contact',
    })

    WHEN('I complete the reason box and submit')
    this.completeTextArea('reasonForNoContact', 'Some reason for not making contact')
    this.clickButton('Save and continue')
    cy.task('stubFormDataFromLastUpdate', { id })
    cy.reload()

    THEN('I should be back on the tasklist')
    this.checkOnPage()
    this.shouldShowTaskStatus('contact-resident', 'Completed')

    WHEN('I go back into the task page')
    this.clickLink('Contact resident')
    this.verifyTextInputContentsById('reasonForNoContact', 'Some reason for not making contact')
    this.clickBack()
    this.checkOnPage()
  }

  shouldCompleteRinkInformation(id: string) {
    GIVEN('I am on the task list page and the risk information task is not started')
    this.shouldShowTaskStatus('risk-information', 'Not started')

    WHEN('I start the risk information task')
    this.clickLink('Risk information')

    THEN('I should be on the risk to staff page')
    cy.get('h1').contains('Risk to staff')

    WHEN('I save the empty form')
    this.clickButton('Save and continue')

    THEN('I should see an error for missing data')
    this.shouldShowErrorMessagesForFields(['riskToStaffSummary'], {
      riskToStaffSummary: 'You must enter a summary of the risk to staff',
    })

    WHEN('I complete the form and submit')
    this.completeTextArea('riskToStaffSummary', 'Some risk to staff')
    this.clickButton('Save and continue')
    cy.task('stubFormDataFromLastUpdate', { id })
    cy.reload()

    THEN('I should be on the risk to residents page')
    cy.get('h1').contains('Risk to other residents')

    WHEN('I click back twice')
    this.clickBack()
    this.clickBack()

    THEN('I should be back on the tasklist and the state of this task should be in-progress')
    this.checkOnPage()
    this.shouldShowTaskStatus('risk-information', 'In progress')

    WHEN('I go back to the risk to residents page and save the empty form')
    this.clickLink('Risk information')
    this.clickButton('Save and continue')
    this.clickButton('Save and continue')

    THEN('I should see an error for missing data')
    this.shouldShowErrorMessagesForFields(['riskToResidentsSummary'], {
      riskToResidentsSummary: 'You must enter a summary of the risk to other residents',
    })

    WHEN('I complete the form and submit')
    this.completeTextArea('riskToResidentsSummary', 'Some risk to residents')
    this.clickButton('Save and continue')
    cy.task('stubFormDataFromLastUpdate', { id })
    cy.reload()

    THEN('I am back on the task list page')
    this.checkOnPage()
    this.shouldShowTaskStatus('risk-information', 'Completed')
  }

  shouldUseSaveAndExit(id: string) {
    GIVEN('The task is complete')
    this.shouldShowTaskStatus('risk-information', 'Complete')
    AND('I go to the first risk information page')
    this.clickLink('Risk information')
    AND('I clear the text area')
    this.completeTextArea('riskToStaffSummary', '')

    WHEN('I try to submit the page')
    this.clickButton('Save and continue')

    THEN('I see an error')
    this.shouldShowErrorMessagesForFields(['riskToStaffSummary'], {
      riskToStaffSummary: 'You must enter a summary of the risk to staff',
    })

    WHEN('I click save and exit')
    this.clickButton('Save and exit')
    cy.task('stubFormDataFromLastUpdate', { id })
    cy.reload()

    THEN('I am back on the tasklist')
    this.checkOnPage()
    AND('The task is back to in-progress')
    this.shouldShowTaskStatus('risk-information', 'In progress')
  }
}
