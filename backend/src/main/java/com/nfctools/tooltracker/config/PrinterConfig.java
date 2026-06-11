package com.nfctools.tooltracker.config;
import com.nfctools.tooltracker.enums.PrinterMode;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data @Component @ConfigurationProperties(prefix = "printer")
public class PrinterConfig {
    private PrinterMode mode = PrinterMode.USB;
    private Usb usb = new Usb();
    private Bluetooth bluetooth = new Bluetooth();

    @Data public static class Usb {
        private String name = "XP-58";
        private String port = "USB002";
    }
    @Data public static class Bluetooth { private String comPort = "COM3"; private int baudRate = 9600; }
}
