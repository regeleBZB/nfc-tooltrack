package com.nfctools.tooltracker.service;

import com.nfctools.tooltracker.dto.request.RegisterTagRequest;
import com.nfctools.tooltracker.dto.response.TagResponse;

import java.util.List;

public interface TagService {
    TagResponse registerTag(RegisterTagRequest request, String adminUsername);
    TagResponse getTagByUid(String uid);
    List<TagResponse> getAllTags();
    void deactivateTag(String uid);
}
