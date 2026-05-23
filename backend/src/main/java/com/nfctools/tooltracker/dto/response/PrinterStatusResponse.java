package com.nfctools.tooltracker.dto.response;
import lombok.Data;

@Data
public class PrinterStatusResponse {
    private String mode;
    private String usbPrinterName;
    private String bluetoothComPort;
    private boolean connected;
}
