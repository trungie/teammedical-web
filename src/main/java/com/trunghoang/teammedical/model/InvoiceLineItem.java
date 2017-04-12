package com.trunghoang.teammedical.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceLineItem {

    private String code;
    private String description;
    private String orderedQuantity;
    private String suppliedQuantity;
    private String unitPrice;
    private String valueExcludingGst;
    private String valueIncludingGst;

}
