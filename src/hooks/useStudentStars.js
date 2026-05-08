// src/hooks/useStudentStars.js
// ─────────────────────────────────────────────────────────────────────────────
// HOOK FOR STUDENT STAR DATA — handles async loading and caching
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useStars } from '../context/StarContext';

/**
 * Hook to get star data for a specific student with loading states
 * @param {string} studentId - The student's ID
 * @returns {object} { stars, loading, error, refresh }
 */
export function useStudentStars(studentId) {
  const { fetchStudentStars, studentStars } = useStars();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      await fetchStudentStars(studentId);
    } catch (err) {
      setError(err.message || 'Failed to fetch stars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && !studentStars[studentId]) {
      refresh();
    }
  }, [studentId]);

  return {
    stars: studentStars[studentId] || null,
    loading,
    error,
    refresh
  };
}

/**
 * Hook to get star counts with automatic loading
 * @param {string} studentId - The student's ID
 * @returns {object} { totalStars, todayStars, todayActivities, loading, error }
 */
export function useStudentStarCounts(studentId) {
  const { stars, loading, error } = useStudentStars(studentId);

  return {
    totalStars: stars?.total_stars || 0,
    todayStars: stars?.today_stars || 0,
    todayActivities: stars?.today_activities || 0,
    loading,
    error
  };
}