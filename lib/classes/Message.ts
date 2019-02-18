// import type { Telegraf } from "telegraf"
import type { InlineKeyboardButton } from "telegraf/types"

export abstract class Message<P extends {}> {
  private _props?: P

  constructor(props?: P) {
    this._props = props
  }

  // abstract onCallback?(data?: string): void

  abstract keyboard?(props?: P): object

  abstract text(props?: P): string

  getProps() {
    return this._props
  }

  hasText() {
    return typeof this.text === 'function'
  }

  // hasCallback() {
  //   return typeof this.onCallback === 'function'
  // }

  hasKeyboard() {
    return typeof this.keyboard === 'function'
  }

  hasExtra() {
    // if (this.hasCallback()) return true
    if (this.hasKeyboard()) return true

    return false
  }

  getExtra() {
    if (this.hasKeyboard()) {
      return {
        reply_markup: {
          inline_keyboard: <InlineKeyboardButton[][]>this.keyboard!(this.getProps()),
        }
      }
    }
  }

  // addCallbackHandler(chatId: number, bot: Telegraf) {
  //   if (this.hasCallback()) {
  //     bot.on('callback_query', (update) => {
  //       if (
  //         update.callbackQuery.message != null
  //         && update.callbackQuery.message.chat.id === chatId
  //         && update.update.update_id
  //       ) {
  //         this.onCallback!(update.callbackQuery.data)
  //       }
  //     })
  //   }
  // }

  toReplyArgs(): readonly [string, object] | readonly [string] | readonly [] {
    const text = this.hasText() ? this.text() : null
    const extra = this.hasExtra() ? this.getExtra() : null

    if (text && extra) {
      return [text, extra]
    } else if (text) {
      return [text]
    } else {
      return []
    }
  }
}
