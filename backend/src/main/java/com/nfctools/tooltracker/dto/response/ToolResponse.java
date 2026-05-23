package com.nfctools.tooltracker.dto.response;
import com.nfctools.tooltracker.enums.ToolStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ToolResponse {
    private Long id;
    private String toolCode;
    private String name;
    private String category;
    private String description;
    private ToolStatus status;
    private Double purchasePrice;
    private String tagUid;
    private LocalDateTime createdAt;
}
