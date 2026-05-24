package com.nfctools.tooltracker.service;

import com.nfctools.tooltracker.dto.request.CreateStudentRequest;
import com.nfctools.tooltracker.dto.response.StudentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentService {
    StudentResponse createStudent(CreateStudentRequest request);
    StudentResponse getStudentByQrCode(String qrCode);  // kiosk QR scan entry point
    StudentResponse getStudentById(Long id);
    Page<StudentResponse> searchStudents(String query, Pageable pageable);
    StudentResponse updateStudent(Long id, CreateStudentRequest request);
    void deactivateStudent(Long id);
}
