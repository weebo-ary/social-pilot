import React, { useState } from "react";
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
import { LucideGitGraph } from "lucide-react";

function Linkedin() {
  const [title, setTitle] = useState();
  const [content, setContent] = useState();
  const [type, setType] = useState();
  const [tone, setTone] = useState();

  const handleCreatePost = () => {};
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <h2 className="text-lg font-semibold mb-4">Analyze LinkedIn Post</h2>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Paste LinkedIn post link here..."
            className="flex-1"
          />
          <Button variant="default" className="cursor-pointer">
            <LucideGitGraph /> Analyze
          </Button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mt-10">
        <h2 className="text-lg font-semibold mb-4">Create a LinkedIn Post</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-4">
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

            <div className="flex gap-4">
              <div>
                <Label className="mb-2">Post Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="job">Job Posting</SelectItem>
                    <SelectItem value="tip">Tip / Advice</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCreatePost}>Create Post</Button>
          </div>

          {/* Right: Live Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Live Preview</h3>
            {title || content ? (
              <div className="space-y-2">
                <h4 className="text-xl font-bold">{title}</h4>
                <p className="text-gray-700">{content}</p>
                <span className="inline-block text-xs px-2 py-1 bg-gray-200 rounded-full">
                  {type || "No type selected"}
                </span>
              </div>
            ) : (
              <p className="text-gray-500">
                Your post preview will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Linkedin;
