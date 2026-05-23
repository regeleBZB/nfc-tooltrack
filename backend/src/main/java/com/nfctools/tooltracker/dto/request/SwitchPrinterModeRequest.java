package com.nfctools.tooltracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SwitchPrinterModeRequest {
    @NotBlank public String mode;
}
