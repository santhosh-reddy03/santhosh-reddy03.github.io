module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        {
          loader: "@mdx-js/loader",
          options: {
            providerImportSource: "@mdx-js/react",
          },
        },
      ],
    });
    return config;
  },
  pageExtensions: ["js", "jsx", "md", "mdx"],
};
