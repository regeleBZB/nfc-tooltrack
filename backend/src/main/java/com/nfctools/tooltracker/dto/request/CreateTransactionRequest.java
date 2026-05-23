package com.nfctools.tooltracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class CreateTransactionRequest {
    @NotBlank                    public String type;
    public Long                  studentId;
    @Size(max = 100)             public String borrowerName;
    @NotEmpty                    public List<Long> toolIds;
    @Size(max = 255)             public String notes;
}
