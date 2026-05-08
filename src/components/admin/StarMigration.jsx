// src/components/admin/StarMigration.jsx
// ─────────────────────────────────────────────────────────────────────────────
// STAR MIGRATION COMPONENT — Migrate localStorage stars to backend
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { migrateLocalStorageStars, hasLocalStorageStars, getLocalStorageStarCount } from '../../utils/starMigration';

function StarMigration() {
  const [hasLocalData, setHasLocalData] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  useEffect(() => {
    const checkLocalData = () => {
      setHasLocalData(hasLocalStorageStars());
      setLocalCount(getLocalStorageStarCount());
    };
    
    checkLocalData();
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrationResult(null);
    
    try {
      const result = await migrateLocalStorageStars();
      setMigrationResult(result);
      
      // Refresh local data check
      setHasLocalData(hasLocalStorageStars());
      setLocalCount(getLocalStorageStarCount());
    } catch (error) {
      setMigrationResult({
        success: false,
        error: error.message
      });
    } finally {
      setMigrating(false);
    }
  };

  if (!hasLocalData) {
    return (
      <div className="migration-panel">
        <div className="migration-status success">
          <h3>✅ Migration Complete</h3>
          <p>No localStorage star data found. All stars are now stored securely in the backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="migration-panel">
      <div className="migration-header">
        <h3>🔄 Star Data Migration</h3>
        <p>
          Found <strong>{localCount}</strong> star records in localStorage that need to be migrated to the secure backend.
        </p>
      </div>

      <div className="migration-warning">
        <h4>⚠️ Security Notice</h4>
        <p>
          Stars stored in localStorage can be easily manipulated by users. 
          Click "Migrate Now" to transfer all star data to the secure backend database.
        </p>
      </div>

      <div className="migration-actions">
        <button 
          onClick={handleMigrate}
          disabled={migrating}
          className="migrate-btn"
        >
          {migrating ? '🔄 Migrating...' : '🚀 Migrate Now'}
        </button>
      </div>

      {migrationResult && (
        <div className={`migration-result ${migrationResult.success ? 'success' : 'error'}`}>
          {migrationResult.success ? (
            <div>
              <h4>✅ Migration Successful!</h4>
              <p>
                Migrated: <strong>{migrationResult.migrated}</strong> records<br/>
                Errors: <strong>{migrationResult.errors}</strong>
              </p>
              <p>
                <small>
                  Original data has been backed up and removed from localStorage.
                  All stars are now stored securely in the backend.
                </small>
              </p>
            </div>
          ) : (
            <div>
              <h4>❌ Migration Failed</h4>
              <p>Error: {migrationResult.error}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .migration-panel {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 2px solid #ffa500;
          border-radius: 8px;
          background: #fff9e6;
        }
        
        .migration-header h3 {
          color: #ff8c00;
          margin: 0 0 10px 0;
        }
        
        .migration-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 15px;
          margin: 15px 0;
        }
        
        .migration-warning h4 {
          color: #856404;
          margin: 0 0 10px 0;
        }
        
        .migrate-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .migrate-btn:hover:not(:disabled) {
          background: #218838;
        }
        
        .migrate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .migration-result {
          margin-top: 20px;
          padding: 15px;
          border-radius: 4px;
        }
        
        .migration-result.success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .migration-result.error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .migration-status.success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 20px;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default StarMigration;