import { create } from "@most/create";
import { Stream } from "most";

import { captureException } from "../sentry";
import * as util from "../lib/util";
import { getPartyApiHost } from "./request";

enum ReadyState {

  /**
   * The connection has not yet been established, or it was closed and the user agent is
   * reconnecting.
   */
  CONNECTING = 0,

  /**
   * The user agent has an open connection and is dispatching events as it receives them.
   */
  OPEN = 1,

  /**
   * The connection is not open, and the user agent is not trying to reconnect. Either there
   * was a fatal error or the close() method was invoked.
   */
  CLOSED = 2,
}

interface EventStream {
  name: string;
  isClosed: boolean;
  messages: Stream<any>;
  open(): Promise<void>;
  close(err: any): Promise<void>;
  on(eventName: string): Stream<any>;
}

interface MessageEvent<T> {
  data: T;
  source: EventStream;
}

interface Connection {
  new (url: string): Connection;
  state: ReadyState;
  start(): Promise<void>;
  stream<T>(eventName: string): Stream<T>;
  stop(): Promise<void>;
  onClose(callback: (err: any | undefined) => void): void;
}

export default class Source<T> implements EventStream {
  private connection: Connection;
  private readyState = ReadyState.CLOSED;

  constructor(urlOrExistingSource: string | Source<any>, private hubMethodName: string) {
    // Convert hub method name to Pascal Case
    this.hubMethodName = `${hubMethodName[0].toLocaleUpperCase()}${hubMethodName.substring(1)}`;

    if (typeof urlOrExistingSource === "string") {
      const eventSourceUrl = `${getPartyApiHost()}${urlOrExistingSource}`;
      console.assert((eventSourceUrl?.length ?? 0) > 0, "eventSourceUrl is empty");
      throw new Error("Unimplemented!");
      this.connection.start();
    } else {
      this.connection = urlOrExistingSource.connection;
    }

    this.connection.onClose((err: any) => {
      if (err) {
        const eventName = this.hubMethodName;
        captureException(err, { message: `${eventName} stream closed` });
      }
      this.readyState = ReadyState.CLOSED;
    });
  }

  get name() {
    return this.hubMethodName;
  }

  get isClosed() {
    return this.readyState === ReadyState.CLOSED;
  }

  get messages() {
    return this.on(this.hubMethodName);
  }

  open() {
    if (this.readyState === ReadyState.CLOSED) {
      this.readyState = ReadyState.CONNECTING;

      const connected = this.connection.start().then(() => {
        const isConnected = this.connection.state === ReadyState.OPEN;
        this.readyState = isConnected ? ReadyState.OPEN : ReadyState.CLOSED;
        if (!isConnected) {
          throw new Error("EventStream connection failed.");
        }
      });

      return Promise.resolve(connected);
    }

    return Promise.resolve();
  }

  on(eventName: string = this.hubMethodName) {
    return create<MessageEvent<T>>((add, end, error) => {
      const addEvent = (value: T, isClosed: boolean) => {
        if (!isClosed || this.readyState !== ReadyState.CLOSED) {
          util.log(`Received message on ${eventName} stream: `, value);
          add({
            data: value,
            source: this,
          });
        } else {
          end();
        }
      };
      const addError = (_: any) => error(new Error("EventStream stream failed."));

      const stream = this.connection.stream<T>(eventName);
      const observer = {
        closed: false,
        next: (value: T) => addEvent(value, observer.closed),
        error: addError,
        complete: (value?: T | undefined) => end(value ? { data: value, source: this } : undefined),
      };
      const subscription = stream.subscribe(observer);

      return () => {
        console.assert(subscription != null);
        // FIXME: subscription.dispose();
        if (!observer.closed) end();
      };
    });
  }

  close() {
    return Promise.resolve(this.connection.stop());
  }
}
