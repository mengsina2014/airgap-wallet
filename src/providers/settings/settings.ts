import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'

export enum SettingsKey {
  INTRODUCTION = 'introduction',
  WALLET = 'wallets'
}

interface IPartialAirGapWallet {
  protocolIdentifier: string
  publicKey: string
  isExtendedPublicKey: boolean
  derivationPath: string
  addresses: string[]
}

/* TS 2.7 feature
type SettingsKeyReturnType = {
  [SettingsKey.INTRODUCTION]: boolean
  [SettingsKey.WALLET]: IPartialAirGapWallet[]
}
*/

@Injectable()
export class SettingsProvider {
  constructor(private storage: Storage) {}

  /* TS 2.7 feature
  public async get<K extends SettingsKey>(key: K): Promise<SettingsKeyReturnType[K]> {
    return this.storage.get(key)
  }

  public async set<K extends SettingsKey>(key: K, value: SettingsKeyReturnType[K]): Promise<any> {
    return this.storage.set(key, value)
  }
  */

  public async get<K extends SettingsKey>(key: K): Promise<any> {
    return this.storage.get(key)
  }

  public async set<K extends SettingsKey>(key: K, value: any): Promise<any> {
    return this.storage.set(key, value)
  }

  public async getCache<T>(key: string): Promise<T> {
    return this.storage.get(key)
  }

  public async setCache<T>(key: string, value: T): Promise<T> {
    return this.storage.set(key, value)
  }
}
