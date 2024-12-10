export type Totem = {
  id: number;
  tgUserId: number;
  createdAt: number;
};

export type BlackMark = {
  id: number
  tgUserId: number
  assignedTimes: number
  createdAt: number
  updatedAt: number | null
}

export type BanCandidate = {
  id: number
  tgUserId: number
  username: string | null
  firstName: string | null
  lastName: string | null
  languageCode: string | null
  isPremium: boolean | null
  link: string | null
  createdAt: number
}

export type Example = {
  id: number
  tgUserId: number
  messageId: number
  username: string | null
  firstName: string | null
  lastName: string | null
  languageCode: string | null
  isPremium: boolean | null
  link: string | null
  text: string
  classifier: 'fast-classifier' | 'titorelli' | 'black-mark' | 'totem' | null
  label: 'spam' | 'ham' | null
  confidence: number | null
  createdAt: number
}
