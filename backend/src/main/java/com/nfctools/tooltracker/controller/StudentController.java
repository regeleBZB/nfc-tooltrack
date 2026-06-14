package com.nfctools.tooltracker.controller;

import com.nfctools.tooltracker.dto.request.CreateStudentRequest;
import com.nfctools.tooltracker.dto.response.ApiResponse;
import com.nfctools.tooltracker.dto.response.StudentResponse;
import com.nfctools.tooltracker.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;


    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<ApiResponse<StudentResponse>> getByQr(@PathVariable String qrCode) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getStudentByQrCode(qrCode)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getStudentById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StudentResponse>>> search(
            @RequestParam(required = false) String query, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                studentService.searchStudents(query != null ? query : "", pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentResponse>> create(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(studentService.createStudent(request), "Student registered"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> update(
            @PathVariable Long id, @Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.updateStudent(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        studentService.deactivateStudent(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Student deactivated"));
    }
}
