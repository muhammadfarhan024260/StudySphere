import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Hook to fetch all recommendations (for admin)
 */
export const useAllRecommendations = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/intelligence/recommendations')
      setRecommendations(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch recommendations')
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const createRecommendation = async (data) => {
    try {
      const response = await api.post('/intelligence/recommendations', data)
      setRecommendations([...recommendations, response.data])
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const updateRecommendation = async (id, data) => {
    try {
      await api.put(`/intelligence/recommendations/${id}`, data)
      setRecommendations(prev =>
        prev.map(r => r.recommendationId === id ? { ...r, ...data } : r)
      )
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const deleteRecommendation = async (id) => {
    try {
      await api.delete(`/intelligence/recommendations/${id}`)
      setRecommendations(prev => prev.filter(r => r.recommendationId !== id))
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation
  }
}

/**
 * Hook to fetch platform analytics data (placeholder - will need backend endpoints)
 */
export const useAnalyticsData = () => {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalHoursLogged: 0,
    averageProductivity: 0,
    topSubjects: [],
    weeklyTrend: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const res = await api.get('/admin/analytics/overview')
        if (res.data.success) {
          setAnalytics(res.data.data)
        }
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return { analyticsData: analytics, loading, error }
}

/**
 * Hook to fetch real weak area statistics from the backend
 */
export const useWeakAreaStats = () => {
  const [stats, setStats] = useState({
    totalWeakAreas: 0,
    affectedStudents: 0,
    topWeakSubjects: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await api.get('/admin/analytics/weak-areas')
        setStats({
          totalWeakAreas:   res.data.totalWeakAreas   || 0,
          affectedStudents: res.data.affectedStudents || 0,
          topWeakSubjects:  res.data.topSubjects      || [],
        })
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch weak area statistics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return { weakAreaStats: stats, loading, error }
}

/**
 * Hook to fetch the authenticated admin's profile
 */
export const useAdminProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/profile')
      .then(res => res.data.success && setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { profile, loading }
}

/**
 * Hook to fetch ROLLUP analytics (Lab 12)
 */
export const useRollupAnalytics = () => {
  const [rollupData, setRollupData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await api.get('/admin/analytics/rollup')
        setRollupData(res.data?.data || [])
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch rollup analytics')
        setRollupData([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { rollupData, loading, error }
}

/**
 * Hook to fetch below-average students (Lab 6 subquery)
 */
export const useBelowAverage = () => {
  const [belowAvg, setBelowAvg] = useState([])
  const [systemAvg, setSystemAvg] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics/below-average')
      .then(res => {
        setBelowAvg(res.data?.data || [])
        setSystemAvg(res.data?.systemAvg || 0)
      })
      .catch(() => setBelowAvg([]))
      .finally(() => setLoading(false))
  }, [])

  return { belowAvg, systemAvg, loading }
}

/**
 * Hook to fetch engaged students (Lab 5 INTERSECT)
 */
export const useEngagedStudents = () => {
  const [engaged, setEngaged] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics/engaged-students')
      .then(res => setEngaged(res.data?.data || []))
      .catch(() => setEngaged([]))
      .finally(() => setLoading(false))
  }, [])

  return { engaged, loading }
}

/**
 * Hook to fetch student performance data (for admin)
 */
export const useStudentPerformance = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true)
        const res = await api.get('/admin/students')
        if (res.data.success) {
          setStudents(res.data.students)
        }
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch student performance')
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [])

  return { studentPerformance: students, loading, error }
}

/**
 * Hook to manage departments from the admin settings tab
 */
export const useAdminDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/departments')
      setDepartments(res.data?.data || [])
    } catch {
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const add = async (name) => {
    setSaving(true); setError(null)
    try {
      await api.post('/admin/departments', { name })
      await fetch()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add department'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    setSaving(true); setError(null)
    try {
      await api.delete(`/admin/departments/${id}`)
      await fetch()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete department'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setSaving(false)
    }
  }

  return { departments, loading, saving, error, add, remove }
}

/**
 * Hook to manage semester options from the admin settings tab
 */
export const useAdminSemesters = () => {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/semesters')
      setSemesters(res.data?.data || [])
    } catch {
      setSemesters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const add = async (name) => {
    setSaving(true); setError(null)
    try {
      await api.post('/admin/semesters', { name })
      await fetch()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add semester'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    setSaving(true); setError(null)
    try {
      await api.delete(`/admin/semesters/${id}`)
      await fetch()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete semester'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setSaving(false)
    }
  }

  return { semesters, loading, saving, error, add, remove }
}

export function useBroadcastNotification() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const broadcast = async ({ message, email, whatsapp, push, studentIds }) => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await api.post('/admin/notifications/broadcast', { message, email, whatsapp, push, studentIds: studentIds?.length ? studentIds : null })
      setResult(res.data)
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || 'Broadcast failed'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  return { broadcast, loading, result, error }
}
