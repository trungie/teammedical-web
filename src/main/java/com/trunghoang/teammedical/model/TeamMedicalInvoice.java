package com.trunghoang.teammedical.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TeamMedicalInvoice {

    private String id;
    private String reference;
    private String dateSubmitted;
    private String dateInvoiced;
    private String contactName;
    private String totalValue;
    private String consignmentNumber;
    private String deliveryAddress;
    private List<TeamMedicalInvoiceLineItem> invoiceLineItems;

}
