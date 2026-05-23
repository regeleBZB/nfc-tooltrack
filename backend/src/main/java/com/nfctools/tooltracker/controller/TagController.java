package com.nfctools.tooltracker.controller;

import com.nfctools.tooltracker.dto.request.RegisterTagRequest;
import com.nfctools.tooltracker.dto.response.ApiResponse;
import com.nfctools.tooltracker.dto.response.TagResponse;
import com.nfctools.tooltracker.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TagResponse>> register(
            @Valid @RequestBody RegisterTagRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.ok(
                tagService.registerTag(request, user.getUsername()), "Tag registered"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(tagService.getAllTags()));
    }

    @GetMapping("/{uid}")
    public ResponseEntity<ApiResponse<TagResponse>> getByUid(@PathVariable String uid) {
        return ResponseEntity.ok(ApiResponse.ok(tagService.getTagByUid(uid)));
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable String uid) {
        tagService.deactivateTag(uid);
        return ResponseEntity.ok(ApiResponse.ok(null, "Tag deactivated"));
    }
}
