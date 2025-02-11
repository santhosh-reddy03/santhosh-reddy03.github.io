export default function BlogPost({ meta, children }) {
  return (
    <article className="blog-post">
      <h1>{meta.title}</h1>
      <time>{meta.date}</time>
      <div className="content">{children}</div>
    </article>
  );
}
