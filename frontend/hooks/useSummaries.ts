"use client";

import { useEffect, useState } from "react";
import {
  getSummaries,
  getSummary,
  isMockMode,
  markSummaryAsRead
} from "../lib/api";
import type { Summary } from "../lib/types";

export function useSummaries() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selected, setSelected] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");
        const data = await getSummaries();
        setSummaries(data);

        const nextSelectedDate = selectedDate || data[0]?.date || "";
        if (nextSelectedDate) {
          setSelectedDate(nextSelectedDate);
        } else {
          setSelected(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summaries.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadSelectedSummary() {
      if (!selectedDate) {
        setSelected(null);
        return;
      }

      try {
        setError("");
        const data = await getSummary(selectedDate);
        setSelected(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summary.");
      }
    }

    loadSelectedSummary();
  }, [selectedDate]);

  async function refreshSummaries() {
    const data = await getSummaries();
    setSummaries(data);
    return data;
  }

  async function markRead() {
    if (!selected) {
      return;
    }

    try {
      setError("");
      const updated = await markSummaryAsRead(selected.date);
      setSelected(updated);
      await refreshSummaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark summary as read.");
    }
  }

  return {
    error,
    isMockData: isMockMode(),
    loading,
    markRead,
    selected,
    selectedDate,
    setSelectedDate,
    summaries
  };
}
