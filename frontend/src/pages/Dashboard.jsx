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
    { titulo: 'Total a Receber', valor: resumo?.totalReceber, dataTest: 'dash_card_total_receber', variant: 'success' },
    { titulo: 'Total a Pagar', valor: resumo?.totalPagar, dataTest: 'dash_card_total_pagar', variant: 'danger' },
    { titulo: 'Saldo em Caixa', valor: resumo?.saldo, dataTest: 'dash_card_saldo', variant: 'primary' },
  ]

  return (
    <>
      <h2 className="mb-4">Dashboard</h2>
      <Row className="g-3">
        {cards.map((card) => (
          <Col md={3} key={card.dataTest}>
            <Card border={card.variant} data-test={card.dataTest}>
              <Card.Body>
                <Card.Subtitle className="text-muted mb-2">{card.titulo}</Card.Subtitle>
                <Card.Title as="p" className={`text-${card.variant} fs-4 mb-0`}>
                  {formatarMoeda(card.valor)}
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
        <Col md={3}>
          <Card border="warning" data-test="dash_card_atrasadas">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">Contas Atrasadas</Card.Subtitle>
              <Card.Title as="p" className="text-warning fs-4 mb-0">
                {resumo?.contasAtrasadas ?? 0}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}
