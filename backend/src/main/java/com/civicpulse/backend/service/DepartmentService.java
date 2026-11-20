package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.DepartmentResponse;
import com.civicpulse.backend.entity.Department;
import com.civicpulse.backend.repository.DepartmentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository
    ) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getActiveDepartments() {

        return departmentRepository.findAll()
            .stream()
            .filter(Department::isActive)
            .map(this::convertToResponse)
            .toList();
    }

    private DepartmentResponse convertToResponse(Department department) {

        return new DepartmentResponse(
            department.getId(),
            department.getName(),
            department.getDescription(),
            department.getContactEmail(),
            department.getContactPhone()
        );
    }
}