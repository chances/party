declare const process: {
  env: {
    [varName: string]: string,
    'NODE_ENV': 'development' | 'production',
    'PARTY_API': string,
  };
}
