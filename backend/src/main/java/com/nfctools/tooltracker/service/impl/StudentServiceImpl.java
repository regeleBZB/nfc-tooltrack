package com.nfctools.tooltracker.service.impl;

import com.nfctools.tooltracker.dto.request.CreateStudentRequest;
import com.nfctools.tooltracker.dto.response.StudentResponse;
import com.nfctools.tooltracker.entity.Student;
import com.nfctools.tooltracker.exception.BusinessException;
import com.nfctools.tooltracker.exception.ResourceNotFoundException;
import com.nfctools.tooltracker.repository.StudentRepository;
import com.nfctools.tooltracker.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request) {
        if (request.getQrCode() != null && studentRepository.existsByQrCode(request.getQrCode())) {
            throw new BusinessException("QR code already registered: " + request.getQrCode());
        }
        Student student = Student.builder()
                .qrCode(request.getQrCode())
                .name(request.getName())
                .section(request.getSection())
                .contactNumber(request.getContactNumber())
                .active(true)
                .build();
        return toResponse(studentRepository.save(student));
    }

    @Override
    public StudentResponse getStudentByQrCode(String qrCode) {
        return toResponse(studentRepository.findByQrCodeAndActiveTrue(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for QR: " + qrCode)));
    }

    @Override
    public StudentResponse getStudentById(Long id) {
        return toResponse(studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id)));
    }

    @Override
    public Page<StudentResponse> searchStudents(String query, Pageable pageable) {
        return studentRepository.search(query, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(Long id, CreateStudentRequest request) {
        Student s = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
        s.setName(request.getName());
        s.setSection(request.getSection());
        s.setContactNumber(request.getContactNumber());
        return toResponse(studentRepository.save(s));
    }

    @Override
    @Transactional
    public void deactivateStudent(Long id) {
        Student s = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
        s.setActive(false);
        studentRepository.save(s);
    }

    private StudentResponse toResponse(Student s) {
        StudentResponse r = new StudentResponse();
        r.setId(s.getId());
        r.setQrCode(s.getQrCode());
        r.setName(s.getName());
        r.setSection(s.getSection());
        r.setContactNumber(s.getContactNumber());
        r.setActive(s.isActive());
        return r;
    }
}
