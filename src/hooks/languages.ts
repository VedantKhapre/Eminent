export type CodeLanguage = {
  id: string;
  label: string;
  language: string;
  version: string;
};

export const CODE_LANGUAGES: CodeLanguage[] = [
  { id: "javascript-18", label: "JavaScript (Node.js 18)", language: "javascript", version: "18.15.0" },
  { id: "typescript-5",  label: "TypeScript 5",            language: "typescript", version: "5.0.3"   },
  { id: "python-3-10",   label: "Python 3.10",             language: "python",     version: "3.10.0"  },
  { id: "cpp-10",        label: "C++ 10.2",                language: "c++",        version: "10.2.0"  },
  { id: "c-10",          label: "C 10.2",                  language: "c",          version: "10.2.0"  },
  { id: "java-15",       label: "Java 15",                 language: "java",       version: "15.0.2"  },
  { id: "rust-1-50",     label: "Rust 1.50",               language: "rust",       version: "1.50.0"  },
];

export const DEFAULT_CODE: Record<string, string> = {
  javascript: `console.log("Hello, World!")`,
  typescript: `console.log("Hello, World!")`,
  python:     `print("Hello, World!")`,
  "c++":      `#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n}`,
  c:          `#include <stdio.h>\nint main() {\n  printf("Hello, World!\\n");\n}`,
  java:       `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
  rust:       `fn main() {\n  println!("Hello, World!");\n}`,
};