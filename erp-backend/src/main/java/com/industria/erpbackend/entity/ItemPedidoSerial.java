package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_item_pedido_serial")
public class ItemPedidoSerial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vincula ao item do pedido (ex: SKU Camisa Polo - Qtd 10)
    @ManyToOne
    @JoinColumn(name = "item_pedido_id", nullable = false)
    private ItemPedido itemPedido;

    // Guarda o serial único (ex: P-1-C-1-T-11.1.1)
    @Column(nullable = false)
    private String serial;

    private LocalDateTime dataLeitura;

    public ItemPedidoSerial() {}

    public ItemPedidoSerial(ItemPedido itemPedido, String serial) {
        this.itemPedido = itemPedido;
        this.serial = serial;
        this.dataLeitura = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ItemPedido getItemPedido() { return itemPedido; }
    public void setItemPedido(ItemPedido itemPedido) { this.itemPedido = itemPedido; }
    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }
    public LocalDateTime getDataLeitura() { return dataLeitura; }
    public void setDataLeitura(LocalDateTime dataLeitura) { this.dataLeitura = dataLeitura; }
}
