import { Component } from '@angular/core'
import { AlertController, NavParams, ViewController, ToastController } from 'ionic-angular'
import { AirGapMarketWallet } from 'airgap-coin-lib'
import { WalletsProvider } from '../../providers/wallets/wallets.provider'
import { Clipboard } from '@ionic-native/clipboard'

@Component({
  template: `
    <ion-list no-lines no-detail>
      <ion-list-header>{{ 'wallet-edit-popover-component.settings_label' | translate }}</ion-list-header>
      <button ion-item detail-none (click)="copyAddressToClipboard()">
        <ion-icon name="clipboard" color="dark" item-end></ion-icon>
        {{ 'wallet-edit-popover-component.copy-address_label' | translate }}
      </button>
      <button ion-item detail-none (click)="delete()">
        <ion-icon name="trash" color="dark" item-end></ion-icon>
        {{ 'wallet-edit-popover-component.delete_label' | translate }}
      </button>
    </ion-list>
  `
})
export class WalletEditPopoverComponent {
  private wallet: AirGapMarketWallet
  private onDelete: Function

  constructor(
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private walletsProvider: WalletsProvider,
    private viewCtrl: ViewController,
    private clipboard: Clipboard,
    private toastController: ToastController
  ) {
    this.wallet = this.navParams.get('wallet')
    this.onDelete = this.navParams.get('onDelete')
  }

  async copyAddressToClipboard() {
    await this.clipboard.copy(this.wallet.receivingPublicAddress)
    let toast = this.toastController.create({
      message: 'Address was copied to your clipboard',
      duration: 2000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Ok'
    })
    await toast.present()
    await this.viewCtrl.dismiss()
  }

  delete() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Wallet Removal',
      message: 'Do you want to remove this wallet? You can always sync it again from your vault.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.viewCtrl.dismiss()
          }
        },
        {
          text: 'Delete',
          handler: () => {
            alert.present()
            this.walletsProvider.removeWallet(this.wallet).then(() => {
              this.viewCtrl.dismiss()
              if (this.onDelete) {
                this.onDelete()
              }
            })
          }
        }
      ]
    })
    alert.present()
  }
}
