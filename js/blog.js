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
document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM loaded, starting blog script");

  const blogContent = document.getElementById("blog-content");
  if (!blogContent) {
    console.error("Blog content element not found");
    return;
  }

  console.log("Blog content element found");

  // Wait a moment to ensure Firebase is fully initialized
  setTimeout(async () => {
    try {
      // Get post ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get("post");

      console.log("Post ID from URL:", postId);

      // Check if Firebase is initialized
      if (!window.firebaseDb) {
        console.error("Firebase DB not found in window object");
        blogContent.innerHTML =
          "<p>Error: Firebase not initialized properly. Check console for details.</p>";
        return;
      }

      const db = window.firebaseDb;
      const { collection, query, orderBy, getDocs, doc, getDoc } =
        window.firebaseModules;

      if (!collection || !query || !orderBy || !getDocs || !doc || !getDoc) {
        console.error(
          "Firebase modules not properly imported",
          window.firebaseModules
        );
        blogContent.innerHTML =
          "<p>Error: Firebase modules not properly imported. Check console for details.</p>";
        return;
      }

      console.log("Firebase initialized properly");

      if (postId) {
        // Load specific post
        try {
          console.log("Fetching post with ID:", postId);
          const docRef = doc(db, "blogs", postId);
          const docSnap = await getDoc(docRef);

          console.log("Document exists:", docSnap.exists());

          if (docSnap.exists()) {
            const post = docSnap.data();
            console.log("Post data:", post);

            // Handle date formatting
            let postDate;
            try {
              postDate = new Date(
                post.date.toMillis ? post.date.toMillis() : post.date
              );
              console.log("Formatted date:", postDate);
            } catch (dateError) {
              console.error("Error formatting date:", dateError);
              postDate = new Date(); // Fallback to current date
            }

            // Create post HTML
            const postHTML = `
              <article class="blog-post-content">
                <h1>${post.title || "Untitled Post"}</h1>
                <time datetime="${postDate.toISOString()}">${postDate.toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}</time>
                <div class="tags">
                  ${
                    post.tags
                      ? post.tags
                          .map((tag) => `<span class="tag">${tag}</span>`)
                          .join("")
                      : ""
                  }
                </div>
                <div class="content">
                  ${post.content || "No content available."}
                </div>
              </article>
            `;

            blogContent.innerHTML = postHTML;

            // Apply syntax highlighting if you're using Prism
            if (window.Prism) {
              Prism.highlightAll();
            }
          } else {
            blogContent.innerHTML =
              "<p>Post not found. Please check the URL and try again.</p>";
          }
        } catch (error) {
          console.error("Error loading post:", error);
          blogContent.innerHTML =
            "<p>Error loading post: " + error.message + "</p>";
        }
      } else {
        // Load all posts (blog index)
        try {
          console.log("Fetching all blog posts");
          const blogCollection = collection(db, "blogs");
          const blogQuery = query(blogCollection, orderBy("date", "desc"));

          console.log("Query created, fetching documents...");
          const snapshot = await getDocs(blogQuery);
          console.log("Found", snapshot.docs.length, "blog posts");

          if (snapshot.empty) {
            blogContent.innerHTML = "<p>No blog posts found.</p>";
            return;
          }

          // Create HTML for all posts
          const postsHTML = snapshot.docs
            .map((doc) => {
              const post = doc.data();
              console.log("Processing post:", doc.id, post);

              let postDate;
              try {
                postDate = new Date(
                  post.date.toMillis ? post.date.toMillis() : post.date
                );
              } catch (dateError) {
                console.error(
                  "Error formatting date for post",
                  doc.id,
                  dateError
                );
                postDate = new Date(); // Fallback to current date
              }

              return `
              <article class="blog-post-preview">
                <a href="blog.html?post=${doc.id}" class="blog-post-link">
                  <h2>${post.title || "Untitled Post"}</h2>
                  <time datetime="${postDate.toISOString()}">${postDate.toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}</time>
                  <p>${post.summary || "No summary available."}</p>
                  <div class="tags">
                    ${
                      post.tags
                        ? post.tags
                            .map((tag) => `<span class="tag">${tag}</span>`)
                            .join("")
                        : ""
                    }
                  </div>
                </a>
                <a href="blog.html?post=${
                  doc.id
                }" class="read-more-btn">Read More</a>
              </article>
            `;
            })
            .join("");

          blogContent.innerHTML = `
            <h1>Blog Posts</h1>
            <div class="blog-posts-list">
              ${postsHTML}
            </div>
          `;
        } catch (error) {
          console.error("Error loading blog posts:", error);
          blogContent.innerHTML =
            "<p>Error loading blog posts: " + error.message + "</p>";
        }
      }
    } catch (globalError) {
      console.error("Global error in blog script:", globalError);
      blogContent.innerHTML =
        "<p>An unexpected error occurred. Please check the console for details.</p>";
    }
  }, 500); // Short delay to ensure Firebase is initialized
});

// When rendering a blog post, wrap it in the enhanced structure with about-me style
// ... existing code ...

// When rendering a blog post, wrap it in the enhanced structure with about-me style
function renderBlogPost(post) {
  return `
    <article class="blog-post-container">
      <div class="blog-post-content-wrapper">
        <div class="blog-post-header">
          <h1>${post.title}</h1>
          <div class="blog-post-meta">
            <span class="blog-post-date">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div class="blog-tags">
            ${post.tags
              .map((tag) => `<span class="blog-tag">${tag}</span>`)
              .join("")}
          </div>
        </div>
        <div class="blog-post-content">
          ${post.content}
        </div>
      </div>
    </article>
  `;
}
