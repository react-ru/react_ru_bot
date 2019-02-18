import { Message } from '../../../classes/Message'

export type EnsureSpamMessageProps = {
  text: string,
  spamCallbackData: string,
  hamCallbackData: string,
}

export class EnsureSpamMessage extends Message<EnsureSpamMessageProps> {
  keyboard() {
    return [
      [
        {
          text: 'Да, это спам',
          callback_data: this.getProps()!.spamCallbackData
        },
        {
          text: 'Нет, это не спам',
          callback_data: this.getProps()!.hamCallbackData
        }
      ]
    ]
  }

  text() {
    return 'Это спам?'
  }
}
