package com.nfctools.tooltracker.dto.response;
import lombok.Data;

@Data
public class DashboardResponse {
    private long totalTools;
    private long availableTools;
    private long borrowedTools;
    private long maintenanceTools;
    private long todayTransactions;
    private long overdueBorrows;
    private long totalStudents;
    private String printerMode;
}
