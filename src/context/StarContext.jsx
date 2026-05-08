// src/context/StarContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// SECURE STAR STORE — backend-based with real-time sync
//
// Replaces localStorage with secure backend API calls to prevent manipulation.
// Stars are stored in MongoDB and fetched from /get-student-stars endpoint.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { API_ENDPOINTS } from '../config';

const StarContext = createContext(null);

export function StarProvider({ children }) {
  const [studentStars, setStudentStars] = useState({}); // Cache by student_id
  const [loading, setLoading] = useState(false);

  /** Fetch stars for a specific student from backend */
  const fetchStudentStars = useCallback(async (studentId) => {
    if (!studentId || studentStars[studentId]) return studentStars[studentId];
    
    try {
      setLoading(true);
      const response = await apiRequest('get', API_ENDPOINTS.PARENT_CHILD_STARS(studentId));
      
      if (response.error) {
        console.error('Failed to fetch student stars:', response.error);
        return null;
      }
      
      // Cache the result
      setStudentStars(prev => ({
        ...prev,
        [studentId]: response
      }));
      
      return response;
    } catch (error) {
      console.error('Error fetching student stars:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [studentStars]);

  /** Save activity result to backend and update cache */
  const addActivityResult = useCallback(async ({ studentId, studentName, activityId, activityName, stars, score }) => {
    if (!studentId) {
      console.error('Student ID is required to save activity result');
      return false;
    }

    try {
      const response = await apiRequest('post', API_ENDPOINTS.ACTIVITY_SAVE_RESULT, {
          student_id: studentId,
          student_name: studentName,
          activity_id: activityId,
          activity_name: activityName,
          stars: Math.min(5, Math.max(0, stars ?? 0)),
          score: score ?? 0
        });

      if (response.status === 'success') {
        // Invalidate cache for this student to force refresh
        setStudentStars(prev => {
          const updated = { ...prev };
          delete updated[studentId];
          return updated;
        });
        
        // Fetch fresh data
        await fetchStudentStars(studentId);
        return true;
      } else {
        console.error('Failed to save activity result:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error saving activity result:', error);
      return false;
    }
  }, [fetchStudentStars]);

  /** Get all results for one student */
  const getStudentResults = useCallback(async (studentId) => {
    const data = await fetchStudentStars(studentId);
    return data?.results || [];
  }, [fetchStudentStars]);

  /** Get total stars for a student */
  const getTotalStars = useCallback(async (studentId) => {
    const data = await fetchStudentStars(studentId);
    return data?.total_stars || 0;
  }, [fetchStudentStars]);

  /** Get today's stars for a student */
  const getTodayStars = useCallback(async (studentId) => {
    const data = await fetchStudentStars(studentId);
    return data?.today_stars || 0;
  }, [fetchStudentStars]);

  /** Get today's activity count for a student */
  const getTodayActivities = useCallback(async (studentId) => {
    const data = await fetchStudentStars(studentId);
    return data?.today_activities || 0;
  }, [fetchStudentStars]);

  /** Clear cache (for testing/refresh) */
  const clearCache = useCallback(() => {
    setStudentStars({});
  }, []);

  /** Refresh data for a specific student */
  const refreshStudent = useCallback(async (studentId) => {
    setStudentStars(prev => {
      const updated = { ...prev };
      delete updated[studentId];
      return updated;
    });
    return await fetchStudentStars(studentId);
  }, [fetchStudentStars]);

  return (
    <StarContext.Provider value={{
      // Data
      studentStars,
      loading,
      
      // Actions
      addActivityResult,
      fetchStudentStars,
      refreshStudent,
      clearCache,
      
      // Getters (now async)
      getStudentResults,
      getTotalStars,
      getTodayStars,
      getTodayActivities,
    }}>
      {children}
    </StarContext.Provider>
  );
}

export function useStars() {
  const ctx = useContext(StarContext);
  if (!ctx) throw new Error('useStars must be used inside <StarProvider>');
  return ctx;
}

export default StarContext;