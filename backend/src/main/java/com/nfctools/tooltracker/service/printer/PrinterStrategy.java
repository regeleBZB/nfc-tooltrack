package com.nfctools.tooltracker.service.printer;

import com.nfctools.tooltracker.entity.Transaction;
import java.io.OutputStream;


public interface PrinterStrategy {
    OutputStream openStream() throws Exception;
    boolean isAvailable();
    String getDescription();
}
