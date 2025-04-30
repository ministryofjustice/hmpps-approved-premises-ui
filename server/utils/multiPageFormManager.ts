import type { Request } from 'express'
import { MultiPageFormData } from '@approved-premises/ui'

export default class MultiPageFormManager<K extends keyof MultiPageFormData> {
  constructor(private sessionKey: K) {}

  get<T extends keyof MultiPageFormData[K]>(itemKey: T, session: Request['session']): MultiPageFormData[K][T] {
    return session.multiPageFormData?.[this.sessionKey]?.[itemKey]
  }

  update<T extends keyof MultiPageFormData[K]>(
    itemKey: T,
    session: Request['session'],
    updateData: Partial<MultiPageFormData[K][T]>,
  ): MultiPageFormData[K][T] {
    session.multiPageFormData = session.multiPageFormData || {}
    session.multiPageFormData[this.sessionKey] = session.multiPageFormData[this.sessionKey] || {}

    session.multiPageFormData[this.sessionKey][itemKey] = {
      ...this.get(itemKey, session),
      ...updateData,
    }

    return session.multiPageFormData[this.sessionKey][itemKey]
  }

  remove<T extends keyof MultiPageFormData[K]>(itemKey: T, session: Request['session']): void {
    delete session.multiPageFormData?.[this.sessionKey]?.[itemKey]
  }
}
