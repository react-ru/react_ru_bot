import { Notification } from "../Notification"

export type SpamDeletedOptions = {
  author: {
    first_name: string;
    last_name?: string;
    username?: string;
  },
  text: string
}

export class SpamDeleted extends Notification<SpamDeletedOptions> {}
