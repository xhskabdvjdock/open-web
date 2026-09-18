import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/projects"],
        // Hidden admin area: never indexed
        disallow: ["/addweb", "/api/"],
      },
    ],
  };
}
