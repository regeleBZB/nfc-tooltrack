package com.nfctools.tooltracker.dto.response;
import com.nfctools.tooltracker.enums.TransactionType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TransactionResponse {
    private Long id;
    private String receiptNumber;
    private TransactionType type;
    private StudentResponse student;
    private String borrowerName;
    private LocalDateTime transactedAt;
    private LocalDateTime returnedAt;
    private List<TransactionItemResponse> items;
    private String notes;
}
