package com.nfctools.tooltracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ReturnItemsRequest {
    @NotEmpty        public List<Long> transactionItemIds;
    @Size(max = 255) public String conditionNote;
}
