package com.nfctools.tooltracker.dto.response;
import lombok.Data;

@Data
public class TransactionItemResponse {
    private Long id;
    private Long toolId;
    private String toolCode;
    private String toolName;
    private Double priceSnapshot;
    private boolean returned;
    private String conditionNote;
}
