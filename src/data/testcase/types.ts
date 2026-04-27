export interface TestCase {
  input: string;
  expected: string;
}

export interface ProblemTestCases {
  id: number;
  public: TestCase[];
  private: TestCase[];
}
