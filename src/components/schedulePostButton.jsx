"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ScheduleButton({ post }) {
  const [scheduleTime, setScheduleTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSchedule = async () => {
    if (!scheduleTime) {
      setMessage("Please select a time");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/schedule-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post,
          scheduleTime, // ISO string from input
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Post scheduled successfully!");
      } else {
        setMessage("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to schedule post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {/* datetime picker */}
      <Button
        onClick={handleSchedule}
        disabled={loading}
        className="bg-blue-600 text-white mt-1"
      >
        {loading ? "Scheduling..." : "Schedule"}
      </Button>
   <input
        type="datetime-local"
        value={scheduleTime}
        onChange={(e) => setScheduleTime(e.target.value)}
        className="border rounded p-2 w-1/2"
      />

      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
