package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.ItemPedidoSerial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemPedidoSerialRepository extends JpaRepository<ItemPedidoSerial, Long> {
   
    boolean existsBySerialAndItemPedidoId(String serial, Long itemPedidoId);
}