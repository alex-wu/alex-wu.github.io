import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Alex Wu",
  DESCRIPTION: "Portfolio and writing.",
  EMAIL: "alex.w.w.h@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Alex Wu's portfolio.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "Notes and writeups.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "Selected projects with links to repos and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/alex-wu",
  },
];
