"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function TrendingTopicsDeep() {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [day, setDay] = useState("");
  const [cached, setCached] = useState(true);
  const [error, setError] = useState("");

  const fetchTopics = async (refresh = false) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/trending-topic${refresh ? "?refresh=1" : ""}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTopics(data.topics || []);
      setDay(data.day || "");
      setCached(Boolean(data.cached));
    } catch (e) {
      setError(e.message || "Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(false);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">🧠 Deep Research — Daily Trending Topics</h3>
          <p className="text-sm text-gray-500">
            {day ? `IST Day: ${day}` : "Loading…"} {cached ? "(cached)" : ""}
          </p>
        </div>
        <Button onClick={() => fetchTopics(true)} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      {!error && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((t, i) => (
            <div key={i} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold">{t.topic}</h4>
                <span className="text-xs px-2 py-1 rounded bg-gray-200">
                  {(t.confidence * 100).toFixed(0)}% conf
                </span>
              </div>
              <p className="mt-2 text-gray-700">{t.summary}</p>
              <p className="mt-2 text-gray-600 text-sm">{t.why_it_matters}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(t.suggested_hashtags || []).map((h, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-200 rounded-full"
                  >
                    {h}
                  </span>
                ))}
              </div>
              {Array.isArray(t.sources) && t.sources.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Sources:</p>
                  <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                    {t.sources.slice(0, 5).map((s, k) => (
                      <li key={k}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}