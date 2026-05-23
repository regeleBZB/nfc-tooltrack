package com.nfctools.tooltracker.dto.request;

import com.nfctools.tooltracker.enums.ToolStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateToolRequest {
    @Size(max = 100) public String name;
    @Size(max = 50)  public String category;
    @Size(max = 255) public String description;
    public ToolStatus status;
    public Double purchasePrice;
}
