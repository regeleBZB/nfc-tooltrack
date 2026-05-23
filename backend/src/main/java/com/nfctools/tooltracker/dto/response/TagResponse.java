package com.nfctools.tooltracker.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TagResponse {
    private String uid;
    private Long toolId;
    private String toolName;
    private String toolCode;
    private boolean active;
    private String encodedBy;
    private String notes;
    private LocalDateTime createdAt;
}
