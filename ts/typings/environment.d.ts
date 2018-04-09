declare namespace NodeJs {
  export interface Process {
    env: {
      [varName: string]: string,
      'NODE_ENV': 'development' | 'production',
      'PARTY_API': string,
    };
  }
}
