import { createTag } from './statusTag'

describe('statusTag', () => {
  describe('createTag', () => {
    const statuses = {
      assesmentInProgress: 'foo',
    }
    const colours = {
      assesmentInProgress: 'bar',
    }

    it.each([
      { option: 'addLeftMargin', cssClass: 'govuk-!-margin-5' },
      { option: 'showOnOneLine', cssClass: 'govuk-tag--timeline-tag' },
      { option: 'taskListTag', cssClass: 'app-task-list__tag' },
    ])(`when passed %s option it adds the %s class`, ({ option, cssClass }) => {
      expect(createTag('assesmentInProgress', statuses, colours, { [option]: true })).toBe(
        `<strong class="govuk-tag govuk-tag--bar ${cssClass} " data-cy-status="assesmentInProgress" >foo</strong>`,
      )
    })

    it('adds an id when passed one', () => {
      expect(createTag('assesmentInProgress', statuses, colours, { id: 'foo' })).toBe(
        `<strong class="govuk-tag govuk-tag--bar " data-cy-status="assesmentInProgress" id="foo-status">foo</strong>`,
      )
    })

    it('doesnt add a colour if no "colours" are passed', () => {
      expect(createTag('assesmentInProgress', statuses, undefined)).toBe(
        `<strong class="govuk-tag " data-cy-status="assesmentInProgress" >foo</strong>`,
      )
    })
  })
})
