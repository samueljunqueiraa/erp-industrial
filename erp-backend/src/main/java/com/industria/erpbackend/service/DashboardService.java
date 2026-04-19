package com.industria.erpbackend.service;

import com.industria.erpbackend.dto.DashboardSummaryDTO;
import com.industria.erpbackend.dto.DashboardSummaryDTO.MetricItemDTO;
import com.industria.erpbackend.entity.MetaMensal;
import com.industria.erpbackend.entity.Pedido;
import com.industria.erpbackend.repository.MetaMensalRepository;
import com.industria.erpbackend.repository.PedidoRepository;
import com.industria.erpbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MetaMensalRepository metaRepository;

    // --- MÉTODO REAL (Conectado ao Banco) ---
    public DashboardSummaryDTO getMonthSummary() {
        // 1. DATAS
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioAtual = hoje.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime fimAtual = hoje.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
        LocalDateTime inicioAnterior = inicioAtual.minusMonths(1);
        LocalDateTime fimAnterior = fimAtual.minusMonths(1);

        String nomeMes = hoje.format(DateTimeFormatter.ofPattern("MMMM", new Locale("pt", "BR"))).toUpperCase();
        String intervaloTexto = inicioAtual.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " - " + fimAtual.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        // 2. BUSCA DE PEDIDOS E USUÁRIOS
        List<Pedido> todosPedidos = pedidoRepository.findAll();
        Long totalUsuarios = usuarioRepository.count();

        // 3. BUSCA DA META (NOVA LÓGICA)
        // Se não achar meta no banco, usa ZERO como padrão
        BigDecimal metaValor = BigDecimal.ZERO;
        Optional<MetaMensal> metaOpt = metaRepository.findByMesAndAno(hoje.getMonthValue(), hoje.getYear());
        
        if (metaOpt.isPresent()) {
            metaValor = metaOpt.get().getValor();
        }

        // 4. FILTROS
        List<Pedido> pedidosMesAtual = filtrarPorData(todosPedidos, inicioAtual, fimAtual);
        List<Pedido> pedidosMesAnterior = filtrarPorData(todosPedidos, inicioAnterior, fimAnterior);

        // 5. CÁLCULOS
        BigDecimal fatAtual = somarFaturamento(pedidosMesAtual);
        BigDecimal qtdAtual = new BigDecimal(pedidosMesAtual.size());
        BigDecimal ticketAtual = calcularTicket(fatAtual, qtdAtual);

        BigDecimal fatAnterior = somarFaturamento(pedidosMesAnterior);
        BigDecimal qtdAnterior = new BigDecimal(pedidosMesAnterior.size());
        BigDecimal ticketAnterior = calcularTicket(fatAnterior, qtdAnterior);

        // 6. MONTAGEM DTO
        DashboardSummaryDTO dto = new DashboardSummaryDTO();
        dto.setMonth(nomeMes);
        dto.setDateRange(intervaloTexto);

        dto.setRevenue(new MetricItemDTO(fatAtual, compararCrescimento(fatAtual, fatAnterior)));
        dto.setTicket(new MetricItemDTO(ticketAtual, compararCrescimento(ticketAtual, ticketAnterior)));
        dto.setOrders(new MetricItemDTO(qtdAtual, compararCrescimento(qtdAtual, qtdAnterior)));
        dto.setUsers(totalUsuarios);

        // Agora passamos o valor real vindo do banco
        dto.setMeta(new MetricItemDTO(metaValor, "neutral"));

        return dto;
    }

    // --- NOVO MÉTODO: SALVAR/ATUALIZAR META (Para o botão de editar) ---
    public void atualizarMeta(BigDecimal novoValor) {
        LocalDate hoje = LocalDate.now();
        int mes = hoje.getMonthValue();
        int ano = hoje.getYear();

        // Tenta achar a meta deste mês. Se não existir, cria uma nova.
        MetaMensal meta = metaRepository.findByMesAndAno(mes, ano)
                .orElse(new MetaMensal(mes, ano, BigDecimal.ZERO));

        meta.setValor(novoValor);
        
        metaRepository.save(meta);
    }

    // --- MÉTODOS AUXILIARES ---

    private List<Pedido> filtrarPorData(List<Pedido> lista, LocalDateTime inicio, LocalDateTime fim) {
        return lista.stream()
                .filter(p -> p.getDataEmissao() != null)
                .filter(p -> !p.getDataEmissao().isBefore(inicio) && !p.getDataEmissao().isAfter(fim))
                .collect(Collectors.toList());
    }

    private BigDecimal somarFaturamento(List<Pedido> lista) {
        return lista.stream()
                .map(Pedido::getValorTotal)
                .filter(val -> val != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularTicket(BigDecimal faturamento, BigDecimal qtd) {
        if (qtd.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return faturamento.divide(qtd, 2, RoundingMode.HALF_UP);
    }

    private String compararCrescimento(BigDecimal atual, BigDecimal anterior) {
        if (anterior.compareTo(BigDecimal.ZERO) == 0) {
            return (atual.compareTo(BigDecimal.ZERO) > 0) ? "green" : "yellow";
        }
        BigDecimal performance = atual.divide(anterior, 2, RoundingMode.HALF_UP);

        if (performance.compareTo(BigDecimal.ONE) >= 0) {
            return "green";
        } else if (performance.compareTo(new BigDecimal("0.90")) >= 0) {
            return "yellow";
        } else {
            return "red";
        }
    }

    // --- MOCK (Pode manter ou apagar, serve de backup) ---
    public DashboardSummaryDTO getSummaryData() {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();
        dto.setMonth("Fevereiro");
        dto.setDateRange("01 Fev - 28 Fev");
        dto.setUsers(12L);
        dto.setRevenue(new MetricItemDTO(new BigDecimal("45231.89"), "up"));
        dto.setTicket(new MetricItemDTO(new BigDecimal("345.00"), "down"));
        dto.setOrders(new MetricItemDTO(new BigDecimal("154"), "up"));
        dto.setMeta(new MetricItemDTO(new BigDecimal("80000.00"), "neutral"));
        return dto;
    }
}