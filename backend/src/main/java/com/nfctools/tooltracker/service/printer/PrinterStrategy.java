package com.nfctools.tooltracker.service.printer;

import com.nfctools.tooltracker.entity.Transaction;
import java.io.OutputStream;

/**
 * Strategy pattern for printer output.
 * Adding a new printer type (e.g. network LAN printer) = new class implementing this.
 * No changes needed anywhere else.
 */
public interface PrinterStrategy {
    OutputStream openStream() throws Exception;
    boolean isAvailable();
    String getDescription();
}
