/* eslint-disable import/prefer-default-export */
import type { YesOrNoWithDetail, YesOrNo } from '@approved-premises/ui'

export const applyYesOrNo = <K extends string>(key: K, body: Record<string, unknown>): YesOrNoWithDetail<K> => {
  return {
    [`${key}`]: body[`${key}`] as YesOrNo,
    [`${key}Detail`]: body[`${key}Detail`] as string,
  } as YesOrNoWithDetail<K>
}
