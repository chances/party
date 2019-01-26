interface TestingWindow {
  location: {
    search: string
  }
}

declare module NodeJS  {
  interface Global {
      window: TestingWindow
  }
}
