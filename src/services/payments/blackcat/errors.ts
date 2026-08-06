export class BlackCatError extends Error {
  override name = "BlackCatError";
}

export class BlackCatConfigurationError extends BlackCatError {
  override name = "BlackCatConfigurationError";
}

export class BlackCatTimeoutError extends BlackCatError {
  override name = "BlackCatTimeoutError";
}

export class BlackCatBusinessError extends BlackCatError {
  override name = "BlackCatBusinessError";

  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
  }
}

export class BlackCatHttpError extends BlackCatError {
  override name = "BlackCatHttpError";

  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: string
  ) {
    super(message);
  }
}

export class BlackCatResponseValidationError extends BlackCatError {
  override name = "BlackCatResponseValidationError";
}
