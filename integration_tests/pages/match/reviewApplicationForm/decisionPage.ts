import Page from '../../page'

export default class ReviewApplicationDecisionPage extends Page {
  constructor() {
    super('Make a decision')
  }

  completeForm() {
    this.checkRadioByNameAndValue('decision', 'accepted')
    this.getTextInputByIdAndEnterDetails('decisionSummary', 'some summary notes')
  }

  completeDuration() {
    this.getTextInputByIdAndEnterDetails('durationWeeks', '2')
    this.getTextInputByIdAndEnterDetails('durationDays', '3')
  }

  checkErrors() {
    this.shouldShowErrorMessagesForFields(['decision', 'decisionSummary'], {
      decision: 'You must provide a decision',
      decisionSummary: 'You must provide a decision summary',
    })
  }

  checkDurationError() {
    this.shouldShowErrorMessagesForFields(['duration'], {
      duration: 'Enter the recommended placement length',
    })
  }
}
