package com.nfctools.tooltracker.service.printer;

import com.fazecast.jSerialComm.SerialPort;
import com.nfctools.tooltracker.config.PrinterConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.OutputStream;

@Slf4j
@Component("bluetoothPrinterStrategy")
@RequiredArgsConstructor
public class BluetoothPrinterStrategy implements PrinterStrategy {

    private final PrinterConfig config;

    @Override
    public OutputStream openStream() throws Exception {
        SerialPort port = SerialPort.getCommPort(config.getBluetooth().getComPort());
        port.setBaudRate(config.getBluetooth().getBaudRate());
        port.openPort();
        if (!port.isOpen()) {
            throw new RuntimeException("Cannot open Bluetooth COM port: "
                    + config.getBluetooth().getComPort()
                    + ". Ensure printer is paired and COM port is correct in application.yml");
        }
        return port.getOutputStream();
    }

    @Override
    public boolean isAvailable() {
        try {
            SerialPort port = SerialPort.getCommPort(config.getBluetooth().getComPort());
            return port != null;
        } catch (Exception e) { return false; }
    }

    @Override
    public String getDescription() {
        return "Bluetooth printer via COM port: " + config.getBluetooth().getComPort();
    }
}
