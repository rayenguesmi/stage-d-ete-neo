package com.neo.app.controller;

import com.neo.app.documents.ExecutionEntity;
import com.neo.app.service.ExecutionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/executions")
public class ExecutionController {

    private static final Logger logger = LoggerFactory.getLogger(ExecutionController.class);
    private final ExecutionService executionService;

    public ExecutionController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @GetMapping
    public ResponseEntity<List<ExecutionEntity>> getExecutions(@RequestParam(required = false) String userId) {
        List<ExecutionEntity> executions;

        if (userId != null) {
            executions = executionService.getExecutionsByUserId(userId);
        } else {
            executions = executionService.getAllExecutions();
        }

        if (executions.isEmpty()) {
            return ResponseEntity.noContent().build(); 
        }
        return ResponseEntity.ok(executions);
    }

    @PostMapping
    public ResponseEntity<ExecutionEntity> addExecution(@RequestBody ExecutionEntity execution) {
        ExecutionEntity createdExecution = executionService.addExecution(execution);
        return ResponseEntity.ok(createdExecution);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExecutionEntity> updateExecution(@PathVariable String id, @RequestBody ExecutionEntity execution) {
        Optional<ExecutionEntity> updatedExecution = executionService.updateExecution(id, execution);
        return updatedExecution.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExecution(@PathVariable String id) {
        if (executionService.deleteExecution(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExecutions() throws IOException {
        byte[] data = executionService.exportExecutions();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=executions.csv");
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
