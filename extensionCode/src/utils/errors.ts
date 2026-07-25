export class ValidationHttpError extends Error {
  public readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationHttpError";
  }
}

export class EtlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EtlError";
  }
}
