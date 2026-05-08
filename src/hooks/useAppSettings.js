import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

const DEFAULT_FLAGS = {
  chatEnabled:        true,
  activitiesEnabled:  true,
  whatsappEnabled:    true,
};

// Module-level cache so multiple components share one fetch per page load
let _cache = null;
let _promise = null;

const fetchFlags = () => {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = axios.get(API_ENDPOINTS.APP_SETTINGS)
    .then(res => { _cache = res.data; return _cache; })
    .catch(() => { _cache = DEFAULT_FLAGS; return _cache; });
  return _promise;
};

export const useAppSettings = () => {
  const [flags, setFlags] = useState(_cache || DEFAULT_FLAGS);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetchFlags().then(f => { setFlags(f); setLoading(false); });
  }, []);

  // Call this after admin saves settings to bust the cache
  const refetch = () => {
    _cache = null;
    _promise = null;
    setLoading(true);
    fetchFlags().then(f => { setFlags(f); setLoading(false); });
  };

  return { flags, loading, refetch };
};
