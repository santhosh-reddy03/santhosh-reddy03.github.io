import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import BlogPost from "../components/BlogPost";

export default function Blog({ posts }) {
  return (
    <div className="blog-container">
      {posts.map((post) => (
        <BlogPost key={post.slug} meta={post.meta}>
          <MDXRemote {...post.content} />
        </BlogPost>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  const postsDirectory = path.join(process.cwd(), "posts");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      const mdxSource = await serialize(content);

      return {
        slug: filename.replace(/\.mdx$/, ""),
        meta: data,
        content: mdxSource,
      };
    })
  );

  return {
    props: {
      posts: posts.sort(
        (a, b) => new Date(b.meta.date) - new Date(a.meta.date)
      ),
    },
  };
}
