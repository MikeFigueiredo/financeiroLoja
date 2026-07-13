import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
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
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '360px' }}>
        <Card.Body>
          <Card.Title className="mb-3 text-center">financeiroLoja</Card.Title>
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
    </Container>
  )
}
