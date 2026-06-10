package com.nfctools.tooltracker.service.printer;

import com.nfctools.tooltracker.config.PrinterConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.print.DocFlavor;
import javax.print.DocPrintJob;
import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import javax.print.SimpleDoc;
import java.io.OutputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;

@Slf4j
@Component("usbPrinterStrategy")
@RequiredArgsConstructor
public class UsbPrinterStrategy implements PrinterStrategy {

    private final PrinterConfig config;

    @Override
    public OutputStream openStream() throws Exception {
        PrintService printService = findPrintService();
        DocPrintJob job = printService.createPrintJob();

        PipedOutputStream pos = new PipedOutputStream();
        PipedInputStream pis = new PipedInputStream(pos);

        Thread printThread = new Thread(() -> {
            try {
                SimpleDoc doc = new SimpleDoc(pis, DocFlavor.INPUT_STREAM.AUTOSENSE, null);
                job.print(doc, null);
            } catch (Exception e) {
                log.error("Print job error: {}", e.getMessage());
            } finally {
                try { pis.close(); } catch (Exception ignored) {}
            }
        });
        printThread.setDaemon(true);
        printThread.start();

        return pos;
    }

    @Override
    public boolean isAvailable() {
        try {
            findPrintService();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getDescription() {
        return "USB printer: " + config.getUsb().getName();
    }

    private PrintService findPrintService() {
        String target = config.getUsb().getName().toLowerCase();
        for (PrintService ps : PrintServiceLookup.lookupPrintServices(null, null)) {
            log.debug("Found print service: {}", ps.getName());
            if (ps.getName().toLowerCase().contains(target)) return ps;
        }
        throw new RuntimeException("USB printer not found: " + config.getUsb().getName());
    }
}