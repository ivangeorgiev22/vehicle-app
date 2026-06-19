export type Params = {
  //components don't require params which is why we use undefined
  Login: undefined;
  Home: undefined;
  Jobs: undefined;
  'Job Details': { id: string };
  Profile: {id: string};
}