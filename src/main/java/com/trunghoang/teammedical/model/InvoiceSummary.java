package com.trunghoang.teammedical.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceSummary {

    private String id;
    private String type;
    private String reference;
    private String date;
    private String consignment;
    private String total;
    private String totalOutstanding;

    private String detailsLink;
    private String pdfLink;

}
