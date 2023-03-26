import * as Http from "http";
import { ExcaliCustomError } from "./handle";
import { Core } from "../core/index";

export const manageError = (
  res: Http.ServerResponse,
  err: ExcaliCustomError | Error | string
): boolean => {
  const core = new Core();

  if (typeof err === "string") {
    core.sendResponse(res, 500, err);
    return true;
  }

  const code = Object.keys(err).includes("code")
    ? (err as ExcaliCustomError).code
    : 500;
  core.sendResponse(res, code, err.message);
  return true;
};
