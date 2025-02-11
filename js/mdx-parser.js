class MDXParser {
  constructor() {
    this.marked = window.marked;
    this.setupMarked();
  }

  setupMarked() {
    // Configure marked options
    this.marked.setOptions({
      highlight: function (code, lang) {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      },
    });
  }

  async parse(mdxContent) {
    try {
      // Extract frontmatter
      const frontmatter = this.extractFrontmatter(mdxContent);

      // Remove frontmatter from content
      const content = mdxContent.replace(/---[\s\S]*?---/, "").trim();

      // Convert markdown to HTML
      const htmlContent = this.marked.parse(content);

      return {
        frontmatter,
        content: htmlContent,
      };
    } catch (error) {
      console.error("Error parsing MDX:", error);
      throw error;
    }
  }

  extractFrontmatter(mdxContent) {
    const frontmatterRegex = /---\n([\s\S]*?)\n---/;
    const match = mdxContent.match(frontmatterRegex);

    if (!match) return {};

    const frontmatter = {};
    const lines = match[1].split("\n");

    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        const value = valueParts.join(":").trim();
        frontmatter[key.trim()] = value;
      }
    });

    return frontmatter;
  }
}

// Make parser available globally
window.MDXParser = MDXParser;
