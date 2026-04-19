package com.industria.erpbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.industria.erpbackend.entity.Pedido;
import com.industria.erpbackend.enums.StatusPedido;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    List<Pedido> findByStatus(StatusPedido status);
    
    List<Pedido> findByObservacoesNotaContainingIgnoreCase(String texto);
}
