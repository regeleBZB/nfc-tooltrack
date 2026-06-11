package com.nfctools.tooltracker.service.printer;

import com.nfctools.tooltracker.config.PrinterConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.usb4java.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.IntBuffer;

@Slf4j
@Component("usbPrinterStrategy")
@RequiredArgsConstructor
public class UsbPrinterStrategy implements PrinterStrategy {

    // YICHIP3121 POS-58 Printer identifiers
    private static final short VENDOR_ID  = (short) 0x0416;
    private static final short PRODUCT_ID = (short) 0x5011;
    private static final int   TIMEOUT_MS = 5000;

    private final PrinterConfig config;

    /**
     * Returns an OutputStream that buffers all ESC/POS bytes in memory.
     * On close(), the buffer is flushed directly to the USB device via usb4java,
     * bypassing the Windows print spooler entirely.
     */
    @Override
    public OutputStream openStream() throws Exception {
        return new ByteArrayOutputStream() {
            @Override
            public void close() throws IOException {
                super.close();
                try {
                    sendToUsb(this.toByteArray());
                } catch (Exception e) {
                    throw new IOException("Failed to send ESC/POS data to USB printer: " + e.getMessage(), e);
                }
            }
        };
    }

    @Override
    public boolean isAvailable() {
        Context context = new Context();
        try {
            int result = LibUsb.init(context);
            if (result != LibUsb.SUCCESS) return false;
            DeviceHandle handle = LibUsb.openDeviceWithVidPid(context, VENDOR_ID, PRODUCT_ID);
            if (handle == null) return false;
            LibUsb.close(handle);
            return true;
        } catch (Exception e) {
            return false;
        } finally {
            LibUsb.exit(context);
        }
    }

    @Override
    public String getDescription() {
        return "USB printer: " + config.getUsb().getName()
                + " (VID=0416, PID=5011)";
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private void sendToUsb(byte[] data) throws Exception {
        if (data == null || data.length == 0) {
            log.warn("No ESC/POS data to send");
            return;
        }

        Context context = new Context();
        int result = LibUsb.init(context);
        if (result != LibUsb.SUCCESS) {
            throw new RuntimeException("Failed to initialize libusb: " + LibUsb.strError(result));
        }

        DeviceHandle handle = null;
        try {
            handle = LibUsb.openDeviceWithVidPid(context, VENDOR_ID, PRODUCT_ID);
            if (handle == null) {
                throw new RuntimeException(
                        "Printer not found (VID=0416, PID=5011). Is it connected and powered on?");
            }

            // Detach kernel driver if active (needed on some systems)
            if (LibUsb.kernelDriverActive(handle, 0) == 1) {
                LibUsb.detachKernelDriver(handle, 0);
            }

            result = LibUsb.claimInterface(handle, 0);
            if (result != LibUsb.SUCCESS) {
                throw new RuntimeException("Cannot claim USB interface: " + LibUsb.strError(result));
            }

            // Find the bulk OUT endpoint
            byte endpoint = findBulkOutEndpoint(handle);
            log.debug("Using bulk OUT endpoint: 0x{}", String.format("%02X", endpoint));

            // Send data in chunks of 64 bytes (USB full-speed packet size)
            int chunkSize = 64;
            int offset = 0;
            while (offset < data.length) {
                int length = Math.min(chunkSize, data.length - offset);
                ByteBuffer buffer = ByteBuffer.allocateDirect(length);
                buffer.put(data, offset, length);
                buffer.rewind();

                IntBuffer transferred = IntBuffer.allocate(1);
                result = LibUsb.bulkTransfer(handle, endpoint, buffer, transferred, TIMEOUT_MS);
                if (result != LibUsb.SUCCESS) {
                    throw new RuntimeException("USB bulk transfer failed: " + LibUsb.strError(result));
                }
                offset += transferred.get(0);
            }

            log.info("Sent {} bytes to USB printer successfully", data.length);
            LibUsb.releaseInterface(handle, 0);

        } finally {
            if (handle != null) LibUsb.close(handle);
            LibUsb.exit(context);
        }
    }

    private byte findBulkOutEndpoint(DeviceHandle handle) throws Exception {
        Device device = LibUsb.getDevice(handle);
        DeviceDescriptor descriptor = new DeviceDescriptor();
        LibUsb.getDeviceDescriptor(device, descriptor);

        ConfigDescriptor config = new ConfigDescriptor();
        LibUsb.getActiveConfigDescriptor(device, config);

        for (Interface iface : config.iface()) {
            for (InterfaceDescriptor ifaceDesc : iface.altsetting()) {
                for (EndpointDescriptor ep : ifaceDesc.endpoint()) {
                    // Bulk OUT endpoint: direction OUT (0x00) and type BULK (0x02)
                    boolean isOut  = (ep.bEndpointAddress() & LibUsb.ENDPOINT_IN) == 0;
                    boolean isBulk = (ep.bmAttributes() & LibUsb.TRANSFER_TYPE_MASK)
                            == LibUsb.TRANSFER_TYPE_BULK;
                    if (isOut && isBulk) {
                        byte addr = ep.bEndpointAddress();
                        LibUsb.freeConfigDescriptor(config);
                        return addr;
                    }
                }
            }
        }
        LibUsb.freeConfigDescriptor(config);
        // Fallback: POS-58 printers typically use endpoint 0x01 or 0x03
        log.warn("Bulk OUT endpoint not found via descriptor, falling back to 0x01");
        return 0x01;
    }
}