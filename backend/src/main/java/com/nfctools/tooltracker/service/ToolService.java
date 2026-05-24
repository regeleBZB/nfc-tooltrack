package com.nfctools.tooltracker.service;

import com.nfctools.tooltracker.dto.request.CreateToolRequest;
import com.nfctools.tooltracker.dto.request.UpdateToolRequest;
import com.nfctools.tooltracker.dto.response.ToolResponse;
import com.nfctools.tooltracker.enums.ToolStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ToolService {
    ToolResponse createTool(CreateToolRequest request);
    ToolResponse getToolByUid(String uid);          // kiosk NFC scan entry point
    ToolResponse getToolById(Long id);
    ToolResponse getToolByCode(String toolCode);
    Page<ToolResponse> getAllTools(Pageable pageable);
    Page<ToolResponse> searchTools(String query, Pageable pageable);
    Page<ToolResponse> getToolsByStatus(ToolStatus status, Pageable pageable);
    ToolResponse updateTool(Long id, UpdateToolRequest request);
    void deleteTool(Long id);
    List<String> getAllCategories();
}
