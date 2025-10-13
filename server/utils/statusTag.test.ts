import { createTag } from './statusTag'

describe('statusTag', () => {
  describe('createTag', () => {
    const statuses = {
      assesmentInProgress: 'foo',
    }
    const colours = {
      assesmentInProgress: 'bar',
    }

    it('adds classes when specified', () => {
      expect(createTag('assesmentInProgress', statuses, colours, { classes: 'some classes' })).toBe(
        `<strong class="govuk-tag govuk-tag--bar some classes" data-cy-status="assesmentInProgress" >foo</strong>`,
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
