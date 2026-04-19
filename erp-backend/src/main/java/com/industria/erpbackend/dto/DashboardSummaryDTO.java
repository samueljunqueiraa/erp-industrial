package com.industria.erpbackend.dto;

import java.math.BigDecimal;

public class DashboardSummaryDTO {

    private String month;
    private String dateRange;
    private MetricItemDTO revenue;
    private MetricItemDTO ticket;
    private MetricItemDTO orders;
    private Long users;
    
    // --- NOVO CAMPO (Faltava este cara aqui) ---
    private MetricItemDTO meta;

    public DashboardSummaryDTO() {
    }

    // --- GETTERS E SETTERS ---

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public String getDateRange() { return dateRange; }
    public void setDateRange(String dateRange) { this.dateRange = dateRange; }

    public MetricItemDTO getRevenue() { return revenue; }
    public void setRevenue(MetricItemDTO revenue) { this.revenue = revenue; }

    public MetricItemDTO getTicket() { return ticket; }
    public void setTicket(MetricItemDTO ticket) { this.ticket = ticket; }

    public MetricItemDTO getOrders() { return orders; }
    public void setOrders(MetricItemDTO orders) { this.orders = orders; }

    public Long getUsers() { return users; }
    public void setUsers(Long users) { this.users = users; }

    // --- GETTER E SETTER DA META ---
    public MetricItemDTO getMeta() { return meta; }
    public void setMeta(MetricItemDTO meta) { this.meta = meta; }


    // --- CLASSE INTERNA ---
    public static class MetricItemDTO {
        private BigDecimal value;
        private String status; // "up", "down", "neutral" ou "green", "red"

        public MetricItemDTO() { }

        public MetricItemDTO(BigDecimal value, String status) {
            this.value = value;
            this.status = status;
        }

        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}