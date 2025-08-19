"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowUp, LucideGitGraph } from "lucide-react";
import TrendingTopicsDeep from "./TrendingTopicDeep";
import ScheduleButton from "./schedulePostButton";

export default function Linkedin() {
  // Analyze states
  const [postLink, setPostLink] = useState("");
  const [commentResult, setCommentResult] = useState("");

  // Create Post states
  const [postType, setPostType] = useState("");
  const [tone, setTone] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordRange, setWordRange] = useState("");
  const [emoji, setEmoji] = useState(false);
  const [generatedPost, setGeneratedPost] = useState("");

  // Shared loading
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHashtags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hashtags");
      const data = await res.json();
      if (data.hashtags) setHashtags(data.hashtags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHashtags(); // fetch on mount
  }, []);

  // Handle Analyze (Generate Comment)
  const handleAnalyze = async () => {
    if (!postLink.trim()) {
      alert("Please enter a LinkedIn post link");
      return;
    }
    setLoadingAnalyze(true);
    setCommentResult("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postLink }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCommentResult(data.comment); // Comment instead of analysis
    } catch (err) {
      console.error(err);
      alert("Error generating comment");
    } finally {
      setLoadingAnalyze(false);
    }
  };

  const [post, setPost] = useState("");

  // Handle Create Post
  const handleCreatePost = async () => {
    if (
      !postType?.trim() ||
      !tone?.trim() ||
      !title?.trim() ||
      !content?.trim() ||
      !wordRange?.trim()
    ) {
      alert("All fields are required");
      return;
    }

    setLoadingCreate(true);
    setGeneratedPost("");
    try {
      const res = await fetch("/api/create-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postType,
          tone,
          title,
          content,
          emoji,
          wordRange,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPost(data.post);
    } catch (err) {
      console.error(err);
      alert("Error creating post");
    } finally {
      setLoadingCreate(false);
    }
  };

  const publishPost = async () => {
    if (!post) return;
    await fetch("/api/linkedin-publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: post }),
    });
    alert("Posted to LinkedIn!");
  };

  return (
    <div className="space-y-10">
      {/* Analyze Section */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <h2 className="text-lg font-semibold mb-4">
          Generate a LinkedIn Comment
        </h2>
        <div className="flex gap-3">
          <Input
            type="text"
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            placeholder="Paste LinkedIn post link here..."
            className="flex-1"
          />
          <Button
            variant="default"
            onClick={handleAnalyze}
            disabled={loadingAnalyze || postLink === ""}
            className="cursor-pointer"
          >
            <LucideGitGraph className="mr-2 h-4 w-4" />
            {loadingAnalyze
              ? "Generating..."
              : postLink === ""
              ? "Paste the Link"
              : "Generate Comment"}
          </Button>
        </div>
        {commentResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p>{commentResult}</p>
          </div>
        )}
      </div>

      {/* Create Post Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Create a LinkedIn Post</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="mb-2">Post Type</Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="case-study">Case Study</SelectItem>
                    <SelectItem value="thought-leadership">
                      Thought Leadership
                    </SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="personal-experience">
                      Personal Experience
                    </SelectItem>
                    <SelectItem value="industry-trends">
                      Industry Trends
                    </SelectItem>
                    <SelectItem value="how-to-guide">How-To Guide</SelectItem>
                    <SelectItem value="company-update">
                      Company Update
                    </SelectItem>
                    <SelectItem value="event-promo">Event Promotion</SelectItem>
                    <SelectItem value="product-launch">
                      Product Launch
                    </SelectItem>
                    <SelectItem value="customer-testimonial">
                      Customer Testimonial
                    </SelectItem>
                    <SelectItem value="poll">Poll</SelectItem>
                    <SelectItem value="listicle">Listicle</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="reaction">Reaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="mb-2">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="visionary">Visionary</SelectItem>
                    <SelectItem value="empathetic">Empathetic</SelectItem>
                    <SelectItem value="confident">Confident</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="optimistic">Optimistic</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2">Post Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </div>

            <div>
              <Label className="mb-2">Post Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                rows={5}
              />
            </div>

            {/* Word Count & Emoji Options */}
            <div className="flex gap-4">
              <div>
                <Label className="mb-2">Word Count</Label>
                <Select value={wordRange} onValueChange={setWordRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select word range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25-50">25-50 words</SelectItem>
                    <SelectItem value="100-150">100-150 words</SelectItem>
                    <SelectItem value="250-500">250-500 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center mt-5">
                <input
                  type="checkbox"
                  checked={emoji}
                  onChange={(e) => setEmoji(e.target.checked)}
                  className="mr-2"
                />
                <Label>Include Emojis</Label>
              </div>
            </div>

            
              <div className="flex items-center justify-between w-1/3 gap-3">
              <div className="border-r border-black pr-4">
                <Button
                  onClick={handleCreatePost}
                  disabled={loadingCreate}
                  className="w-full"
                >
                  {loadingCreate ? "Creating..." : "Create Post"}
                </Button>
              </div>
              <ScheduleButton post={post} />
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Live Preview</h3>
            {title || content ? (
              <div className="space-y-2">
                <span className="inline-block text-xs px-2 py-1 bg-gray-200 rounded-full">
                  {postType || "No type selected"}
                </span>
                <span className="inline-block ml-3 text-xs px-2 py-1 bg-gray-200 rounded-full">
                  {tone || "No tone selected"}
                </span>
                <h4 className="text-xl font-bold">{title}</h4>
                <p className="text-gray-700">{content}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-500">
                  Your post preview will appear here...
                </p>
              </>
            )}
          </div>
        </div>

        {/* Generated Post Output */}
        <>
          {post && (
            <div className="mt-6 p-4 rounded">
              <h4 className="font-semibold mb-2">AI Generated Post:</h4>
              <textarea
                value={post}
                onChange={(e) => setPost(e.target.value)}
                rows={8}
                style={{ width: "100%" }}
              />
              <button
                className="bg-black text-white p-2 rounded-sm cursor-pointer hover:bg-gray-300 hover:text-black ease-in-out duration-500 flex flex-row-reverse gap-2"
                onClick={publishPost}
              >
                Post to LinkedIn <ArrowUp />{" "}
              </button>
            </div>
          )}
        </>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">
            🔥 Trending LinkedIn Hashtags
          </h3>
          <Button size="sm" onClick={fetchHashtags} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hashtags available right now.</p>
        )}
      </div>
      <TrendingTopicsDeep />
    </div>
  );
}
