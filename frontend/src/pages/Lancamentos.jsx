import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import api from '../services/api'
import { useToast } from '../components/Toast'
import { LancamentoForm } from '../components/LancamentoForm'
import { ConfirmModal } from '../components/ConfirmModal'

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function formatarData(data) {
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

const STATUS_LABEL = {
  pendente: { texto: 'Pendente', variant: 'secondary' },
  pago: { texto: 'Pago', variant: 'success' },
  atrasado: { texto: 'Atrasado', variant: 'danger' },
}

export function Lancamentos() {
  const { showToast } = useToast()
  const [lancamentos, setLancamentos] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [lancamentoEditando, setLancamentoEditando] = useState(null)
  const [lancamentoExcluindo, setLancamentoExcluindo] = useState(null)

  async function carregar() {
    const params = {}
    if (filtroStatus) params.status = filtroStatus
    if (filtroTipo) params.tipo = filtroTipo
    const { data } = await api.get('/lancamentos', { params })
    setLancamentos(data)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus, filtroTipo])

  function abrirNovo() {
    setLancamentoEditando(null)
    setFormAberto(true)
  }

  function abrirEdicao(lancamento) {
    setLancamentoEditando(lancamento)
    setFormAberto(true)
  }

  async function handleSaved() {
    setFormAberto(false)
    showToast(lancamentoEditando ? 'Lançamento atualizado com sucesso.' : 'Lançamento criado com sucesso.')
    await carregar()
  }

  async function handlePagar(lancamento) {
    await api.patch(`/lancamentos/${lancamento.id}/pagar`)
    showToast('Lançamento marcado como pago.')
    await carregar()
  }

  async function handleExcluir() {
    await api.delete(`/lancamentos/${lancamentoExcluindo.id}`)
    setLancamentoExcluindo(null)
    showToast('Lançamento excluído com sucesso.')
    await carregar()
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Lançamentos</h2>
        <Button variant="primary" data-test="lanc_btn_novo" onClick={abrirNovo}>
          + Novo Lançamento
        </Button>
      </div>

      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Select
            data-test="lanc_filtro_status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            data-test="lanc_filtro_tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive data-test="lanc_tabela">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((l) => {
            const status = STATUS_LABEL[l.status_efetivo]
            return (
              <tr key={l.id}>
                <td>{l.descricao}</td>
                <td>{l.categoria_nome}</td>
                <td>{l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
                <td>{formatarMoeda(l.valor)}</td>
                <td>{formatarData(l.data_vencimento)}</td>
                <td>
                  <Badge bg={status.variant}>{status.texto}</Badge>
                </td>
                <td className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    data-test="lanc_btn_editar"
                    onClick={() => abrirEdicao(l)}
                  >
                    Editar
                  </Button>
                  {l.status !== 'pago' && (
                    <Button
                      size="sm"
                      variant="outline-success"
                      data-test="lanc_btn_pagar"
                      onClick={() => handlePagar(l)}
                    >
                      Pagar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    data-test="lanc_btn_excluir"
                    onClick={() => setLancamentoExcluindo(l)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      <LancamentoForm
        show={formAberto}
        lancamento={lancamentoEditando}
        onClose={() => setFormAberto(false)}
        onSaved={handleSaved}
      />

      <ConfirmModal
        show={Boolean(lancamentoExcluindo)}
        title="Excluir lançamento"
        message={`Tem certeza que deseja excluir "${lancamentoExcluindo?.descricao}"?`}
        onConfirm={handleExcluir}
        onCancel={() => setLancamentoExcluindo(null)}
      />
    </>
  )
}
