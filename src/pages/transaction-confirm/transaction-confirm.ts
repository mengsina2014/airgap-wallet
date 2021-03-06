import { Component } from '@angular/core'
import { LoadingController, NavController, NavParams, ToastController, AlertController, Platform } from 'ionic-angular'

import { getProtocolByIdentifier, IAirGapTransaction, DeserializedSyncProtocol, SignedTransaction, ICoinProtocol } from 'airgap-coin-lib'

declare var cordova: any

@Component({
  selector: 'page-transaction-confirm',
  templateUrl: 'transaction-confirm.html'
})
export class TransactionConfirmPage {
  public signedTx: string
  public airGapTx: IAirGapTransaction
  public protocol: ICoinProtocol

  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public navController: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {}

  dismiss() {
    this.navController.popToRoot()
  }

  async ionViewWillEnter() {
    await this.platform.ready()
    const signedTransactionSync: DeserializedSyncProtocol = this.navParams.get('signedTransactionSync')
    this.signedTx = (signedTransactionSync.payload as SignedTransaction).transaction
    this.protocol = getProtocolByIdentifier(signedTransactionSync.protocol)
    this.airGapTx = this.protocol.getTransactionDetailsFromSigned(this.navParams.get('signedTransactionSync').payload)
  }

  broadcastTransaction() {
    let loading = this.loadingCtrl.create({
      content: 'Broadcasting...'
    })

    loading.present()

    let blockexplorer = '' // TODO: Move to coinlib
    if (this.protocol.identifier === 'btc') {
      blockexplorer = 'https://live.blockcypher.com/btc/tx/{{txId}}/'
    } else if (this.protocol.identifier === 'eth') {
      blockexplorer = 'https://etherscan.io/tx/{{txId}}'
    } else if (this.protocol.identifier === 'eth-erc20-ae') {
      blockexplorer = 'https://etherscan.io/tx/{{txId}}'
    } else if (this.protocol.identifier === 'ae') {
      blockexplorer = 'https://explorer.aepps.com/#/tx/{{txId}}'
    }

    let interval = setTimeout(() => {
      loading.dismiss()
      let toast = this.toastCtrl.create({
        duration: 3000,
        message: 'Transaction queued. It might take some time until your TX shows up!',
        showCloseButton: true,
        position: 'bottom'
      })
      toast.present()
      this.navController.popToRoot()
    }, 20 * 1000)

    this.protocol
      .broadcastTransaction(this.signedTx)
      .then(txId => {
        if (interval) {
          clearInterval(interval)
        }
        loading.dismiss()
        let alert = this.alertCtrl.create({
          title: 'Transaction broadcasted!',
          message: 'Your transaction has been successfully broadcasted',
          buttons: [
            {
              text: 'Open Blockexplorer',
              handler: () => {
                if (blockexplorer) {
                  this.openUrl(blockexplorer.replace('{{txId}}', txId))
                } else {
                  let toast = this.toastCtrl.create({
                    duration: 3000,
                    message: 'Unable to open blockexplorer',
                    showCloseButton: true,
                    position: 'bottom'
                  })
                  toast.present()
                }
                this.navController.popToRoot()
              }
            },
            {
              text: 'Ok',
              handler: () => {
                this.navController.popToRoot()
              }
            }
          ]
        })
        alert.present()
      })
      .catch(e => {
        if (interval) {
          clearInterval(interval)
        }
        loading.dismiss()
        console.warn(e)
        let toast = this.toastCtrl.create({
          duration: 5000,
          message: 'Transaction broadcasting failed: ' + e,
          showCloseButton: true,
          position: 'bottom'
        })
        toast.present()
        this.navController.popToRoot()
      })
  }

  private openUrl(url: string) {
    if (this.platform.is('ios') || this.platform.is('android')) {
      cordova.InAppBrowser.open(url, '_system', 'location=true')
    } else {
      window.open(url, '_blank')
    }
  }
}
