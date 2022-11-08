import type { User } from 'telegraf/types'

export type CallbackDataJSON = {
  orig_message_id: number,
  orig_message_text: string,
  orig_message_from: User,
  text_label: 'spam' | 'ham',
  ensure_spam_message_id?: number
}
