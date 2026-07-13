import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" expand="md" className="mb-4">
        <Container>
          <Navbar.Brand>financeiroLoja</Navbar.Brand>
          <Navbar.Toggle aria-controls="nav-principal" />
          <Navbar.Collapse id="nav-principal">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/dashboard" data-test="mnu_dashboard">
                Dashboard
              </Nav.Link>
              <Nav.Link as={NavLink} to="/lancamentos" data-test="mnu_lancamentos">
                Lançamentos
              </Nav.Link>
            </Nav>
            <Nav className="align-items-md-center gap-2">
              <Navbar.Text>{usuario?.nome}</Navbar.Text>
              <Button
                variant="outline-light"
                size="sm"
                data-test="mnu_btn_logout"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <Outlet />
      </Container>
    </>
  )
}
