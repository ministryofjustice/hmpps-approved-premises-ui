import { getActionsForTaskId } from './getActionsForTaskId'
import paths from '../../paths/assess'

describe('getActionsForTaskId', () => {
  const id = 'id'
  it('returns an empty item if the task id isnt oasys-import or prison-information', () => {
    expect(getActionsForTaskId('foo', id)).toEqual({ items: [] })
  })

  it('returns the correct tasks if supplied a task id of oasys-import', () => {
    expect(getActionsForTaskId('oasys-import', id)).toEqual({
      items: [
        {
          href: paths.assessments.supportingInformationPath({
            id,
            category: 'risk-information',
          }),
          text: 'View detailed risk information',
        },
      ],
    })
  })

  it('returns the correct html if supplied a task id of prison-information', () => {
    expect(getActionsForTaskId('prison-information', id)).toEqual({
      items: [
        {
          href: paths.assessments.supportingInformationPath({
            id,
            category: 'prison-information',
          }),
          text: 'View additional prison information',
        },
      ],
    })
  })
})
