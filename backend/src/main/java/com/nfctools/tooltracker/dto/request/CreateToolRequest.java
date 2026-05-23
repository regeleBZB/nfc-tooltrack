package com.nfctools.tooltracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateToolRequest {
    @NotBlank @Size(max = 20)  public String toolCode;
    @NotBlank @Size(max = 100) public String name;
    @Size(max = 50)            public String category;
    @Size(max = 255)           public String description;
    @Positive                  public Double purchasePrice;
}
