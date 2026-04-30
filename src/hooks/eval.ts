export type TestResult = {
  testNumber: number;
  passed: boolean;
  isPrivate: boolean;
  input: string;
  expected: string;
  output: string;
};

export type EvalResponse = {
  passedCount: number;
  total: number;
  results: TestResult[];
};