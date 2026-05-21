import { expect, skip, test, that } from "./lib/expect";

import { Maybe } from "monet";
import { Options, searchTracks, updateAccessToken } from "../spotify";

test("searchTracks fails when access token is nothing", () => {
  return searchTracks("Sugar Ray", Maybe.Nothing<Options>())
    .then(eitherResultsOrErr => {
      expect(that(eitherResultsOrErr.isLeft()).is.true);
      expect(that(eitherResultsOrErr.left().error).equals("invalid_token"));
    });
});

test("searchTracks fails when access token is set to nothing", () => {
  updateAccessToken(Maybe.Nothing<string>());

  return searchTracks("Sugar Ray", Maybe.Nothing<Options>())
    .then(eitherResultsOrErr => {
      expect(that(eitherResultsOrErr.isLeft()).is.true);
      expect(that(eitherResultsOrErr.left().error).equals("invalid_token"));
    });
});

skip("searchTracks fails when access token is bad", () => {
  updateAccessToken(Maybe.Just("bad"));

  return searchTracks("Sugar Ray", Maybe.Nothing<Options>())
    .then(eitherResultsOrErr => {
      expect(that(eitherResultsOrErr.isLeft()).is.true);
      expect(that(eitherResultsOrErr.left().error).equals("invalid_token"));
    });
});
