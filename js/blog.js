class BlogManager {
  constructor() {
    this.postsMetadata = null;
    this.currentPost = null;
    this.blogContent = document.getElementById("blog-content");
    this.mdxParser = new MDXParser();
  }

  async initialize() {
    // Load posts metadata
    await this.loadPostsMetadata();

    // Check if we're viewing a specific post
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("post");

    if (postId) {
      await this.loadPost(postId);
    } else {
      this.renderPostsList();
    }
  }

  async loadPostsMetadata() {
    try {
      const response = await fetch("/blog/metadata/posts.json");
      const data = await response.json();
      this.postsMetadata = data;
    } catch (error) {
      console.error("Error loading posts metadata:", error);
      this.blogContent.innerHTML = "<p>Error loading blog posts.</p>";
    }
  }

  async loadPost(postId) {
    try {
      const response = await fetch(`/blog/posts/${postId}.mdx`);
      if (!response.ok) throw new Error("Post not found");

      const mdxContent = await response.text();
      const post = this.postsMetadata.posts.find((p) => p.id === postId);

      if (!post) throw new Error("Post metadata not found");

      await this.renderPost(post, mdxContent);
    } catch (error) {
      console.error("Error loading post:", error);
      this.blogContent.innerHTML = "<p>Error loading blog post.</p>";
    }
  }

  async renderPost(post, mdxContent) {
    try {
      const { content, frontmatter } = await this.mdxParser.parse(mdxContent);

      const header = `
        <header class="blog-post-header">
          <h1>${frontmatter.title || post.title}</h1>
          <time datetime="${post.date}">${new Date(
        post.date
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</time>
          <div class="tags">
            ${post.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join("")}
          </div>
        </header>
      `;

      this.blogContent.innerHTML = `
        <article class="blog-post">
          ${header}
          <div class="blog-post-content">
            ${content}
          </div>
        </article>
      `;

      // Initialize syntax highlighting
      Prism.highlightAll();
    } catch (error) {
      console.error("Error rendering post:", error);
      this.blogContent.innerHTML = "<p>Error rendering blog post.</p>";
    }
  }

  renderPostsList() {
    const postsHTML = this.postsMetadata.posts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(
        (post) => `
        <article class="blog-post-preview">
          <a href="?post=${post.id}" class="blog-post-link">
            <h2>${post.title}</h2>
            <time datetime="${post.date}">${new Date(
          post.date
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</time>
            <p>${post.summary}</p>
            <div class="tags">
              ${post.tags
                .map((tag) => `<span class="tag">${tag}</span>`)
                .join("")}
            </div>
          </a>
        </article>
      `
      )
      .join("");

    this.blogContent.innerHTML = `
      <h1>Blog Posts</h1>
      <div class="blog-posts-grid">
        ${postsHTML}
      </div>
    `;
  }
}

// Initialize blog
document.addEventListener("DOMContentLoaded", () => {
  const blog = new BlogManager();
  blog.initialize();
});
