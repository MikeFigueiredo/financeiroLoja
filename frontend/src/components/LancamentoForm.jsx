import { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import api from '../services/api'

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
]

export function LancamentoForm({ show, lancamento, onClose, onSaved }) {
  const isEdicao = Boolean(lancamento)

  const [tipo, setTipo] = useState('entrada')
  const [descricao, setDescricao] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [valor, setValor] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [categorias, setCategorias] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!show) return
    setTipo(lancamento?.tipo || 'entrada')
    setDescricao(lancamento?.descricao || '')
    setCategoriaId(lancamento?.categoria_id ? String(lancamento.categoria_id) : '')
    setValor(lancamento?.valor ?? '')
    setDataVencimento(lancamento?.data_vencimento ? lancamento.data_vencimento.slice(0, 10) : '')
    setFormaPagamento(lancamento?.forma_pagamento || '')
    setErro('')
  }, [show, lancamento])

  useEffect(() => {
    if (!show) return
    api.get('/categorias', { params: { tipo } }).then(({ data }) => setCategorias(data))
  }, [show, tipo])

  async function handleSubmit(event) {
    event.preventDefault()
    setSalvando(true)
    setErro('')

    const payload = {
      tipo,
      descricao,
      categoria_id: Number(categoriaId),
      valor: Number(valor),
      data_vencimento: dataVencimento,
      forma_pagamento: formaPagamento || null,
    }

    try {
      if (isEdicao) {
        await api.put(`/lancamentos/${lancamento.id}`, payload)
      } else {
        await api.post('/lancamentos', payload)
      }
      onSaved()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar o lançamento.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdicao ? 'Editar lançamento' : 'Novo lançamento'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              data-test="lanc_form_select_tipo"
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value)
                setCategoriaId('')
              }}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              data-test="lanc_form_input_descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Select
              data-test="lanc_form_select_categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Valor (R$)</Form.Label>
            <Form.Control
              data-test="lanc_form_input_valor"
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Vencimento</Form.Label>
            <Form.Control
              data-test="lanc_form_input_vencimento"
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Forma de pagamento</Form.Label>
            <Form.Select
              data-test="lanc_form_select_forma_pagamento"
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <option value="">Não informado</option>
              {FORMAS_PAGAMENTO.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" data-test="lanc_form_btn_salvar" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
