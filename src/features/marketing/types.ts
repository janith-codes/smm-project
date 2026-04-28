export type ServicePackage = {
  platform: string;
  name: string;
  price: string;
  delivery: string;
  tag: string;
};

export type HeroStat = {
  value: string;
  label: string;
  accentClassName: string;
};

export type WorkflowStep = {
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type OrderOption = {
  label: string;
  value: string;
};
