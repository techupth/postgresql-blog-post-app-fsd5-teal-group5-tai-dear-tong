import { Router } from "express";
import pool from "../utils/db.js"; // Assuming the database connection pool is imported from "../db" file

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const status = req.query.status || "";
  const keywords = req.query.keywords || "";
  const page = req.query.page || 1;
  const PAGE_SIZE = 3;

  try {
    const offset = (page - 1) * PAGE_SIZE;
    let query = "";
    let values = [];

    if (status && keywords) {
      query = `SELECT * FROM posts
        WHERE status = $1
        AND title ILIKE $2
        LIMIT $3
        OFFSET $4`;
      values = [status, `%${keywords}%`, PAGE_SIZE, offset];
    } else if (keywords) {
      query = `SELECT * FROM posts
        WHERE title ILIKE $1
        LIMIT $2
        OFFSET $3`;
      values = [`%${keywords}%`, PAGE_SIZE, offset];
    } else if (status) {
      query = `SELECT * FROM posts
        WHERE status = $1
        LIMIT $2
        OFFSET $3`;
      values = [status, PAGE_SIZE, offset];
    } else {
      query = `SELECT * FROM posts
        LIMIT $1
        OFFSET $2`;
      values = [PAGE_SIZE, offset];
    }

    const results = await pool.query(query, values);

    const totalCount = await pool.query("SELECT COUNT(*) FROM posts");
    const totalPosts = parseInt(totalCount.rows[0].count);
    const totalPages = Math.ceil(totalPosts / PAGE_SIZE);

    return res.json({
      data: results.rows,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving posts.",
    });
  }
});
postRouter.get("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM posts WHERE post_id = $1", [
      postId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    return res.json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error retrieving post:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving the post.",
    });
  }
});

postRouter.post("/", async (req, res) => {
  const hasPublished = req.body.status === "published";
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };

  try {
    await pool.query(
      `INSERT INTO posts (title, content, status,category, created_at, updated_at, published_at)
      VALUES ($1, $2, $3, $4, $5, $6,$7)`,
      [
        newPost.title,
        newPost.content,
        newPost.status,
        newPost.category,
        newPost.created_at,
        newPost.updated_at,
        newPost.published_at,
      ]
    );

    return res.json({
      message: "Post has been created.",
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      message: "An error occurred while creating the post.",
    });
  }
});

postRouter.put("/:id", async (req, res) => {
  const hasPublished = req.body.status === "published";
  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };
  const postId = req.params.id;

  try {
    await pool.query(
      `UPDATE posts SET title = $1, content = $2, status = $3,  category = $4, updated_at = $5, published_at = $6
      WHERE post_id = $7`,
      [
        updatedPost.title,
        updatedPost.content,
        updatedPost.status,
        updatedPost.category,
        updatedPost.updated_at,
        updatedPost.published_at,
        postId,
      ]
    );

    return res.json({
      message: `Post ${postId} has been updated.`,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({
      message: "An error occurred while updating the post.",
    });
  }
});

postRouter.delete("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    await pool.query("DELETE FROM posts WHERE post_id = $1", [postId]);

    return res.json({
      message: `Post ${postId} has been deleted.`,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the post.",
    });
  }
});

export default postRouter;
