package com.industria.erpbackend.service;

import com.industria.erpbackend.entity.*;
import com.industria.erpbackend.enums.StatusPedido;
import com.industria.erpbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class VendaService {

    @Autowired private PedidoRepository pedidoRepository;
    @Autowired private EstoqueSaldoRepository saldoRepository;
    @Autowired private SkuRepository skuRepository;
    
    // Se precisar salvar itens individualmente (geralmente o Cascade resolve)
    @Autowired private ItemPedidoRepository itemPedidoRepository; 

    // --- 1. Abertura de Venda ---
    public Pedido iniciarVenda(String nomeCliente) {
        Pedido pedido = new Pedido();
        
        // Como não temos coluna 'nome_cliente', guardamos na OBS para não perder
        if (nomeCliente != null && !nomeCliente.isEmpty()) {
            pedido.setObservacoesNota("Cliente Avulso: " + nomeCliente);
        }
        
        pedido.setDataCriacao(LocalDateTime.now());
        pedido.setStatus(StatusPedido.EM_ABERTO);
        
        // Inicializa valores monetários com ZERO
        pedido.setSubtotal(BigDecimal.ZERO);
        pedido.setValorFrete(BigDecimal.ZERO);
        pedido.setDescontoAplicado(BigDecimal.ZERO);
        
        return pedidoRepository.save(pedido);
    }

    // --- 2. Adicionar Item (COM TRAVAMENTO) ---
    @Transactional
    public Pedido adicionarItem(Long pedidoId, String codigoBarras, Integer quantidade) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (pedido.getStatus() != StatusPedido.EM_ABERTO) {
            throw new RuntimeException("Este pedido já foi finalizado e não pode ser alterado.");
        }

        Sku sku = skuRepository.findByCodigoBarras(codigoBarras)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado (SKU inválido)."));

        // Busca saldo ou estoura erro se não tiver registro
        EstoqueSaldo saldo = saldoRepository.findBySkuId(sku.getId())
                .orElseThrow(() -> new RuntimeException("Sem registro de estoque para este item."));

        // CALCULA DISPONIBILIDADE REAL (Físico - Reservado)
        int disponivel = saldo.getQtdFisica() - saldo.getQtdReservada();

        if (disponivel < quantidade) {
            throw new RuntimeException("Estoque insuficiente! Disponível: " + disponivel + " un.");
        }

        // --- TRAVAMENTO DE ESTOQUE (Incrementa Reserva) ---
        saldo.setQtdReservada(saldo.getQtdReservada() + quantidade);
        saldoRepository.save(saldo);

        // --- Adiciona ao Pedido ---
        // OBS: Aqui estou fixando R$ 100.00. O ideal é buscar o preço do Produto via SKU.
        // Ex: sku.getProduto().getPrecoBase() se existir.
        BigDecimal preco = new BigDecimal("100.00"); 

        ItemPedido item = new ItemPedido(pedido, sku, quantidade, preco);
        pedido.getItens().add(item);
        
        // --- Recalcula Total (Usando BigDecimal) ---
        // Soma todos os subtotais dos itens
        BigDecimal totalItens = pedido.getItens().stream()
                .map(ItemPedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        pedido.setSubtotal(totalItens);

        return pedidoRepository.save(pedido);
    }

    // --- 3. Finalizar Venda (Baixa Definitiva) ---
    @Transactional
    public Pedido finalizarVenda(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (pedido.getStatus() == StatusPedido.FINALIZADO) {
            throw new RuntimeException("Pedido já finalizado.");
        }

        // Consolida a baixa:
        for (ItemPedido item : pedido.getItens()) {
            // Busca o saldo novamente para garantir
            EstoqueSaldo saldo = saldoRepository.findBySkuId(item.getSku().getId())
                    .orElseThrow(() -> new RuntimeException("Erro de inconsistência no estoque."));
            
            // Remove do físico (saiu do galpão)
            saldo.setQtdFisica(saldo.getQtdFisica() - item.getQuantidade());
            
            // Remove da reserva (não está mais pendente, já foi)
            saldo.setQtdReservada(saldo.getQtdReservada() - item.getQuantidade());
            
            saldoRepository.save(saldo);
        }

        pedido.setStatus(StatusPedido.FINALIZADO);
        // pedido.setDataFinalizacao(LocalDateTime.now()); // Removido pois não existe no banco
        
        return pedidoRepository.save(pedido);
    }
    
    // --- 4. Cancelar Venda (Estorna a Reserva) ---
    @Transactional
    public void cancelarVenda(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (pedido.getStatus() == StatusPedido.EM_ABERTO) {
            // Devolve a reserva (destrava o estoque para outros venderem)
            for (ItemPedido item : pedido.getItens()) {
                EstoqueSaldo saldo = saldoRepository.findBySkuId(item.getSku().getId()).get();
                
                saldo.setQtdReservada(saldo.getQtdReservada() - item.getQuantidade());
                saldoRepository.save(saldo);
            }
            pedido.setStatus(StatusPedido.CANCELADO);
            pedidoRepository.save(pedido);
        } else {
             throw new RuntimeException("Apenas pedidos em aberto podem ser cancelados por aqui.");
        }
    }
}