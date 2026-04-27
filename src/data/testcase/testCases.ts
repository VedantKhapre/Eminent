import type { ProblemTestCases } from "./types";

export const problemTestCases: ProblemTestCases[] = [
  {
    id: 1,
    public: [
      { input: "10", expected: "23" },
      { input: "5", expected: "3" },
      { input: "20", expected: "78" },
    ],
    private: [
      { input: "1000", expected: "233168" },
      { input: "100", expected: "2318" },
      { input: "15", expected: "45" },
    ],
  },
  {
    id: 2,
    public: [
      { input: "100", expected: "44" },
      { input: "10", expected: "10" },
      { input: "500", expected: "188" },
    ],
    private: [
      { input: "4000000", expected: "4613732" },
      { input: "1000", expected: "798" },
      { input: "200", expected: "188" },
    ],
  },
  {
    id: 3,
    public: [
      { input: "13195", expected: "29" },
      { input: "100", expected: "5" },
      { input: "29", expected: "29" },
    ],
    private: [
      { input: "600851475143", expected: "6857" },
      { input: "12", expected: "3" },
      { input: "1000", expected: "5" },
    ],
  },
  {
    id: 4,
    public: [{ input: "2", expected: "9009" }],
    private: [{ input: "3", expected: "906609" }],
  },
  {
    id: 5,
    public: [
      { input: "10", expected: "2520" },
      { input: "5", expected: "60" },
      { input: "7", expected: "420" },
    ],
    private: [
      { input: "20", expected: "232792560" },
      { input: "15", expected: "360360" },
      { input: "1", expected: "1" },
    ],
  },
];
