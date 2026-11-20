package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.DepartmentResponse;
import com.civicpulse.backend.service.DepartmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getActiveDepartments() {

        List<DepartmentResponse> departments =
            departmentService.getActiveDepartments();

        return ResponseEntity.ok(departments);
    }
}