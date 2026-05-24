package com.nfctools.tooltracker.service.impl;

import com.nfctools.tooltracker.dto.request.RegisterTagRequest;
import com.nfctools.tooltracker.dto.response.TagResponse;
import com.nfctools.tooltracker.entity.Tag;
import com.nfctools.tooltracker.entity.Tool;
import com.nfctools.tooltracker.exception.BusinessException;
import com.nfctools.tooltracker.exception.ResourceNotFoundException;
import com.nfctools.tooltracker.repository.TagRepository;
import com.nfctools.tooltracker.repository.ToolRepository;
import com.nfctools.tooltracker.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final ToolRepository toolRepository;

    @Override
    @Transactional
    public TagResponse registerTag(RegisterTagRequest request, String adminUsername) {
        String uid = request.getUid().toUpperCase();

        // Deactivate existing tag for this UID if any (tag replacement scenario)
        tagRepository.findById(uid).ifPresent(existing -> {
            existing.setActive(false);
            tagRepository.save(existing);
        });

        // Deactivate old tag on the tool if it had one
        tagRepository.findByToolIdAndActiveTrue(request.getToolId()).ifPresent(old -> {
            old.setActive(false);
            tagRepository.save(old);
        });

        Tool tool = toolRepository.findById(request.getToolId())
                .orElseThrow(() -> new ResourceNotFoundException("Tool", request.getToolId()));

        Tag tag = Tag.builder()
                .uid(uid)
                .tool(tool)
                .active(true)
                .encodedBy(adminUsername)
                .notes(request.getNotes())
                .build();

        return toResponse(tagRepository.save(tag));
    }

    @Override
    public TagResponse getTagByUid(String uid) {
        return toResponse(tagRepository.findByUidAndActiveTrue(uid.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Tag", uid)));
    }

    @Override
    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deactivateTag(String uid) {
        Tag tag = tagRepository.findById(uid.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Tag", uid));
        tag.setActive(false);
        tagRepository.save(tag);
    }

    private TagResponse toResponse(Tag tag) {
        TagResponse r = new TagResponse();
        r.setUid(tag.getUid());
        r.setActive(tag.isActive());
        r.setEncodedBy(tag.getEncodedBy());
        r.setNotes(tag.getNotes());
        r.setCreatedAt(tag.getCreatedAt());
        if (tag.getTool() != null) {
            r.setToolId(tag.getTool().getId());
            r.setToolName(tag.getTool().getName());
            r.setToolCode(tag.getTool().getToolCode());
        }
        return r;
    }
}
