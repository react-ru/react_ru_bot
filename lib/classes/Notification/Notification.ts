export abstract class Notification<O extends {} = any> {
  constructor(protected options?: O) {}
}
