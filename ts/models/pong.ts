import { get, ResponsePromise } from "../../supabase/api";

// tslint:disable-next-line:no-empty-interface
export interface Pong {}

export function getPing(): ResponsePromise<Pong> {
  return get<Pong>("party/ping");
}
