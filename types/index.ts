export type ProjectStatus = "DRAFT" | "PUBLISHED";

export type AdditionalLink = {
  label: string;
  url: string;
};

export type ProjectTheme = "default" | "minimal" | "dark" | "editorial" | "tech";
export type CardStyle = "default" | "minimal" | "bordered";
export type ImageAspect = "16/9" | "4/3" | "1/1";
export type DescriptionLength = "short" | "medium" | "full";
export type FeaturedLayout = "standard" | "wide";

export type Project = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  websiteUrl: string;
  githubUrl: string | null;
  category: string;
  technologies: string[];
  additionalLinks: AdditionalLink[];
  status: ProjectStatus;
  featured: boolean;
  sortOrder: number;
  theme: ProjectTheme;
  accentColor: string;
  cardStyle: CardStyle;
  imageAspect: ImageAspect;
  showTechnologies: boolean;
  showCategory: boolean;
  showGithub: boolean;
  showWebsiteButton: boolean;
  descriptionLength: DescriptionLength;
  featuredLayout: FeaturedLayout;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectFormState = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  githubUrl: string;
  category: string;
  technologies: string[];
  additionalLinks: AdditionalLink[];
  status: ProjectStatus;
  featured: boolean;
  sortOrder: number;
  theme: ProjectTheme;
  accentColor: string;
  cardStyle: CardStyle;
  imageAspect: ImageAspect;
  showTechnologies: boolean;
  showCategory: boolean;
  showGithub: boolean;
  showWebsiteButton: boolean;
  descriptionLength: DescriptionLength;
  featuredLayout: FeaturedLayout;
};

export const emptyProjectForm: ProjectFormState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  imageUrl: "",
  websiteUrl: "",
  githubUrl: "",
  category: "تطبيق ويب",
  technologies: [],
  additionalLinks: [],
  status: "DRAFT",
  featured: false,
  sortOrder: 0,
  theme: "default",
  accentColor: "#2563eb",
  cardStyle: "default",
  imageAspect: "16/9",
  showTechnologies: true,
  showCategory: true,
  showGithub: true,
  showWebsiteButton: true,
  descriptionLength: "short",
  featuredLayout: "standard",
};
