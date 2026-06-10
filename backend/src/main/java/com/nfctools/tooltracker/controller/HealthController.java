package com.nfctools.tooltracker.controller;

// Add to HealthController.java
import com.nfctools.tooltracker.repository.ToolRepository;
import com.nfctools.tooltracker.repository.TagRepository;
import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final ToolRepository toolRepository;
    private final TagRepository  tagRepository;

    @GetMapping
    public Map<String, Object> health() {
        return Map.of(
                "status",    "ok",
                "timestamp", LocalDateTime.now().toString(),
                "service",   "nfc-tooltrack-backend"
        );
    }


    @GetMapping("/db")
    public Map<String, Object> dbStatus() {
        return Map.of(
                "tools",    toolRepository.count(),
                "tags",     tagRepository.count(),
                "dbStatus", "connected"
        );
    }




}