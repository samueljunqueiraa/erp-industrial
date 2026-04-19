package com.industria.erpbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.industria.erpbackend.dto.ConferenciaPedidoDTO;
import com.industria.erpbackend.dto.ConferenciaPedidoDTO.ItemDTO;
import com.industria.erpbackend.dto.RecebimentoDTO;
import com.industria.erpbackend.dto.RetornoBipagemDTO;
import com.industria.erpbackend.entity.*;
import com.industria.erpbackend.enums.StatusPedido;
import com.industria.erpbackend.repository.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExpedicaoService {

    @Autowired private EstoqueSaldoRepository saldoRepository;
    @Autowired private MovimentacaoEstoqueRepository movimentacaoRepository;
    @Autowired private SkuRepository skuRepository;
    @Autowired private ItemOrdemCorteRepository itemOrdemRepository;
    @Autowired private OrdemCorteRepository ordemRepository;
    @Autowired private RastreioPecaRepository rastreioPecaRepository;

    @Autowired private PedidoRepository pedidoRepository;
    @Autowired private ItemPedidoRepository itemPedidoRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private ProdutoRepository produtoRepository;
    @Autowired private ItemPedidoSerialRepository serialRepository;

    // =================================================================================
    // ENTRADA DE PRODUÇÃO
    // =================================================================================

    @Transactional
    public Object processarEntrada(RecebimentoDTO dto) {
        String codigoCompleto = dto.getCodigoBarras();

        if (codigoCompleto == null || dto.getOrdemId() == null) {
            throw new IllegalArgumentException("Dados inválidos ou Ordem não informada.");
        }

        if (rastreioPecaRepository.existsByCodigoUnico(codigoCompleto)) {
             throw new IllegalArgumentException("ERRO: Esta etiqueta JÁ FOI BIPADA anteriormente!");
        }

        String skuBase = codigoCompleto.contains(".") ? codigoCompleto.split("\\.")[0] : codigoCompleto;

        OrdemCorte ordem = ordemRepository.findById(dto.getOrdemId())
                .orElseThrow(() -> new IllegalArgumentException("Ordem não encontrada."));

        if ("CANCELADA".equalsIgnoreCase(ordem.getStatus().toString())) {
            throw new IllegalArgumentException("Ordem CANCELADA.");
        }

        try {
            String[] parts = skuBase.split("-");
            Long produtoId = Long.parseLong(parts[1]);
            Integer corId = Integer.parseInt(parts[3]);
            Integer tamanhoId = Integer.parseInt(parts[5]);

            ItemOrdemCorte itemOrdem = itemOrdemRepository
                .findByOrdemCorteIdAndTamanhoId(dto.getOrdemId(), Long.valueOf(tamanhoId))
                .orElseThrow(() -> new IllegalArgumentException("Tamanho não pertence à Ordem."));

            int limite = (itemOrdem.getQtdProduzida() != null && itemOrdem.getQtdProduzida() > 0) 
                         ? itemOrdem.getQtdProduzida() : itemOrdem.getQtdPlanejada();

            if (itemOrdem.getQtdConferida() >= limite) {
                 throw new IllegalArgumentException("Limite atingido para este tamanho.");
            }

            // Busca ou Cria SKU (Usando IDs)
            Sku sku = buscarOuCriarSku(produtoId, corId, tamanhoId, skuBase);

            EstoqueSaldo saldo = saldoRepository.findBySkuId(sku.getId())
                    .orElse(new EstoqueSaldo());
            
            if (saldo.getId() == null) {
                saldo.setSkuId(sku.getId());
                saldo.setQtdFisica(0);
                saldo.setLocalizacao("EXPEDICAO");
            }
            saldo.setQtdFisica(saldo.getQtdFisica() + 1);
            saldoRepository.save(saldo);

            RastreioPeca rastreio = new RastreioPeca();
            rastreio.setCodigoUnico(codigoCompleto);
            rastreio.setOrdemCorte(ordem);
            rastreio.setSku(sku);
            rastreio.setStatus("EM_ESTOQUE");
            rastreio.setDataEntrada(LocalDateTime.now());
            rastreioPecaRepository.save(rastreio);

            MovimentacaoEstoque mov = new MovimentacaoEstoque();
            mov.setSku(sku);
            mov.setQuantidade(1);
            mov.setTipoMovimento("ENTRADA");
            mov.setMotivo("PRODUCAO");
            mov.setDocumentoReferencia("OC-" + dto.getOrdemId());
            mov.setDataMovimentacao(LocalDateTime.now());
            mov.setOrdemCorteId(dto.getOrdemId());
            mov.setOrigemMovimento("EXPEDICAO");
            movimentacaoRepository.save(mov);

            itemOrdem.setQtdConferida(itemOrdem.getQtdConferida() + 1);
            itemOrdemRepository.save(itemOrdem);
            
            String nomeProd = (ordem.getProduto() != null) ? ordem.getProduto().getNome() : "Prod ID: " + produtoId;

            return new RetornoBipagemDTO("Sucesso", nomeProd, itemOrdem.getQtdConferida(), limite, saldo.getQtdFisica());

        } catch (Exception e) {
            e.printStackTrace(); 
            throw new IllegalArgumentException("Erro ao processar: " + e.getMessage());
        }
    }

    private Sku buscarOuCriarSku(Long pId, Integer cId, Integer tId, String codigoLimpo) {
        return skuRepository.findByCodigoBarras(codigoLimpo)
            .orElseGet(() -> {
                Sku novo = new Sku();
                novo.setProdutoId(pId); // Usando setProdutoId (Long)
                novo.setCorId(cId);
                novo.setTamanhoId(tId);
                novo.setCodigoBarras(codigoLimpo); 
                return skuRepository.save(novo);
            });
    }

    // =================================================================================
    // SAÍDA / CONFERÊNCIA DE PEDIDOS
    // =================================================================================

    @Transactional(readOnly = true)
    public List<ConferenciaPedidoDTO> listarPedidosPendentes() {
        List<ConferenciaPedidoDTO> result = new ArrayList<>();
        List<Pedido> pendentes = pedidoRepository.findByStatus(StatusPedido.EM_ABERTO);

        for (Pedido pedido : pendentes) {
            List<ItemDTO> dtoItems = new ArrayList<>();
            int totalItens = 0;
            int itensConferidos = 0;

            for (ItemPedido ip : pedido.getItens()) {
                Integer qtdPedida = ip.getQuantidade() != null ? ip.getQuantidade() : 0;
                Integer qtdConf = ip.getQuantidadeConferida() != null ? ip.getQuantidadeConferida() : 0;
                
                totalItens += qtdPedida;
                itensConferidos += qtdConf;

                String codigoBarras = "SEM CODIGO";
                String nomeProduto = "Produto Indisponível";

                // Lógica ajustada para SKU com IDs
                if (ip.getSku() != null) {
                    codigoBarras = ip.getSku().getCodigoBarras();
                    Long produtoId = ip.getSku().getProdutoId(); // Pega o ID
                    
                    if (produtoId != null) {
                        // Busca o nome manualmente
                        nomeProduto = produtoRepository.findById(produtoId)
                            .map(Produto::getNome)
                            .orElse("Prod ID: " + produtoId);
                    }
                }

                ItemDTO itemDto = new ItemDTO();
                itemDto.setCodigoBarras(codigoBarras);
                itemDto.setNomeProduto(nomeProduto);
                itemDto.setQtdPedida(qtdPedida);
                itemDto.setQtdConferida(qtdConf);
                itemDto.setConferidoCompleto(qtdConf >= qtdPedida);
                
                dtoItems.add(itemDto);
            }

            String nomeCliente = "Cliente Desconhecido";
            if (pedido.getClienteId() != null) {
                nomeCliente = clienteRepository.findById(pedido.getClienteId())
                        .map(c -> (c.getNomeFantasia() != null && !c.getNomeFantasia().isEmpty()) 
                                ? c.getNomeFantasia() 
                                : c.getNome()) 
                        .orElse("Cliente ID: " + pedido.getClienteId());
            }

            String nomeVendedor = "Vendedor N/A";
            if (pedido.getVendedorId() != null) {
                nomeVendedor = usuarioRepository.findById(pedido.getVendedorId())
                        .map(Usuario::getNomeCompleto)
                        .orElse("Vend. ID: " + pedido.getVendedorId());
            }

            String dataFormatada = "";
            if (pedido.getDataCriacao() != null) {
                dataFormatada = pedido.getDataCriacao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }

            ConferenciaPedidoDTO dto = new ConferenciaPedidoDTO();
            dto.setPedidoId(pedido.getId());
            dto.setNumeroPedido(pedido.getNumeroPedido());
            dto.setNomeCliente(nomeCliente);
            dto.setNomeVendedor(nomeVendedor);
            dto.setDataPedido(dataFormatada);
            dto.setTotalItens(totalItens);
            dto.setItensConferidos(itensConferidos);
            dto.setStatus(pedido.getStatus().toString());
            dto.setItens(dtoItems);

            result.add(dto);
        }
        return result;
    }

    @Transactional
    public void conferirItemPedido(Long pedidoId, String codigoBarrasScaneado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado ID: " + pedidoId));

        if (pedido.getStatus() != StatusPedido.EM_ABERTO) {
            throw new IllegalArgumentException("Este pedido não está em aberto");
        }

        RastreioPeca pecaNoEstoque = rastreioPecaRepository.findByCodigoUnico(codigoBarrasScaneado)
                .orElseThrow(() -> new IllegalArgumentException("ERRO CRÍTICO: Etiqueta '" + codigoBarrasScaneado + "' não existe no sistema!"));

        // Validação ajustada para usar IDs
        ItemPedido item = pedido.getItens().stream()
                .filter(i -> i.getSku() != null && i.getSku().getId().equals(pecaNoEstoque.getSku().getId()))
                .findFirst()
                .orElseThrow(() -> {
                    // Busca nome do produto para a mensagem de erro
                    String nomeProdErro = "Desconhecido";
                    Long pIdErro = pecaNoEstoque.getSku().getProdutoId();
                    if(pIdErro != null) {
                         nomeProdErro = produtoRepository.findById(pIdErro)
                                .map(Produto::getNome).orElse("ID " + pIdErro);
                    }
                    
                    return new IllegalArgumentException("PRODUTO INCORRETO: A etiqueta é do produto '" 
                        + nomeProdErro + "' (SKU: " + pecaNoEstoque.getSku().getCodigoBarras() 
                        + "), mas este pedido não solicitou este item!");
                });

        boolean jaBipouEsseSerial = serialRepository.existsBySerialAndItemPedidoId(codigoBarrasScaneado, item.getId());
        if (jaBipouEsseSerial) {
            throw new IllegalArgumentException("ATENÇÃO: O serial " + codigoBarrasScaneado + " JÁ FOI CONFERIDO neste pedido!");
        }

        if (item.getQuantidadeConferida() >= item.getQuantidade()) {
             throw new IllegalArgumentException("Quantidade excedida para este item! (" + item.getQuantidade() + " un)");
        }

        ItemPedidoSerial registroSerial = new ItemPedidoSerial(item, codigoBarrasScaneado);
        serialRepository.save(registroSerial);

        item.setQuantidadeConferida(item.getQuantidadeConferida() + 1);
        itemPedidoRepository.save(item);

        boolean tudoPronto = pedido.getItens().stream()
                .allMatch(i -> i.getQuantidadeConferida() >= i.getQuantidade());

        if (tudoPronto) {
            finalizarPedido(pedido);
        }
    }

    private void finalizarPedido(Pedido pedido) {
        pedido.setStatus(StatusPedido.FINALIZADO);
        pedido.setDataFinalizacao(LocalDateTime.now());
        
        for (ItemPedido it : pedido.getItens()) {
            if (it.getSku() == null) continue;
            
            EstoqueSaldo saldo = saldoRepository.findBySkuId(it.getSku().getId())
                    .orElseThrow(() -> new RuntimeException("Saldo não encontrado SKU: " + it.getSku().getId()));

            int novaQtd = Math.max(0, saldo.getQtdFisica() - it.getQuantidade());
            saldo.setQtdFisica(novaQtd);
            saldoRepository.save(saldo);

            MovimentacaoEstoque mov = new MovimentacaoEstoque();
            mov.setSku(it.getSku());
            mov.setQuantidade(it.getQuantidade());
            mov.setTipoMovimento("SAIDA"); 
            mov.setMotivo("VENDA");
            mov.setDocumentoReferencia("PED-" + pedido.getId());
            mov.setDataMovimentacao(LocalDateTime.now());
            mov.setOrigemMovimento("EXPEDICAO");
            
            movimentacaoRepository.save(mov);
        }
        pedidoRepository.save(pedido);
    }
}