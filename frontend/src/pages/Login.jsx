import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setEntrando(true)
    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível entrar. Tente novamente.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <Card className="login-card" style={{ width: '380px' }}>
        <Card.Body className="p-4">
          <div className="login-brand mb-1">
            <i className="bi bi-graph-up-arrow" />
            financeiroLoja
          </div>
          <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Gestão financeira da sua loja
          </p>
          {erro && (
            <Alert variant="danger" data-test="login_msg_erro">
              {erro}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                data-test="login_input_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                data-test="login_input_senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              data-test="login_btn_submit"
              disabled={entrando}
            >
              {entrando ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
