export abstract class Model<P> {
  abstract ready: Promise<void>

  abstract predict(): Promise<P>
}
