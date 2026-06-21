package com.nfctools.tooltracker.service.impl;

import com.nfctools.tooltracker.dto.request.CreateToolRequest;
import com.nfctools.tooltracker.dto.request.UpdateToolRequest;
import com.nfctools.tooltracker.dto.response.ToolResponse;
import com.nfctools.tooltracker.entity.Tag;
import com.nfctools.tooltracker.entity.Tool;
import com.nfctools.tooltracker.enums.ToolStatus;
import com.nfctools.tooltracker.exception.BusinessException;
import com.nfctools.tooltracker.exception.ResourceNotFoundException;
import com.nfctools.tooltracker.repository.TagRepository;
import com.nfctools.tooltracker.repository.ToolRepository;
import com.nfctools.tooltracker.service.ToolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ToolServiceImpl implements ToolService {

    private final ToolRepository toolRepository;
    private final TagRepository  tagRepository;

    @Override
    @Transactional
    public ToolResponse createTool(CreateToolRequest request) {
        if (toolRepository.existsByToolCode(request.getToolCode())) {
            throw new BusinessException("Tool code already exists: " + request.getToolCode());
        }
        Tool tool = Tool.builder()
                .toolCode(request.getToolCode().toUpperCase())
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .purchasePrice(request.getPurchasePrice())
                .status(ToolStatus.AVAILABLE)
                .build();
        return toResponse(toolRepository.save(tool));
    }

    @Override
    public ToolResponse getToolByUid(String uid) {
        log.info("NFC scan received — UID: {}", uid);

        Tag tag = tagRepository.findByUidAndActiveTrue(uid.toUpperCase())
                .orElseThrow(() -> {
                    log.warn("No registered tag found for UID: {}", uid);
                    return new ResourceNotFoundException(
                            "No registered tool found for tag UID: " + uid);
                });

        log.info("Tag resolved — UID: {} → Tool: {} ({})",
                uid, tag.getTool().getName(), tag.getTool().getStatus());

        return toResponse(tag.getTool());
    }

    @Override
    public ToolResponse getToolById(Long id) {
        return toResponse(findToolOrThrow(id));
    }

    @Override
    public ToolResponse getToolByCode(String toolCode) {
        return toResponse(toolRepository.findByToolCode(toolCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Tool", toolCode)));
    }

    @Override
    public Page<ToolResponse> getAllTools(Pageable pageable) {
        return toolRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<ToolResponse> searchTools(String query, Pageable pageable) {
        return toolRepository.search(query, pageable).map(this::toResponse);
    }

    @Override
    public Page<ToolResponse> getToolsByStatus(ToolStatus status, Pageable pageable) {
        return toolRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public ToolResponse updateTool(Long id, UpdateToolRequest request) {
        Tool tool = findToolOrThrow(id);
        if (request.getName()          != null) tool.setName(request.getName());
        if (request.getCategory()      != null) tool.setCategory(request.getCategory());
        if (request.getDescription()   != null) tool.setDescription(request.getDescription());
        if (request.getStatus()        != null) tool.setStatus(request.getStatus());
        if (request.getPurchasePrice() != null) tool.setPurchasePrice(request.getPurchasePrice());
        return toResponse(toolRepository.save(tool));
    }

    @Override
    @Transactional
    public void deleteTool(Long id) {
        Tool tool = findToolOrThrow(id);
        if (tool.getStatus() == ToolStatus.BORROWED) {
            throw new BusinessException(
                    "Cannot retire a tool that is currently borrowed. It must be returned first.");
        }

        // Soft delete: retire the tool instead of removing the row, so that
        // transaction history / receipts referencing it stay intact (avoids
        // the foreign-key constraint error a hard delete would cause).
        tool.setStatus(ToolStatus.RETIRED);

        // Deactivate the NFC tag so its UID can be reused for another tool.
        Tag tag = tool.getTag();
        if (tag != null && tag.isActive()) {
            tag.setActive(false);
            tagRepository.save(tag);
        }

        toolRepository.save(tool);
        log.info("Tool retired — id: {} ({})", id, tool.getName());
    }

    @Override
    public List<String> getAllCategories() {
        return toolRepository.findDistinctCategoryByOrderByCategoryAsc();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Tool findToolOrThrow(Long id) {
        return toolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tool", id));
    }

    private ToolResponse toResponse(Tool tool) {
        ToolResponse r = new ToolResponse();
        r.setId(tool.getId());
        r.setToolCode(tool.getToolCode());
        r.setName(tool.getName());
        r.setCategory(tool.getCategory());
        r.setDescription(tool.getDescription());
        r.setStatus(tool.getStatus());
        r.setPurchasePrice(tool.getPurchasePrice());
        r.setCreatedAt(tool.getCreatedAt());
        if (tool.getTag() != null && tool.getTag().isActive()) {
            r.setTagUid(tool.getTag().getUid());
        }
        return r;
    }
}