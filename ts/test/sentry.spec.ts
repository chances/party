// tslint:disable-next-line:no-implicit-dependencies
import Proxyquire from "proxyquire";
import { test } from "./lib/expect";

// TODO: Follow this tutorial: https://ponyfoo.com/articles/testing-javascript-modules-with-tape

const proxyquire = Proxyquire.noPreserveCache();

// tslint:disable-next-line:no-unused-expression no-angle-bracket-type-assertion
proxyquire("@sentry/browser", {
  config: (_dsnUrl: string) => {
    return {
      install: () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        return {
          VERSION: "mock",
          setContext: (_context: any) => { return; },
          captureException: (_err: Error) => { return; },
          setUser: (_context?: any) => { return; },
          addBreadcrumb: (_crumb: any) => { return; },
        } as any;
      },
    };
  },
});

test("can call captureBreadcrumb in development", () => {
  const { captureBreadcrumb } = require("../sentry");
  captureBreadcrumb("test");
});

test("can call captureBreadcrumb in production", () => {
  const { captureBreadcrumb } = require("../sentry");
  process.env.NODE_ENV = "production";
  captureBreadcrumb("test");

  process.env.NODE_ENV = "development";
});
