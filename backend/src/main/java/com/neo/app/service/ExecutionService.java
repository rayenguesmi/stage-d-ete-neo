package com.neo.app.service;

import com.neo.app.documents.ExecutionEntity;
import com.neo.app.repository.ExecutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExecutionService {

    @Autowired
    private ExecutionRepository executionRepository;

    public ExecutionEntity addExecution(ExecutionEntity execution) {
        execution.setDateMiseAJour(LocalDate.now());
        return executionRepository.save(execution);
    }

    public Optional<ExecutionEntity> updateExecution(String id, ExecutionEntity updatedExecution) {
        return executionRepository.findById(id).map(existingExecution -> {
            updatedExecution.setId(existingExecution.getId());
            updatedExecution.setDateMiseAJour(LocalDate.now());
            return executionRepository.save(updatedExecution);
        });
    }

    public boolean deleteExecution(String id) {
        if (executionRepository.existsById(id)) {
            executionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<ExecutionEntity> getAllExecutions() {
        return executionRepository.findAll();
    }

    public List<ExecutionEntity> getExecutionsByUserId(String userId) {
        return executionRepository.findByUserId(userId);
    }

    public byte[] exportExecutions() {
        // Générer un export CSV
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("ID,Nom de campagne,Date Mise à Jour,Statut,Demande Par,Resultat\n");

        for (ExecutionEntity execution : getAllExecutions()) {
            csvBuilder.append(String.format("%s,%s,%s,%s,%s,%s\n",
                    execution.getId(),
                    execution.getNomDeCampagne(),
                    execution.getDateMiseAJour(),
                    execution.getStatut(),
                    execution.getDemandePar(),
                    execution.getResultat()));
        }

        return csvBuilder.toString().getBytes();
    }
}
