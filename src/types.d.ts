// TODO: generate better types and submit a PR
declare module 'gatsby' {
  export const graphql: any;
  export const Link: any;
  export const StaticQuery: any;
}

declare module '*.gql' {
  const query: any;
  export = query;
}
