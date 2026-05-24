package com.nfctools.tooltracker.controller;

import com.nfctools.tooltracker.dto.request.CreateToolRequest;
import com.nfctools.tooltracker.dto.request.UpdateToolRequest;
import com.nfctools.tooltracker.dto.response.ApiResponse;
import com.nfctools.tooltracker.dto.response.ToolResponse;
import com.nfctools.tooltracker.enums.ToolStatus;
import com.nfctools.tooltracker.service.ToolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tools")
@RequiredArgsConstructor
public class ToolController {

    private final ToolService toolService;

    @GetMapping("/uid/{uid}")
    public ResponseEntity<ApiResponse<ToolResponse>> getByUid(@PathVariable String uid) {
        return ResponseEntity.ok(ApiResponse.ok(toolService.getToolByUid(uid)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ToolResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(toolService.getToolById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ToolResponse>>> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ToolStatus status) {

        Page<ToolResponse> result;
        if (search != null && !search.isBlank()) {
            result = toolService.searchTools(search, pageable);
        } else if (status != null) {
            result = toolService.getToolsByStatus(status, pageable);
        } else {
            result = toolService.getAllTools(pageable);
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(toolService.getAllCategories()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ToolResponse>> create(@Valid @RequestBody CreateToolRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toolService.createTool(request), "Tool created"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ToolResponse>> update(
            @PathVariable Long id, @RequestBody UpdateToolRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(toolService.updateTool(id, request), "Tool updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        toolService.deleteTool(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Tool deleted"));
    }
}
