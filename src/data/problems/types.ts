export type ProblemImage = {
  src: string;
  alt: string;
};

export type ProblemDescription = string | ProblemImage;

export interface Problems {
  id: number;
  name: string;
  description: ProblemDescription[];
}
