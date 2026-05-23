package com.nfctools.tooltracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterTagRequest {
    @NotBlank @Size(max = 50) public String uid;
    @NotNull                  public Long toolId;
    @Size(max = 255)          public String notes;
}
