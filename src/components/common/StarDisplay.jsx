// src/components/common/StarDisplay.jsx
// ─────────────────────────────────────────────────────────────────────────────
// STAR DISPLAY COMPONENT — Shows student stars using backend data
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { useStudentStarCounts } from '../../hooks/useStudentStars';

function StarDisplay({ studentId, studentName, showDetails = false }) {
  const { totalStars, todayStars, todayActivities, loading, error } = useStudentStarCounts(studentId);

  if (loading) {
    return (
      <div className="star-display loading">
        <div className="spinner">⭐</div>
        <span>Loading stars...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="star-display error">
        <span>❌ Failed to load stars</span>
      </div>
    );
  }

  return (
    <div className="star-display">
      <div className="star-summary">
        <div className="total-stars">
          <span className="star-icon">⭐</span>
          <span className="count">{totalStars}</span>
          <span className="label">Total</span>
        </div>
        
        {showDetails && (
          <>
            <div className="today-stars">
              <span className="star-icon">🌟</span>
              <span className="count">{todayStars}</span>
              <span className="label">Today</span>
            </div>
            
            <div className="today-activities">
              <span className="activity-icon">🎯</span>
              <span className="count">{todayActivities}</span>
              <span className="label">Activities</span>
            </div>
          </>
        )}
      </div>
      
      {studentName && (
        <div className="student-name">{studentName}</div>
      )}
    </div>
  );
}

export default StarDisplay;

// Example usage in other components:
/*
// Simple star count
<StarDisplay studentId="60f7b3b3b3b3b3b3b3b3b3b3" />

// With details and name
<StarDisplay 
  studentId="60f7b3b3b3b3b3b3b3b3b3b3" 
  studentName="Alice Johnson"
  showDetails={true} 
/>

// In activity completion:
const { addActivityResult } = useStars();

const handleActivityComplete = async () => {
  const success = await addActivityResult({
    studentId: '60f7b3b3b3b3b3b3b3b3b3b3',
    studentName: 'Alice Johnson',
    activityId: 9,
    activityName: 'Picture Guess',
    stars: 5,
    score: 100
  });
  
  if (success) {
    console.log('Stars saved successfully!');
  }
};
*/