import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/useAuth'
import { API_URL, SOCKET_URL } from '../config/api'
import './DashboardPage.css'


function DashboardPage() {
  const { user, token, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // =========================
  // PROJETOS
  // =========================

  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [projectFilter, setProjectFilter] = useState('all')
  const [projectSearch, setProjectSearch] = useState('')

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    category: '',
  })

  const [projectMessage, setProjectMessage] = useState('')
  const [uploadingProjectImage, setUploadingProjectImage] = useState(false)
  const [toast, setToast] = useState(null)
  const [profileName, setProfileName] = useState(user?.name || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // =========================
  // SERVIÇOS
  // =========================

  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [serviceSearch, setServiceSearch] = useState('')

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: '',
  })

  const [serviceMessage, setServiceMessage] = useState('')

  // =========================
  // MENSAGENS
  // =========================

  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])

  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [adminUsers, setAdminUsers] = useState([])
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false)
  const [userManagementMessage, setUserManagementMessage] = useState('')

  const [leads, setLeads] = useState([])
  const [expandedLeadId, setExpandedLeadId] = useState(null)
  const [leadHistory, setLeadHistory] = useState({})
  const [loadingLeadHistory, setLoadingLeadHistory] = useState(null)
  const [dashboardMetrics, setDashboardMetrics] = useState(null)
  const [lastDashboardUpdate, setLastDashboardUpdate] = useState(null)
  const [refreshingDashboard, setRefreshingDashboard] = useState(false)
  const [leadSearch, setLeadSearch] = useState('')
  const [leadStatus, setLeadStatus] = useState('')
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [leadMessage, setLeadMessage] = useState('')

  const [messageError, setMessageError] = useState('')
  const [messageSuccess, setMessageSuccess] = useState('')

  const [showCompose, setShowCompose] = useState(false)

  const [messageForm, setMessageForm] = useState({
    recipient_id: '',
    subject: '',
    message: '',
  })

  // =========================
  // CONVERSA
  // =========================

  const [conversationUser, setConversationUser] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [conversationText, setConversationText] = useState('')
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [sendingConversation, setSendingConversation] = useState(false)

  // =========================
  // MENU
  // =========================

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Visão geral',
      icon: '▦',
    },
    {
      id: 'projects',
      label: 'Projetos',
      icon: '◈',
    },
    {
      id: 'services',
      label: 'Serviços',
      icon: '◇',
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: '✉',
    },
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [{ id: 'leads', label: 'Leads', icon: '◌' }]
      : []),
    ...(user?.role === 'admin'
      ? [{ id: 'users', label: 'Usuários', icon: '◉' }]
      : []),
    {
      id: 'settings',
      label: 'Configurações',
      icon: '⚙',
    },
  ]

  // =========================
  // HEADERS
  // =========================

  const getAuthHeaders = (includeJson = false) => {
    const headers = {}

    if (includeJson) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  // =========================
  // RESPOSTA
  // =========================

  const parseResponse = async (response) => {
    const text = await response.text()

    if (!text) {
      return {}
    }

    try {
      return JSON.parse(text)
    } catch {
      return {
        success: false,
        message: text,
      }
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  useEffect(() => {
    setProfileName(user?.name || '')
  }, [user?.name])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  // =========================
  // ESTATÍSTICAS
  // =========================

  const receivedMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          Number(message.recipient_id) === Number(user?.id)
      ),
    [messages, user?.id]
  )

  const unreadMessages = useMemo(
    () =>
      receivedMessages.filter((message) => !message.read)
        .length,
    [receivedMessages]
  )

  const dashboardLeadTotal = useMemo(
    () => Object.values(dashboardMetrics?.leads || {}).reduce(
      (total, value) => total + Number(value || 0),
      0
    ),
    [dashboardMetrics]
  )

  // =========================
  // PROJETOS
  // =========================

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      setProjectMessage('')

      const response = await fetch(`${API_URL}/projects`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setProjectMessage(
          data.message || 'Erro ao carregar projetos.'
        )
        return
      }

      setProjects(data.projects || [])
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)

      setProjectMessage(
        'Não foi possível conectar ao servidor.'
      )
      showToast('Não foi possível conectar ao servidor.', 'error')
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleProjectChange = (event) => {
    const { name, value } = event.target

    setProjectForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleProjectImageChange = async (event) => {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProjectMessage('Use uma imagem JPG, PNG ou WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProjectMessage('A imagem deve ter no máximo 5 MB.')
      return
    }

    setUploadingProjectImage(true)
    setProjectMessage('Enviando imagem...')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/projects/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      })
      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Não foi possível enviar a imagem.')
      }

      setProjectForm((previous) => ({ ...previous, image: data.image }))
      setProjectMessage('Imagem enviada. Você já pode salvar o projeto.')
      showToast('Imagem enviada com sucesso.', 'success')
    } catch (error) {
      setProjectMessage(error.message || 'Não foi possível enviar a imagem.')
      showToast(error.message || 'Não foi possível enviar a imagem.', 'error')
    } finally {
      setUploadingProjectImage(false)
    }
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setProjectMessage('')

    if (!projectForm.title.trim()) {
      setProjectMessage('Digite o título do projeto.')
      return
    }

    try {
      const response = await fetch(
        editingProjectId
          ? `${API_URL}/projects/${editingProjectId}`
          : `${API_URL}/projects`,
        {
        method: editingProjectId ? 'PUT' : 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(projectForm),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setProjectMessage(
          data.message || 'Erro ao criar projeto.'
        )
        return
      }

      setProjects((previous) => editingProjectId
        ? previous.map((project) =>
          Number(project.id) === Number(editingProjectId)
            ? data.project
            : project
        )
        : [data.project, ...previous]
      )

      setProjectForm({
        title: '',
        description: '',
        image: '',
        link: '',
        category: '',
      })

      setEditingProjectId(null)
      setShowProjectForm(false)
      setProjectMessage(
        editingProjectId
          ? 'Projeto atualizado com sucesso.'
          : 'Projeto criado com sucesso.'
      )
      showToast(
        editingProjectId
          ? 'Projeto atualizado com sucesso.'
          : 'Projeto criado com sucesso.',
        'success'
      )
    } catch (error) {
      console.error('Erro ao criar projeto:', error)

      setProjectMessage(
        'Não foi possível conectar ao servidor.'
      )
      showToast('Não foi possível conectar ao servidor.', 'error')
    }
  }

  const handleEditProject = (project) => {
    setProjectForm({
      title: project.title || '',
      description: project.description || '',
      image: project.image || '',
      link: project.link || '',
      category: project.category || '',
    })
    setEditingProjectId(project.id)
    setShowProjectForm(true)
    setProjectMessage('')
  }

  const filteredProjects = projects.filter((project) => {
    const categoryMatch =
      projectFilter === 'all' ||
      (project.category || '').toLowerCase() === projectFilter.toLowerCase()

    const searchQuery = projectSearch.trim().toLowerCase()
    const titleMatch =
      !searchQuery ||
      (project.title || '').toLowerCase().includes(searchQuery) ||
      (project.description || '').toLowerCase().includes(searchQuery)

    return categoryMatch && titleMatch
  })

  const filteredServices = services.filter((service) => {
    const query = serviceSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return (
      (service.title || '').toLowerCase().includes(query) ||
      (service.description || '').toLowerCase().includes(query) ||
      (service.icon || '').toLowerCase().includes(query)
    )
  })

  const projectCategories = [...new Set(
    projects.map((project) => project.category).filter(Boolean)
  )]

  const handleDeleteProject = async (id) => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este projeto?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/projects/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setProjectMessage(
          data.message || 'Erro ao excluir projeto.'
        )
        return
      }

      setProjects((previous) =>
        previous.filter(
          (project) => Number(project.id) !== Number(id)
        )
      )

      setProjectMessage(
        'Projeto excluído com sucesso.'
      )
      showToast('Projeto excluído com sucesso.', 'success')
    } catch (error) {
      console.error(
        'Erro ao excluir projeto:',
        error
      )

      setProjectMessage(
        'Não foi possível conectar ao servidor.'
      )
      showToast('Não foi possível conectar ao servidor.', 'error')
    }
  }

  // =========================
  // SERVIÇOS
  // =========================

  const fetchServices = async () => {
    try {
      setLoadingServices(true)
      setServiceMessage('')

      const response = await fetch(`${API_URL}/services`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setServiceMessage(
          data.message || 'Erro ao carregar serviços.'
        )
        return
      }

      setServices(data.services || [])
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)

      setServiceMessage(
        'Não foi possível conectar ao servidor.'
      )
      showToast('Não foi possível conectar ao servidor.', 'error')
    } finally {
      setLoadingServices(false)
    }
  }

  const handleServiceChange = (event) => {
    const { name, value } = event.target

    setServiceForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleCreateService = async (event) => {
    event.preventDefault()
    setServiceMessage('')

    if (!serviceForm.title.trim()) {
      setServiceMessage('Digite o título do serviço.')
      return
    }

    try {
      const response = await fetch(
        editingServiceId
          ? `${API_URL}/services/${editingServiceId}`
          : `${API_URL}/services`,
        {
        method: editingServiceId ? 'PUT' : 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(serviceForm),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setServiceMessage(
          data.message || 'Erro ao criar serviço.'
        )
        return
      }

      setServices((previous) => editingServiceId
        ? previous.map((service) =>
          Number(service.id) === Number(editingServiceId)
            ? data.service
            : service
        )
        : [data.service, ...previous]
      )

      setServiceForm({
        title: '',
        description: '',
        icon: '',
      })

      setEditingServiceId(null)
      setShowServiceForm(false)
      setServiceMessage(
        editingServiceId
          ? 'Serviço atualizado com sucesso.'
          : 'Serviço criado com sucesso.'
      )
      showToast(
        editingServiceId
          ? 'Serviço atualizado com sucesso.'
          : 'Serviço criado com sucesso.',
        'success'
      )
    } catch (error) {
      console.error(
        'Erro ao criar serviço:',
        error
      )

      setServiceMessage(
        'Não foi possível conectar ao servidor.'
      )
      showToast('Não foi possível conectar ao servidor.', 'error')
    }
  }

  const handleEditService = (service) => {
    setServiceForm({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || '',
    })
    setEditingServiceId(service.id)
    setShowServiceForm(true)
    setServiceMessage('')
  }

  const handleDeleteService = async (id) => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este serviço?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/services/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setServiceMessage(
          data.message || 'Erro ao excluir serviço.'
        )
        return
      }

      setServices((previous) =>
        previous.filter(
          (service) => Number(service.id) !== Number(id)
        )
      )

      setServiceMessage(
        'Serviço excluído com sucesso.'
      )
      showToast('Serviço excluído com sucesso.', 'success')
    } catch (error) {
      console.error(
        'Erro ao excluir serviço:',
        error
      )

      setServiceMessage(
        'Não foi possível conectar ao servidor.'
      )
      showToast('Não foi possível conectar ao servidor.', 'error')
    }
  }

  // =========================
  // MENSAGENS
  // =========================

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true)
      setMessageError('')

      const response = await fetch(`${API_URL}/messages`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setMessageError(
          data.message || 'Erro ao carregar mensagens.'
        )
        return
      }

      setMessages(data.messages || [])
    } catch (error) {
      console.error(
        'Erro ao buscar mensagens:',
        error
      )

      setMessageError(
        'Não foi possível conectar ao servidor.'
      )
    } finally {
      setLoadingMessages(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      setMessageError('')

      const response = await fetch(
        `${API_URL}/messages/users`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setMessageError(
          data.message || 'Erro ao carregar usuários.'
        )
        return
      }

      setUsers(data.users || [])
    } catch (error) {
      console.error(
        'Erro ao buscar usuários:',
        error
      )

      setMessageError(
        'Não foi possível carregar os usuários.'
      )
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchAdminUsers = async () => {
    if (user?.role !== 'admin') {
      return
    }

    try {
      setLoadingAdminUsers(true)
      setUserManagementMessage('')

      const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders(),
      })
      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setUserManagementMessage(
          data.message || 'Erro ao carregar usuários.'
        )
        return
      }

      setAdminUsers(data.users || [])
    } catch (error) {
      console.error('Erro ao buscar usuários do painel:', error)
      setUserManagementMessage('Não foi possível conectar ao servidor.')
    } finally {
      setLoadingAdminUsers(false)
    }
  }

  const fetchLeads = async (search = leadSearch, status = leadStatus) => {
    if (!['admin', 'manager'].includes(user?.role)) return

    try {
      setLoadingLeads(true)
      setLeadMessage('')
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      const response = await fetch(`${API_URL}/leads?${params.toString()}`, {
        headers: getAuthHeaders(),
      })
      const data = await parseResponse(response)
      if (!response.ok || !data.success) {
        setLeadMessage(data.message || 'Erro ao carregar leads.')
        return
      }
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      setLeadMessage('Não foi possível conectar ao servidor.')
    } finally {
      setLoadingLeads(false)
    }
  }

  const fetchDashboardMetrics = async () => {
    if (!['admin', 'manager'].includes(user?.role)) return

    try {
      const response = await fetch(`${API_URL}/leads/metrics`, {
        headers: getAuthHeaders(),
      })
      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        return
      }

      setDashboardMetrics(data.metrics)
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
    }
  }

  const refreshDashboard = async () => {
    setRefreshingDashboard(true)

    await Promise.allSettled([
      fetchProjects(),
      fetchServices(),
      fetchMessages(),
      fetchUsers(),
      fetchDashboardMetrics(),
    ])

    setLastDashboardUpdate(new Date())
    setRefreshingDashboard(false)
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileMessage('')

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ name: profileName }),
      })
      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setProfileMessage(data.message || 'Não foi possível atualizar o perfil.')
        return
      }

      updateUser({ ...user, ...data.user })
      setProfileMessage('Perfil atualizado com sucesso.')
      showToast('Perfil atualizado com sucesso.')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setProfileMessage('Não foi possível conectar ao servidor.')
    }
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0]

    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfileMessage('Use uma imagem JPG, PNG ou WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage('A imagem deve ter no máximo 5 MB.')
      return
    }

    setUploadingAvatar(true)
    setProfileMessage('Enviando foto...')

    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch(`${API_URL}/users/profile/avatar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      })
      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Não foi possível atualizar a foto.')
      }

      updateUser({ ...user, ...data.user })
      setProfileMessage('Foto de perfil atualizada.')
      showToast('Foto de perfil atualizada.')
    } catch (error) {
      setProfileMessage(error.message || 'Não foi possível atualizar a foto.')
      showToast(error.message || 'Não foi possível atualizar a foto.', 'error')
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }

  const handleLeadStatus = async (id, status, changes = {}) => {
    try {
      const response = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status, ...changes }),
      })
      const data = await parseResponse(response)
      if (!response.ok || !data.success) {
        setLeadMessage(data.message || 'Erro ao atualizar lead.')
        return
      }
      setLeads((previous) => previous.map((lead) => lead.id === id ? data.lead : lead))
      setLeadMessage('Lead atualizado com sucesso.')
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      setLeadMessage('Não foi possível conectar ao servidor.')
    }
  }

  const toggleLeadHistory = async (leadId) => {
    if (expandedLeadId === leadId) {
      setExpandedLeadId(null)
      return
    }

    setExpandedLeadId(leadId)

    if (leadHistory[leadId]) {
      return
    }

    try {
      setLoadingLeadHistory(leadId)
      const response = await fetch(`${API_URL}/leads/${leadId}/history`, {
        headers: getAuthHeaders(),
      })
      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setLeadMessage(data.message || 'Não foi possível carregar o histórico.')
        return
      }

      setLeadHistory((previous) => ({ ...previous, [leadId]: data.history || [] }))
    } catch (error) {
      console.error('Erro ao buscar histórico do lead:', error)
      setLeadMessage('Não foi possível conectar ao servidor.')
    } finally {
      setLoadingLeadHistory(null)
    }
  }

  const handleUpdateUserRole = async (id, role) => {
    try {
      setUserManagementMessage('')

      const response = await fetch(`${API_URL}/users/${id}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ role }),
      })
      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setUserManagementMessage(
          data.message || 'Erro ao atualizar perfil.'
        )
        return
      }

      setAdminUsers((previous) =>
        previous.map((item) =>
          Number(item.id) === Number(id) ? data.user : item
        )
      )
      setUserManagementMessage('Perfil atualizado com sucesso.')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setUserManagementMessage('Não foi possível conectar ao servidor.')
    }
  }

  const handleMessageChange = (event) => {
    const { name, value } = event.target

    setMessageForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    setMessageError('')
    setMessageSuccess('')

    if (!messageForm.recipient_id) {
      setMessageError(
        'Selecione um destinatário.'
      )
      return
    }

    if (!messageForm.message.trim()) {
      setMessageError(
        'Digite uma mensagem.'
      )
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/messages`,
        {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            recipient_id: Number(
              messageForm.recipient_id
            ),
            subject:
              messageForm.subject.trim(),
            message:
              messageForm.message.trim(),
          }),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setMessageError(
          data.message ||
            'Erro ao enviar mensagem.'
        )
        return
      }

      setMessageForm({
        recipient_id: '',
        subject: '',
        message: '',
      })

      setShowCompose(false)

      setMessageSuccess(
        'Mensagem enviada com sucesso.'
      )

      await fetchMessages()
    } catch (error) {
      console.error(
        'Erro ao enviar mensagem:',
        error
      )

      setMessageError(
        'Não foi possível conectar ao servidor.'
      )
    }
  }

  const handleSendToAdmin = () => {
    const admin = users.find(
      (item) =>
        item.email?.toLowerCase() ===
        'admin@tks.com'
    )

    if (!admin) {
      setMessageError(
        'A conta admin@tks.com não foi encontrada.'
      )
      return
    }

    setMessageForm((previous) => ({
      ...previous,
      recipient_id: String(admin.id),
    }))

    setShowCompose(true)
    setMessageError('')
    setMessageSuccess('')
  }

  const handleMarkMessageAsRead = async (id) => {
    const messageId = Number(id)

    if (!messageId || Number.isNaN(messageId)) {
      setMessageError(
        'ID da mensagem inválido.'
      )
      return
    }

    try {
      setMessageError('')
      setMessageSuccess('')

      const response = await fetch(
        `${API_URL}/messages/${messageId}/read`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setMessageError(
          data.message ||
            'Erro ao marcar mensagem como lida.'
        )
        return
      }

      setMessages((previous) =>
        previous.map((message) =>
          Number(message.id) === messageId
            ? {
                ...message,
                read: true,
              }
            : message
        )
      )

      setConversationMessages((previous) =>
        previous.map((message) =>
          Number(message.id) === messageId
            ? {
                ...message,
                read: true,
              }
            : message
        )
      )
    } catch (error) {
      console.error(
        'Erro ao marcar mensagem como lida:',
        error
      )

      setMessageError(
        'Não foi possível conectar ao servidor.'
      )
    }
  }

  const handleDeleteMessage = async (id) => {
    const messageId = Number(id)

    if (!messageId || Number.isNaN(messageId)) {
      setMessageError(
        'ID da mensagem inválido.'
      )
      return
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta mensagem?'
    )

    if (!confirmed) {
      return
    }

    try {
      setMessageError('')

      const response = await fetch(
        `${API_URL}/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setMessageError(
          data.message ||
            'Erro ao excluir mensagem.'
        )
        return
      }

      setMessages((previous) =>
        previous.filter(
          (message) =>
            Number(message.id) !== messageId
        )
      )

      setConversationMessages((previous) =>
        previous.filter(
          (message) =>
            Number(message.id) !== messageId
        )
      )
    } catch (error) {
      console.error(
        'Erro ao excluir mensagem:',
        error
      )

      setMessageError(
        'Não foi possível conectar ao servidor.'
      )
    }
  }

  // =========================
  // CONVERSA
  // =========================

  const openConversation = async (selectedUser) => {
    if (!selectedUser) {
      return
    }

    setConversationUser(selectedUser)
    setLoadingConversation(true)
    setMessageError('')

    try {
      const response = await fetch(
        `${API_URL}/messages`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setMessageError(
          data.message ||
            'Erro ao carregar conversa.'
        )
        return
      }

      const allMessages = data.messages || []

      setMessages(allMessages)

      const currentUserId = Number(user.id)
      const selectedUserId = Number(selectedUser.id)

      const conversation = allMessages
        .filter((message) => {
          const senderId = Number(message.sender_id)
          const recipientId = Number(message.recipient_id)

          return (
            (senderId === currentUserId &&
              recipientId === selectedUserId) ||
            (senderId === selectedUserId &&
              recipientId === currentUserId)
          )
        })
        .sort(
          (a, b) =>
            new Date(a.created_at) -
            new Date(b.created_at)
        )

      setConversationMessages(conversation)
    } catch (error) {
      console.error(
        'Erro ao abrir conversa:',
        error
      )

      setMessageError(
        'Não foi possível carregar a conversa.'
      )
    } finally {
      setLoadingConversation(false)
    }
  }

  const handleSendConversationMessage = async (
    event
  ) => {
    event.preventDefault()

    if (
      !conversationUser ||
      !conversationText.trim()
    ) {
      return
    }

    try {
      setSendingConversation(true)
      setMessageError('')

      const response = await fetch(
        `${API_URL}/messages`,
        {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            recipient_id: Number(
              conversationUser.id
            ),
            subject: '',
            message:
              conversationText.trim(),
          }),
        }
      )

      const data = await parseResponse(response)

      if (!response.ok || !data.success) {
        setMessageError(
          data.message ||
            'Erro ao enviar mensagem.'
        )
        return
      }

      const sentMessage = data.data

      setConversationText('')

      if (sentMessage) {
        setMessages((previous) => {
          const exists = previous.some(
            (message) =>
              Number(message.id) ===
              Number(sentMessage.id)
          )

          if (exists) {
            return previous
          }

          return [
            sentMessage,
            ...previous,
          ]
        })

        setConversationMessages((previous) => {
          const exists = previous.some(
            (message) =>
              Number(message.id) ===
              Number(sentMessage.id)
          )

          if (exists) {
            return previous
          }

          return [
            ...previous,
            sentMessage,
          ]
        })
      }
    } catch (error) {
      console.error(
        'Erro ao enviar mensagem da conversa:',
        error
      )

      setMessageError(
        'Não foi possível enviar a mensagem.'
      )
    } finally {
      setSendingConversation(false)
    }
  }

  // =========================
  // SOCKET.IO
  // =========================

  useEffect(() => {
    if (!token || !user?.id) {
      return
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    })

    socket.on('connect', () => {
      console.log(
        '🟢 Socket conectado:',
        socket.id
      )

      socket.emit(
        'join_chat',
        Number(user.id)
      )
    })

    socket.on('new_message', (newMessage) => {
      console.log(
        '📩 Nova mensagem recebida:',
        newMessage
      )

      setMessages((previous) => {
        const exists = previous.some(
          (message) =>
            Number(message.id) ===
            Number(newMessage.id)
        )

        if (exists) {
          return previous
        }

        return [
          newMessage,
          ...previous,
        ]
      })

      setConversationMessages((previous) => {
        if (!conversationUser) {
          return previous
        }

        const currentUserId = Number(user.id)
        const selectedUserId =
          Number(conversationUser.id)

        const senderId =
          Number(newMessage.sender_id)

        const recipientId =
          Number(newMessage.recipient_id)

        const belongsToConversation =
          (senderId === currentUserId &&
            recipientId === selectedUserId) ||
          (senderId === selectedUserId &&
            recipientId === currentUserId)

        if (!belongsToConversation) {
          return previous
        }

        const exists = previous.some(
          (message) =>
            Number(message.id) ===
            Number(newMessage.id)
        )

        if (exists) {
          return previous
        }

        return [
          ...previous,
          newMessage,
        ]
      })
    })

    socket.on('message_sent', (newMessage) => {
      console.log(
        '📤 Mensagem enviada:',
        newMessage
      )

      setMessages((previous) => {
        const exists = previous.some(
          (message) =>
            Number(message.id) ===
            Number(newMessage.id)
        )

        if (exists) {
          return previous
        }

        return [
          newMessage,
          ...previous,
        ]
      })

      setConversationMessages((previous) => {
        if (!conversationUser) {
          return previous
        }

        const currentUserId = Number(user.id)
        const selectedUserId =
          Number(conversationUser.id)

        const senderId =
          Number(newMessage.sender_id)

        const recipientId =
          Number(newMessage.recipient_id)

        const belongsToConversation =
          (senderId === currentUserId &&
            recipientId === selectedUserId) ||
          (senderId === selectedUserId &&
            recipientId === currentUserId)

        if (!belongsToConversation) {
          return previous
        }

        const exists = previous.some(
          (message) =>
            Number(message.id) ===
            Number(newMessage.id)
        )

        if (exists) {
          return previous
        }

        return [
          ...previous,
          newMessage,
        ]
      })
    })

    socket.on('disconnect', () => {
      console.log(
        '🔴 Socket desconectado'
      )
    })

    socket.on('connect_error', (error) => {
      console.error(
        'Erro Socket.IO:',
        error
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [
    token,
    user?.id,
    conversationUser,
  ])

  // =========================
  // CARREGAR
  // =========================

  useEffect(() => {
    if (!token) {
      return
    }

    fetchProjects()
    fetchServices()
    fetchMessages()
    fetchUsers()
    fetchDashboardMetrics()
  }, [token])

  // =========================
  // ALTERAR SEÇÃO
  // =========================

  const changeSection = (section) => {
    setActiveSection(section)
    setSidebarOpen(false)

    setProjectMessage('')
    setServiceMessage('')
    setMessageError('')
    setMessageSuccess('')

    if (section === 'projects') {
      fetchProjects()
    }

    if (section === 'services') {
      fetchServices()
    }

    if (section === 'messages') {
      fetchMessages()
      fetchUsers()
    }

    if (section === 'users') {
      fetchAdminUsers()
    }

    if (section === 'leads') {
      fetchLeads()
    }

    if (section === 'dashboard') {
      fetchDashboardMetrics()
    }
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    logout()

    navigate('/login', {
      replace: true,
    })
  }

  // =========================
  // CONTEÚDO
  // =========================

  const renderLoadingSkeleton = (count = 3) => (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={`skeleton-${index}`}>
          <div className="skeleton-thumb" />
          <div className="skeleton-lines">
            <span className="skeleton-line short" />
            <span className="skeleton-line" />
            <span className="skeleton-line medium" />
          </div>
        </div>
      ))}
    </div>
  )

  const renderContent = () => {
    if (activeSection === 'projects') {
      return (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span>GERENCIAMENTO</span>
              <h2>Projetos</h2>
              <p>
                Gerencie os projetos da TKS.
              </p>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setShowProjectForm(
                  (previous) => !previous
                )
              }
            >
              {showProjectForm
                ? 'Fechar'
                : '+ Novo projeto'}
            </button>
          </div>

          {projectMessage && (
            <div className="dashboard-message success-message">
              <span>✓</span>
              {projectMessage}
            </div>
          )}

          {toast && (
            <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
              <span>{toast.type === 'error' ? '!' : '✓'}</span>
              {toast.message}
            </div>
          )}

          {showProjectForm && (
            <div className="content-card project-form-card">
              <div className="card-header">
                <span>{editingProjectId ? 'EDITAR PROJETO' : 'NOVO PROJETO'}</span>
                <h3>{editingProjectId ? 'Atualizar projeto' : 'Cadastrar projeto'}</h3>
              </div>

              <form
                className="project-form"
                onSubmit={handleCreateProject}
              >
                <div className="form-group">
                  <label htmlFor="project-title">
                    Título
                  </label>

                  <input
                    id="project-title"
                    type="text"
                    name="title"
                    value={projectForm.title}
                    onChange={handleProjectChange}
                    placeholder="Nome do projeto"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-description">
                    Descrição
                  </label>

                  <textarea
                    id="project-description"
                    name="description"
                    value={
                      projectForm.description
                    }
                    onChange={handleProjectChange}
                    placeholder="Descrição do projeto"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-category">
                    Categoria
                  </label>

                  <input
                    id="project-category"
                    type="text"
                    name="category"
                    value={projectForm.category}
                    onChange={handleProjectChange}
                    placeholder="Ex.: Web, Segurança, IA"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-image">
                    Imagem
                  </label>

                  <input
                    id="project-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProjectImageChange}
                    disabled={uploadingProjectImage}
                  />
                  {projectForm.image && (
                    <img
                      src={projectForm.image}
                      alt="Pré-visualização do projeto"
                      className="project-upload-preview"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="project-link">
                    Link
                  </label>

                  <input
                    id="project-link"
                    type="url"
                    name="link"
                    value={projectForm.link}
                    onChange={handleProjectChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      setShowProjectForm(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-action"
                  >
                    {editingProjectId ? 'Salvar alterações' : 'Criar projeto'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <span>PROJETOS CADASTRADOS</span>
              <h3>Seus projetos</h3>
            </div>

            {projects.length > 0 && (
              <div className="list-toolbar">
                <div className="dashboard-toolbar-summary">
                  <span className="toolbar-pill">{projects.length} itens</span>
                  <span className="toolbar-pill muted">{projectCategories.length} categorias</span>
                </div>

                <input
                  className="dashboard-search"
                  type="search"
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                  placeholder="Buscar por nome ou descrição"
                  aria-label="Buscar projetos"
                />

                <label htmlFor="project-filter">Filtrar</label>
                <select
                  id="project-filter"
                  value={projectFilter}
                  onChange={(event) => setProjectFilter(event.target.value)}
                >
                  <option value="all">Todas as categorias</option>
                  {projectCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {loadingProjects ? (
              renderLoadingSkeleton(3)
            ) : projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ◈
                </div>

                <h3>
                  Nenhum projeto cadastrado
                </h3>

                <p>
                  Cadastre seu primeiro projeto
                  usando o botão acima.
                </p>

                <button
                  className="primary-action"
                  onClick={() =>
                    setShowProjectForm(true)
                  }
                >
                  Criar projeto
                </button>
              </div>
            ) : (
              <div className="projects-list">
                {filteredProjects.length === 0 ? (
                  <div className="empty-state compact-empty-state">
                    <h3>Nenhum projeto encontrado</h3>
                    <p>Teste outro filtro ou ajuste a busca para localizar o item desejado.</p>
                  </div>
                ) : filteredProjects.map((project) => (
                  <div
                    className="project-item"
                    key={project.id}
                  >
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="project-image"
                      />
                    ) : (
                      <div className="project-image-placeholder">
                        ◈
                      </div>
                    )}

                    <div className="project-info">
                      <div className="project-meta-row">
                        <span className="project-badge">{project.category || 'Geral'}</span>
                        <span className="project-date">{project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR') : 'Recente'}</span>
                      </div>

                      <h3>{project.title}</h3>

                      <p>
                        {project.description ||
                          'Sem descrição.'}
                      </p>

                      <div className="project-inline-links">
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver projeto ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="secondary-action"
                      onClick={() => handleEditProject(project)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="delete-action"
                      onClick={() =>
                        handleDeleteProject(
                          project.id
                        )
                      }
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )
    }

    if (activeSection === 'services') {
      return (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span>GERENCIAMENTO</span>
              <h2>Serviços</h2>
              <p>
                Gerencie os serviços da TKS.
              </p>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setShowServiceForm(
                  (previous) => !previous
                )
              }
            >
              {showServiceForm
                ? 'Fechar'
                : '+ Novo serviço'}
            </button>
          </div>

          {serviceMessage && (
            <div className="dashboard-message success-message">
              <span>✓</span>
              {serviceMessage}
            </div>
          )}

          {toast && (
            <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
              <span>{toast.type === 'error' ? '!' : '✓'}</span>
              {toast.message}
            </div>
          )}

          {showServiceForm && (
            <div className="content-card project-form-card">
              <div className="card-header">
                <span>{editingServiceId ? 'EDITAR SERVIÇO' : 'NOVO SERVIÇO'}</span>
                <h3>{editingServiceId ? 'Atualizar serviço' : 'Cadastrar serviço'}</h3>
              </div>

              <form
                className="project-form"
                onSubmit={handleCreateService}
              >
                <div className="form-group">
                  <label htmlFor="service-title">
                    Título
                  </label>

                  <input
                    id="service-title"
                    type="text"
                    name="title"
                    value={serviceForm.title}
                    onChange={handleServiceChange}
                    placeholder="Nome do serviço"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service-description">
                    Descrição
                  </label>

                  <textarea
                    id="service-description"
                    name="description"
                    value={
                      serviceForm.description
                    }
                    onChange={handleServiceChange}
                    placeholder="Descrição do serviço"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service-icon">
                    Ícone
                  </label>

                  <input
                    id="service-icon"
                    type="text"
                    name="icon"
                    value={serviceForm.icon}
                    onChange={handleServiceChange}
                    placeholder="Ex.: ◇"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      setShowServiceForm(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-action"
                  >
                    {editingServiceId ? 'Salvar alterações' : 'Criar serviço'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <span>SERVIÇOS CADASTRADOS</span>
              <h3>Seus serviços</h3>
            </div>

            {services.length > 0 && (
              <div className="list-toolbar service-toolbar">
                <div className="dashboard-toolbar-summary">
                  <span className="toolbar-pill">{services.length} itens</span>
                </div>

                <input
                  className="dashboard-search"
                  type="search"
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                  placeholder="Buscar serviço"
                  aria-label="Buscar serviços"
                />
              </div>
            )}

            {loadingServices ? (
              renderLoadingSkeleton(3)
            ) : services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ◇
                </div>

                <h3>
                  Nenhum serviço cadastrado
                </h3>

                <p>
                  Cadastre seu primeiro serviço
                  usando o botão acima.
                </p>

                <button
                  className="primary-action"
                  onClick={() =>
                    setShowServiceForm(true)
                  }
                >
                  Criar serviço
                </button>
              </div>
            ) : (
              <div className="projects-list">
                {filteredServices.length === 0 ? (
                  <div className="empty-state compact-empty-state">
                    <h3>Nenhum serviço encontrado</h3>
                    <p>Use a busca para localizar serviços específicos ou crie um novo item.</p>
                  </div>
                ) : filteredServices.map((service) => (
                  <div
                    className="project-item"
                    key={service.id}
                  >
                    <div className="project-image-placeholder service-icon">
                      {service.icon || '◇'}
                    </div>

                    <div className="project-info">
                      <div className="project-meta-row">
                        <span className="project-badge status-pill">Serviço ativo</span>
                        <span className="project-date">{service.created_at ? new Date(service.created_at).toLocaleDateString('pt-BR') : 'Recente'}</span>
                      </div>

                      <h3>{service.title}</h3>

                      <p>
                        {service.description ||
                          'Sem descrição.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="secondary-action"
                      onClick={() => handleEditService(service)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="delete-action"
                      onClick={() =>
                        handleDeleteService(
                          service.id
                        )
                      }
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )
    }

    if (activeSection === 'messages') {
      return (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span>COMUNICAÇÃO</span>
              <h2>Mensagens</h2>
              <p>
                Caixa de entrada e conversa em
                tempo real.
              </p>
            </div>

            <div className="message-top-actions">
              <button
                className="secondary-action"
                onClick={fetchMessages}
                disabled={loadingMessages}
              >
                {loadingMessages
                  ? 'Atualizando...'
                  : 'Atualizar'}
              </button>

              <button
                className="primary-action"
                onClick={() => {
                  setShowCompose(
                    (previous) => !previous
                  )
                  fetchUsers()
                }}
              >
                {showCompose
                  ? 'Fechar'
                  : '+ Nova mensagem'}
              </button>
            </div>
          </div>

          {messageError && (
            <div className="dashboard-message error-message">
              <span>!</span>
              {messageError}
            </div>
          )}

          {messageSuccess && (
            <div className="dashboard-message success-message">
              <span>✓</span>
              {messageSuccess}
            </div>
          )}

          {showCompose && (
            <div className="content-card message-compose-card">
              <div className="card-header">
                <span>NOVA MENSAGEM</span>
                <h3>Enviar mensagem</h3>
              </div>

              <form
                className="project-form"
                onSubmit={handleSendMessage}
              >
                <div className="form-group">
                  <label htmlFor="recipient_id">
                    Destinatário
                  </label>

                  <select
                    id="recipient_id"
                    name="recipient_id"
                    value={
                      messageForm.recipient_id
                    }
                    onChange={handleMessageChange}
                    disabled={loadingUsers}
                  >
                    <option value="">
                      {loadingUsers
                        ? 'Carregando usuários...'
                        : 'Selecione um destinatário'}
                    </option>

                    {users.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name} — {item.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message-subject">
                    Assunto
                  </label>

                  <input
                    id="message-subject"
                    type="text"
                    name="subject"
                    value={
                      messageForm.subject
                    }
                    onChange={handleMessageChange}
                    placeholder="Assunto da mensagem"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message-content">
                    Mensagem
                  </label>

                  <textarea
                    id="message-content"
                    name="message"
                    value={
                      messageForm.message
                    }
                    onChange={handleMessageChange}
                    placeholder="Digite sua mensagem..."
                    rows="7"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => {
                      setShowCompose(false)

                      setMessageForm({
                        recipient_id: '',
                        subject: '',
                        message: '',
                      })
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-action"
                  >
                    Enviar mensagem
                  </button>
                </div>
              </form>

              <div className="admin-message-shortcut">
                <span>
                  Enviar diretamente para o
                  administrador:
                </span>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={handleSendToAdmin}
                >
                  admin@tks.com
                </button>
              </div>
            </div>
          )}

          <div className="message-summary">
            <div>
              <strong>{messages.length}</strong>
              <span>Total</span>
            </div>

            <div className="message-summary-unread">
              <strong>
                {unreadMessages}
              </strong>
              <span>Não lidas</span>
            </div>

            <div>
              <strong>{messages.length - receivedMessages.length}</strong>
              <span>Enviadas</span>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <span>CONVERSAS</span>
              <h3>Conversas em tempo real</h3>
            </div>

            {users.length === 0 ? (
              <div className="empty-state">
                <h3>Nenhum usuário disponível</h3>
              </div>
            ) : (
              <div className="conversation-users">
                {users
                  .filter(
                    (item) =>
                      Number(item.id) !==
                      Number(user?.id)
                  )
                  .map((item) => {
                    const conversationCount =
                      messages.filter(
                        (message) => {
                          const senderId =
                            Number(
                              message.sender_id
                            )

                          const recipientId =
                            Number(
                              message.recipient_id
                            )

                          const currentId =
                            Number(user?.id)

                          const otherId =
                            Number(item.id)

                          return (
                            (senderId ===
                              currentId &&
                              recipientId ===
                                otherId) ||
                            (senderId ===
                              otherId &&
                              recipientId ===
                                currentId)
                          )
                        }
                      ).length

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`conversation-user ${
                          conversationUser &&
                          Number(
                            conversationUser.id
                          ) === Number(item.id)
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          openConversation(item)
                        }
                      >
                        <div className="message-avatar">
                          {(item.name || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="conversation-user-info">
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.email}
                          </span>
                        </div>

                        {conversationCount >
                          0 && (
                          <small>
                            {conversationCount}
                          </small>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>

          {conversationUser && (
            <div className="content-card realtime-chat-card">
              <div className="chat-header">
                <div className="message-sender">
                  <div className="message-avatar">
                    {(
                      conversationUser.name ||
                      'U'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {conversationUser.name}
                    </strong>

                    <span>
                      {conversationUser.email}
                    </span>
                  </div>
                </div>

                <div className="chat-online">
                  <span></span>
                  Conversa ativa
                </div>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    setConversationUser(null)
                  }
                >
                  Fechar
                </button>
              </div>

              <div className="chat-messages">
                {loadingConversation ? (
                  <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <h3>
                      Carregando conversa...
                    </h3>
                  </div>
                ) : conversationMessages.length ===
                  0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      💬
                    </div>

                    <h3>
                      Nenhuma mensagem ainda
                    </h3>

                    <p>
                      Envie a primeira mensagem
                      para iniciar a conversa.
                    </p>
                  </div>
                ) : (
                  conversationMessages.map(
                    (message) => {
                      const isMine =
                        Number(
                          message.sender_id
                        ) === Number(user?.id)

                      return (
                        <div
                          key={message.id}
                          className={`chat-message ${
                            isMine
                              ? 'chat-message-mine'
                              : 'chat-message-other'
                          }`}
                        >
                          <div className="chat-bubble">
                            <p>
                              {message.message}
                            </p>

                            <small>
                              {message.created_at
                                ? new Date(
                                    message.created_at
                                  ).toLocaleTimeString(
                                    'pt-BR',
                                    {
                                      hour: '2-digit',
                                      minute:
                                        '2-digit',
                                    }
                                  )
                                : ''}
                            </small>
                          </div>
                        </div>
                      )
                    }
                  )
                )}
              </div>

              <form
                className="chat-input-area"
                onSubmit={
                  handleSendConversationMessage
                }
              >
                <textarea
                  value={conversationText}
                  onChange={(event) =>
                    setConversationText(
                      event.target.value
                    )
                  }
                  placeholder="Digite sua mensagem..."
                  rows="2"
                  disabled={
                    sendingConversation
                  }
                />

                <button
                  type="submit"
                  className="primary-action"
                  disabled={
                    sendingConversation ||
                    !conversationText.trim()
                  }
                >
                  {sendingConversation
                    ? 'Enviando...'
                    : 'Enviar'}
                </button>
              </form>
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <span>CAIXA DE ENTRADA</span>
              <h3>Mensagens recebidas</h3>
            </div>

            {loadingMessages ? (
              <div className="empty-state">
                <div className="loading-spinner"></div>
                <h3>
                  Carregando mensagens...
                </h3>
              </div>
            ) : receivedMessages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ✉
                </div>

                <h3>Nenhuma mensagem</h3>

                <p>
                  Quando alguém enviar uma
                  mensagem para sua conta,
                  ela aparecerá aqui.
                </p>

                <button
                  className="primary-action"
                  onClick={() => {
                    setShowCompose(true)
                    fetchUsers()
                  }}
                >
                  Nova mensagem
                </button>
              </div>
            ) : (
              <div className="messages-list">
                {receivedMessages.map((message) => (
                  <article
                    className={`message-item ${
                      message.read
                        ? 'message-read'
                        : 'message-unread'
                    }`}
                    key={message.id}
                  >
                    <div className="message-status-line">
                      {!message.read && (
                        <span className="unread-label">
                          NOVA MENSAGEM
                        </span>
                      )}

                      <span className="message-id">
                        #{message.id}
                      </span>
                    </div>

                    <div className="message-header">
                      <div className="message-sender">
                        <div className="message-avatar">
                          {(
                            message.sender_name ||
                            message.name ||
                            'U'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {message.sender_name ||
                              message.name ||
                              'Usuário'}
                          </strong>

                          <span>
                            {message.sender_email ||
                              message.email ||
                              ''}
                          </span>
                        </div>
                      </div>

                      <small>
                        {message.created_at
                          ? new Date(
                              message.created_at
                            ).toLocaleString(
                              'pt-BR'
                            )
                          : ''}
                      </small>
                    </div>

                    {message.subject && (
                      <h3 className="message-subject">
                        {message.subject}
                      </h3>
                    )}

                    <p className="message-content">
                      {message.message}
                    </p>

                    <div className="message-actions">
                      <button
                        className="secondary-action"
                        onClick={() => {
                          const otherUser =
                            users.find(
                              (item) =>
                                Number(
                                  item.id
                                ) ===
                                Number(
                                  message.sender_id
                                )
                            )

                          if (otherUser) {
                            openConversation(
                              otherUser
                            )
                          }
                        }}
                      >
                        💬 Responder
                      </button>

                      {!message.read && (
                        <button
                          className="secondary-action"
                          onClick={() =>
                            handleMarkMessageAsRead(
                              message.id
                            )
                          }
                        >
                          ✓ Marcar como lida
                        </button>
                      )}

                      {message.read && (
                        <span className="read-label">
                          ✓ Lida
                        </span>
                      )}

                      <button
                        className="delete-action"
                        onClick={() =>
                          handleDeleteMessage(
                            message.id
                          )
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )
    }

    if (activeSection === 'users') {
      return (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span>ADMINISTRAÇÃO</span>
              <h2>Usuários</h2>
              <p>Gerencie os acessos e perfis da equipe.</p>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <span>ACESSOS</span>
              <h3>Equipe e permissões</h3>
            </div>

            {userManagementMessage && (
              <div className="dashboard-message success-message">
                <span>✓</span>
                {userManagementMessage}
              </div>
            )}

            {loadingAdminUsers ? (
              <div className="empty-state"><div className="loading-spinner"></div><h3>Carregando usuários...</h3></div>
            ) : (
              <div className="admin-users-list">
                {adminUsers.map((item) => {
                  const isCurrentUser = Number(item.id) === Number(user?.id)

                  return (
                    <div className="user-row" key={item.id}>
                      <div className="user-avatar">{(item.name || 'U').charAt(0).toUpperCase()}</div>
                      <div className="user-info">
                        <strong>{item.name}</strong>
                        <span>{item.email}</span>
                      </div>
                      <select
                        className="user-role-select"
                        value={item.role || 'client'}
                        disabled={isCurrentUser}
                        onChange={(event) => handleUpdateUserRole(item.id, event.target.value)}
                        aria-label={`Perfil de ${item.name}`}
                      >
                        <option value="admin">Administrador</option>
                        <option value="manager">Gestor</option>
                        <option value="client">Cliente</option>
                      </select>
                      <div className="user-status">{isCurrentUser ? 'Sua conta' : 'Ativo'}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )
    }

    if (activeSection === 'leads') {
      return (
        <section className="dashboard-section">
          <div className="section-heading">
            <div><span>COMERCIAL</span><h2>Leads</h2><p>Organize os contatos e avance cada oportunidade.</p></div>
          </div>

          <div className="content-card">
            <div className="lead-filters">
              <input value={leadSearch} onChange={(event) => setLeadSearch(event.target.value)} placeholder="Buscar por nome, e-mail ou assunto" />
              <select value={leadStatus} onChange={(event) => setLeadStatus(event.target.value)}>
                <option value="">Todos os status</option><option value="new">Novo</option><option value="in_progress">Em atendimento</option><option value="proposal">Proposta enviada</option><option value="won">Fechado</option><option value="lost">Perdido</option>
              </select>
              <button className="secondary-action" onClick={() => fetchLeads()}>Filtrar</button>
            </div>

            {leadMessage && <div className="dashboard-message success-message"><span>✓</span>{leadMessage}</div>}

            {loadingLeads ? <div className="empty-state"><div className="loading-spinner"></div><h3>Carregando leads...</h3></div> : leads.length === 0 ? <div className="empty-state"><div className="empty-icon">◌</div><h3>Nenhum lead encontrado</h3><p>Novos contatos do site aparecerão aqui.</p></div> : (
              <div className="lead-pipeline">
                {[
                  ['new', 'Novos'],
                  ['in_progress', 'Em atendimento'],
                  ['proposal', 'Propostas'],
                  ['won', 'Fechados'],
                  ['lost', 'Perdidos'],
                ].map(([status, label]) => {
                  const columnLeads = leads.filter((lead) => lead.status === status)

                  return (
                    <section className={`lead-column lead-column-${status}`} key={status}>
                      <header className="lead-column-header">
                        <div>
                          <span>{label}</span>
                          <strong>{columnLeads.length}</strong>
                        </div>
                        <span className="lead-column-dot" aria-hidden="true" />
                      </header>

                      <div className="lead-column-list">
                        {columnLeads.length === 0 ? (
                          <div className="lead-column-empty">Nenhum lead nesta etapa</div>
                        ) : columnLeads.map((lead) => (
                          <article className="lead-card" key={lead.id}>
                            <div className="lead-card-header">
                              <span className="lead-date">{lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : ''}</span>
                              <span className="lead-card-id">#{lead.id}</span>
                            </div>
                            <h3>{lead.name}</h3>
                            <a href={`mailto:${lead.email}`}>{lead.email}</a>
                            <div className="lead-card-subject">{lead.subject}</div>
                            <p>{lead.message}</p>
                            <small>{[lead.service, lead.timeline, lead.budget].filter(Boolean).join(' · ') || 'Sem informações adicionais'}</small>
                            <button className="lead-history-toggle" type="button" onClick={() => toggleLeadHistory(lead.id)}>
                              {expandedLeadId === lead.id ? 'Ocultar histórico' : 'Ver histórico'}
                            </button>
                            {expandedLeadId === lead.id && (
                              <div className="lead-history" aria-live="polite">
                                {loadingLeadHistory === lead.id ? (
                                  <span>Carregando histórico...</span>
                                ) : (leadHistory[lead.id] || []).length === 0 ? (
                                  <span>Nenhuma alteração registrada.</span>
                                ) : leadHistory[lead.id].map((entry) => (
                                  <div className="lead-history-item" key={entry.id}>
                                    <strong>{entry.status}</strong>
                                    <span>{entry.user_name || 'Sistema'} · {new Date(entry.created_at).toLocaleString('pt-BR')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="lead-controls">
                              <select className="user-role-select" value={lead.status} onChange={(event) => handleLeadStatus(lead.id, event.target.value, { assigned_to: lead.assigned_to, follow_up_at: lead.follow_up_at, notes: lead.notes })} aria-label={`Status de ${lead.name}`}><option value="new">Novo</option><option value="in_progress">Em atendimento</option><option value="proposal">Proposta enviada</option><option value="won">Fechado</option><option value="lost">Perdido</option></select>
                              <select className="lead-assignee" value={lead.assigned_to || ''} onChange={(event) => handleLeadStatus(lead.id, lead.status, { assigned_to: event.target.value || null, follow_up_at: lead.follow_up_at, notes: lead.notes })} aria-label={`Responsável por ${lead.name}`}>
                                <option value="">Sem responsável</option>
                                {users.map((teamUser) => <option key={teamUser.id} value={teamUser.id}>{teamUser.name}</option>)}
                              </select>
                              <input className="lead-follow-up" type="date" value={lead.follow_up_at ? String(lead.follow_up_at).slice(0, 10) : ''} onChange={(event) => handleLeadStatus(lead.id, lead.status, { assigned_to: lead.assigned_to, follow_up_at: event.target.value || null, notes: lead.notes })} aria-label={`Follow-up de ${lead.name}`} />
                              <input className="lead-notes" type="text" value={lead.notes || ''} placeholder="Observação" onChange={(event) => handleLeadStatus(lead.id, lead.status, { assigned_to: lead.assigned_to, follow_up_at: lead.follow_up_at, notes: event.target.value })} aria-label={`Observação de ${lead.name}`} />
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )
    }

    if (activeSection === 'settings') {
      return (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span>SISTEMA</span>
              <h2>Configurações</h2>
              <p>
                Configure sua conta e o sistema
                TKS.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="content-card">
              <h3>Minha conta</h3>

              <form className="profile-editor" onSubmit={handleProfileSave}>
                <div className="profile-preview">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={`Foto de ${user.name || 'usuário'}`} />
                  ) : (
                    <span>{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                  )}
                  <label className="secondary-action" htmlFor="profile-avatar">
                    {uploadingAvatar ? 'Enviando...' : 'Trocar foto'}
                  </label>
                  <input
                    id="profile-avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </div>

                <label className="profile-label" htmlFor="profile-name">Nome de exibição</label>
                <input
                  id="profile-name"
                  className="profile-input"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  maxLength={120}
                  required
                />

                <button className="primary-action" type="submit">Salvar perfil</button>
              </form>

              {profileMessage && <div className="dashboard-message success-message">{profileMessage}</div>}

              <div className="setting-item">
                <span>Nome</span>

                <strong>
                  {user?.name ||
                    'Não informado'}
                </strong>
              </div>

              <div className="setting-item">
                <span>E-mail</span>

                <strong>
                  {user?.email ||
                    'Não informado'}
                </strong>
              </div>

              <div className="setting-item">
                <span>Nível de acesso</span>

                <strong>
                  {user?.role === 'admin'
                    ? 'Administrador'
                    : user?.role === 'manager'
                      ? 'Gestor'
                      : 'Cliente'}
                </strong>
              </div>
            </div>

            <div className="content-card">
              <h3>Segurança</h3>

              <div className="setting-item">
                <span>Autenticação</span>

                <strong className="status-active">
                  Ativa
                </strong>
              </div>

              <div className="setting-item">
                <span>JWT</span>

                <strong className="status-active">
                  Ativo
                </strong>
              </div>

              <button
                className="secondary-action"
                onClick={() =>
                  navigate('/reset-password')
                }
              >
                Alterar senha
              </button>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="dashboard-section">
        <div className="dashboard-welcome">
          <div>
            <span>
              TKS TECHNOLOGY SOLUTIONS
            </span>

            <h2>
              Olá, {user?.name || 'Usuário'}!
            </h2>

            <p>
              Bem-vindo ao painel
              administrativo da TKS.
            </p>
          </div>

          <div className="welcome-status">
            <span></span>
            Sistema online
          </div>
        </div>

        <div className="stats-grid">
          <button
            className="stat-card stat-card-button"
            onClick={() =>
              changeSection('projects')
            }
          >
            <div className="stat-icon">
              ◈
            </div>

            <div>
              <span>PROJETOS</span>

              <strong>
                {projects.length}
              </strong>

              <small>
                Projetos cadastrados
              </small>
            </div>
          </button>

          <button
            className="stat-card stat-card-button"
            onClick={() =>
              changeSection('services')
            }
          >
            <div className="stat-icon">
              ◇
            </div>

            <div>
              <span>SERVIÇOS</span>

              <strong>
                {services.length}
              </strong>

              <small>
                Serviços cadastrados
              </small>
            </div>
          </button>

          <button
            className="stat-card stat-card-button"
            onClick={() =>
              changeSection('messages')
            }
          >
            <div className="stat-icon">
              ✉
            </div>

            <div>
              <span>MENSAGENS</span>

              <strong>
                {messages.length}
              </strong>

              <small>
                {unreadMessages > 0
                  ? `${unreadMessages} não lida(s)`
                  : 'Todas as mensagens lidas'}
              </small>
            </div>

            {unreadMessages > 0 && (
              <span className="stat-alert">
                {unreadMessages}
              </span>
            )}
          </button>

          {['admin', 'manager'].includes(user?.role) && (
            <button
              className="stat-card stat-card-button stat-card-accent"
              onClick={() => changeSection('leads')}
            >
              <div className="stat-icon">
                ◌
              </div>

              <div>
                <span>LEADS</span>

                <strong>
                  {dashboardMetrics ? dashboardLeadTotal : '—'}
                </strong>

                <small>
                  Oportunidades recebidas
                </small>
              </div>
            </button>
          )}

          <button
            className="stat-card stat-card-button"
            onClick={() =>
              changeSection(
                user?.role === 'admin'
                  ? 'users'
                  : 'settings'
              )
            }
          >
            <div className="stat-icon">
              ◉
            </div>

            <div>
              <span>
                {user?.role === 'admin'
                  ? 'USUÁRIOS'
                  : 'CONTA'}
              </span>

              <strong>
                {user?.role === 'admin'
                  ? adminUsers.length || '—'
                  : '1'}
              </strong>

              <small>
                {user?.role === 'admin'
                  ? 'Gerenciar acessos'
                  : 'Você está conectado'}
              </small>
            </div>
          </button>
        </div>

        {['admin', 'manager'].includes(user?.role) && dashboardMetrics && (
          <div className="content-card lead-overview">
            <div className="card-header">
              <span>FUNIL COMERCIAL</span>
              <h3>Leads por etapa</h3>
            </div>

            <div className="lead-overview-grid">
              {[
                ['new', 'Novos'],
                ['in_progress', 'Em atendimento'],
                ['proposal', 'Propostas'],
                ['won', 'Fechados'],
              ].map(([status, label]) => (
                <button key={status} type="button" onClick={() => { setLeadStatus(status); changeSection('leads') }}>
                  <strong>{dashboardMetrics.leads?.[status] || 0}</strong>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="lead-overview-footer">
              <span><strong>{dashboardMetrics.recentLeads || 0}</strong> novos nos últimos 30 dias</span>
              <span><strong>{dashboardMetrics.conversionRate || 0}%</strong> taxa de conversão</span>
            </div>
          </div>
        )}

        <div className="dashboard-columns">
          <div className="content-card">
            <div className="card-header">
              <span>ATIVIDADE</span>

              <h3>
                Atividade recente
              </h3>
            </div>

            {(dashboardMetrics?.activities || []).length > 0 ? dashboardMetrics.activities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-dot"></div>
                <div>
                  <strong>{activity.action}</strong>
                  <p>{activity.name || 'Sistema'} · {new Date(activity.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            )) : (
              <div className="activity-item">
                <div className="activity-dot"></div>
                <div>
                  <strong>Sistema pronto</strong>
                  <p>As atividades administrativas aparecerão aqui.</p>
                </div>
              </div>
            )}

            {unreadMessages > 0 && (
              <div className="activity-item activity-highlight">
                <div className="activity-dot"></div>

                <div>
                  <strong>
                    Novas mensagens
                  </strong>

                  <p>
                    Você possui{' '}
                    {unreadMessages}{' '}
                    mensagem(ns) aguardando
                    leitura.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="content-card">
            <div className="card-header">
              <span>STATUS</span>

              <h3>Sistema</h3>
            </div>

            <div className="system-status">
              <div>
                <span className="status-indicator"></span>
                <strong>Frontend</strong>
              </div>

              <span className="status-active">
                Online
              </span>
            </div>

            <div className="system-status">
              <div>
                <span className="status-indicator"></span>
                <strong>API</strong>
              </div>

              <span className="status-active">
                Online
              </span>
            </div>

            <div className="system-status">
              <div>
                <span className="status-indicator"></span>
                <strong>Autenticação</strong>
              </div>

              <span className="status-active">
                Ativa
              </span>
            </div>

            <div className="system-status">
              <div>
                <span className="status-indicator"></span>
                <strong>PostgreSQL</strong>
              </div>

              <span className="status-active">
                Conectado
              </span>
            </div>
          </div>
        </div>

        <div className="content-card quick-actions">
          <div className="card-header">
            <span>ATALHOS</span>

            <h3>
              Ações rápidas
            </h3>
          </div>

          <div className="quick-actions-grid">
            <button
              onClick={() =>
                changeSection('projects')
              }
            >
              <strong>+ Projeto</strong>

              <span>
                Adicionar projeto
              </span>
            </button>

            <button
              onClick={() =>
                changeSection('services')
              }
            >
              <strong>+ Serviço</strong>

              <span>
                Adicionar serviço
              </span>
            </button>

            <button
              className={
                unreadMessages > 0
                  ? 'quick-action-alert'
                  : ''
              }
              onClick={() =>
                changeSection('messages')
              }
            >
              <strong>
                Mensagens
                {unreadMessages > 0 &&
                  ` (${unreadMessages})`}
              </strong>

              <span>
                Ver mensagens
              </span>
            </button>

            <button
              onClick={() =>
                changeSection('settings')
              }
            >
              <strong>
                Configurações
              </strong>

              <span>
                Configurar sistema
              </span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  // =========================
  // INTERFACE
  // =========================

  return (
    <div className="dashboard-layout">
      <button
        className="dashboard-mobile-toggle"
        onClick={() =>
          setSidebarOpen(
            (previous) => !previous
          )
        }
        aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-navigation"
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        id="dashboard-navigation"
        className={`dashboard-sidebar ${
          sidebarOpen ? 'open' : ''
        }`}
      >
        <div className="sidebar-brand">
          <span>TKS</span>

          <small>
            TECHNOLOGY
            <br />
            SOLUTIONS
          </small>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : (user?.name || 'U').charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>
              {user?.name || 'Usuário'}
            </strong>

            <span>
              Conta autenticada
            </span>
          </div>
        </div>

        <nav className="dashboard-navigation">
          <span className="navigation-title">
            MENU PRINCIPAL
          </span>

          {menuItems.map((item) => (
            <button
              key={item.id}
              className={
                activeSection === item.id
                  ? 'active'
                  : ''
              }
              onClick={() =>
                changeSection(item.id)
              }
            >
              <span className="navigation-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

              {item.id === 'messages' &&
                unreadMessages > 0 && (
                  <span className="navigation-badge">
                    {unreadMessages}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>⇥</span>
            Sair da conta
          </button>

          <span className="sidebar-version">
            TKS ADMIN v1.0
          </span>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="topbar-section">
              PAINEL ADMINISTRATIVO
            </span>

            <h1>
              {activeSection === 'dashboard'
                ? 'Visão geral'
                : menuItems.find(
                    (item) =>
                      item.id === activeSection
                  )?.label}
            </h1>

            <span className="dashboard-sync-status">
              {lastDashboardUpdate
                ? `Atualizado às ${lastDashboardUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Sincronização automática ativa'}
            </span>
          </div>

          <div className="topbar-actions">
            <button
              className="dashboard-refresh-button"
              type="button"
              onClick={refreshDashboard}
              disabled={refreshingDashboard}
            >
              <span aria-hidden="true">↻</span>
              {refreshingDashboard ? 'Atualizando...' : 'Atualizar dados'}
            </button>

            <div className="topbar-account">
            <div className="topbar-avatar">
              {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : (user?.name || 'U').charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.name || 'Usuário'}
              </strong>

              <span>
                {user?.email || ''}
              </span>
            </div>
          </div>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>

        <footer className="dashboard-footer">
          <span>
            © 2026 TKS Technology Solutions
          </span>

          <span>
            Painel Administrativo
          </span>
        </footer>
      </main>
    </div>
  )
}

export default DashboardPage
