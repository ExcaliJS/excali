export class ExcaliCustomError extends Error {
  public code: number;
  public data: string | unknown[] | Record<string, unknown>;
  constructor(
    code: number,
    message: string,
    data: string | unknown[] | Record<string, unknown> = ""
  ) {
    super(message);
    this.code = code;
    this.data = data;
  }

  static BadRequest = (message: string, data = ""): ExcaliCustomError => {
    return new ExcaliCustomError(400, message, data);
  };

  static NotAuthentified = (message: string, data = ""): ExcaliCustomError => {
    return new ExcaliCustomError(401, message, data);
  };

  static Forbidden = (message: string, data = ""): ExcaliCustomError => {
    return new ExcaliCustomError(403, message, data);
  };

  static NotFound = (message: string, data = ""): ExcaliCustomError => {
    return new ExcaliCustomError(404, message, data);
  };

  static ServerError = (message: string, data = ""): ExcaliCustomError => {
    return new ExcaliCustomError(500, message, data);
  };
}
