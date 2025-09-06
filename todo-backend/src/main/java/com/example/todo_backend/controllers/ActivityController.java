package com.example.todo_backend.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.ActivityDTO;
import com.example.todo_backend.dtos.CreateActivityRequest;
import com.example.todo_backend.dtos.UpdateActivityRequest;
import com.example.todo_backend.services.ActivityService;
import com.example.todo_backend.services.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ActivityDTO> createActivity(@RequestBody CreateActivityRequest request) {
        Long currentUserId = authService.getCurrentUserId();
        ActivityDTO activity = activityService.createActivity(request, currentUserId);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivity(@PathVariable Long id) {
        ActivityDTO activity = activityService.getActivityById(id);
        return ResponseEntity.ok(activity);
    }

    @GetMapping
    public ResponseEntity<List<ActivityDTO>> getUserActivities() {
        Long currentUserId = authService.getCurrentUserId();
        List<ActivityDTO> activities = activityService.getUserActivities(currentUserId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        Long currentUserId = authService.getCurrentUserId();
        List<ActivityDTO> activities = activityService.getUserActivitiesByDateRange(currentUserId, start, end);
        return ResponseEntity.ok(activities);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> updateActivity(@PathVariable Long id, 
                                                     @RequestBody UpdateActivityRequest request) {
        ActivityDTO activity = activityService.updateActivity(id, request);
        return ResponseEntity.ok(activity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{activityId}/participants/{userId}")
    public ResponseEntity<Void> addParticipant(@PathVariable Long activityId, @PathVariable Long userId) {
        activityService.addParticipant(activityId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{activityId}/participants/{userId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long activityId, @PathVariable Long userId) {
        activityService.removeParticipant(activityId, userId);
        return ResponseEntity.ok().build();
    }
}