package com.huskywusky.trailchecklist.controller;

import com.huskywusky.trailchecklist.model.ChecklistItem;
import com.huskywusky.trailchecklist.model.TripRequest;
import com.huskywusky.trailchecklist.service.ChecklistGenerator;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChecklistController {

    private final ChecklistGenerator generator;

    public ChecklistController(ChecklistGenerator generator) {
        this.generator = generator;
    }

    @PostMapping("/api/checklist")
    public List<ChecklistItem> generateChecklist(@RequestBody TripRequest trip) {
        return generator.generate(trip);
    }
}
