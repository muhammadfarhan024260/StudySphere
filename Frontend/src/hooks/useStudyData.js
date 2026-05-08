import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Hook to fetch student study logs/sessions
 */
export const useStudyLogs = (studentId) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLogs = async () => {
    if (!studentId) { setLoading(false); return }
    try {
      setLoading(true)
      const response = await api.get(`/studylog/student/${studentId}/history`)
      setLogs(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch study logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [studentId])

  return { logs, loading, error, refetch: fetchLogs }
}

/**
 * Hook to fetch student goals
 */
export const useGoals = (studentId) => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGoals = async () => {
    if (!studentId) { setLoading(false); return }
    try {
      setLoading(true)
      const response = await api.get(`/studylog/student/${studentId}/goals`)
      setGoals(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch goals')
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [studentId])

  return { goals, loading, error, refetch: fetchGoals }
}

/**
 * Hook to fetch weak areas for a student
 */
export const useWeakAreas = (studentId) => {
  const [weakAreas, setWeakAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }

    const fetchWeakAreas = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/intelligence/student/${studentId}/weak-subjects`)
        setWeakAreas(response.data || [])
        setError(null)
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch weak areas')
        setWeakAreas([])
      } finally {
        setLoading(false)
      }
    }

    fetchWeakAreas()
  }, [studentId])

  return { weakAreas, loading, error }
}

/**
 * Hook to fetch notifications for a student
 */
export const useNotifications = (studentId) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotifications = async () => {
    if (!studentId) return

    try {
      setLoading(true)
      const response = await api.get(`/intelligence/student/${studentId}/notifications`)
      setNotifications(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [studentId])

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/intelligence/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  return { notifications, loading, error, markAsRead, refetch: fetchNotifications }
}

/**
 * Hook to fetch recommendations for a student
 */
export const useRecommendations = (studentId) => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/intelligence/student/${studentId}/recommendations`)
        setRecommendations(response.data || [])
        setError(null)
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch recommendations')
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [studentId])

  return { recommendations, loading, error }
}

/**
 * Hook to fetch all subjects (for dropdowns)
 */
export const useSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/subject')
      .then(res => setSubjects(res.data?.subjects || []))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false))
  }, [])

  return { subjects, loading }
}

/**
 * Hook to log a new study session
 */
export const useLogSession = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const logSession = async (sessionData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.post('/studylog/session', sessionData)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.Error || err.response?.data?.error || err.message || 'Failed to log session'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return { logSession, loading, error }
}

/**
 * Hook to fetch the weekly report (vw_weekly_report — Lab 9)
 */
export const useWeeklyReport = (studentId) => {
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/studylog/student/${studentId}/weekly-report`)
        setReport(res.data || [])
        setError(null)
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch weekly report')
        setReport([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [studentId])

  return { report, loading, error }
}

/**
 * Hook to fetch study scope (UNION — Lab 5)
 */
export const useStudyScope = (studentId) => {
  const [scope, setScope] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    api.get(`/studylog/student/${studentId}/study-scope`)
      .then(res => setScope(res.data || []))
      .catch(() => setScope([]))
      .finally(() => setLoading(false))
  }, [studentId])

  return { scope, loading }
}

/**
 * Hook to delete a goal
 */
export const useDeleteGoal = () => {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const deleteGoal = async (goalId) => {
    try {
      setLoading(true)
      setError(null)
      await api.delete(`/studylog/goal/${goalId}`)
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.Error || err.response?.data?.error || err.message || 'Failed to delete goal'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return { deleteGoal, loading, error }
}

/**
 * Hook to create a new study goal
 */
export const useCreateGoal = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createGoal = async (goalData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.post('/studylog/goal', goalData)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.Error || err.response?.data?.error || err.message || 'Failed to create goal'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return { createGoal, loading, error }
}

/**
 * Public hooks — no auth needed, used by Signup form
 */
export const useDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/config/departments')
      .then(r => setDepartments(r.data?.data || []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false))
  }, [])

  return { departments, loading }
}

export const useSemesters = () => {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/config/semesters')
      .then(r => setSemesters(r.data?.data || []))
      .catch(() => setSemesters([]))
      .finally(() => setLoading(false))
  }, [])

  return { semesters, loading }
}
