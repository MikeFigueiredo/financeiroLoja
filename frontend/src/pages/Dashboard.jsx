import { useEffect, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import api from '../services/api'

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

export function Dashboard() {
  const [resumo, setResumo] = useState(null)

  useEffect(() => {
    api.get('/lancamentos/resumo').then(({ data }) => setResumo(data))
  }, [])

  const cards = [
    {
      titulo: 'Total a Receber',
      valor: formatarMoeda(resumo?.totalReceber),
      dataTest: 'dash_card_total_receber',
      variant: 'success',
      icon: 'bi-arrow-down-circle',
    },
    {
      titulo: 'Total a Pagar',
      valor: formatarMoeda(resumo?.totalPagar),
      dataTest: 'dash_card_total_pagar',
      variant: 'danger',
      icon: 'bi-arrow-up-circle',
    },
    {
      titulo: 'Saldo em Caixa',
      valor: formatarMoeda(resumo?.saldo),
      dataTest: 'dash_card_saldo',
      variant: 'primary',
      icon: 'bi-wallet2',
    },
    {
      titulo: 'Contas Atrasadas',
      valor: resumo?.contasAtrasadas ?? 0,
      dataTest: 'dash_card_atrasadas',
      variant: 'warning',
      icon: 'bi-exclamation-circle',
    },
  ]

  return (
    <>
      <h2 className="mb-4">Dashboard</h2>
      <Row className="g-3">
        {cards.map((card) => (
          <Col md={3} key={card.dataTest}>
            <Card className="stat-card" data-test={card.dataTest}>
              <Card.Body className="d-flex align-items-start gap-3">
                <div className={`stat-icon stat-icon-${card.variant}`}>
                  <i className={`bi ${card.icon}`} />
                </div>
                <div>
                  <div className="stat-label">{card.titulo}</div>
                  <div className="stat-value">{card.valor}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
