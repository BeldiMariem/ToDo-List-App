package com.example.todo_backend.services;

import java.time.LocalDateTime;
import java.util.List;

import com.example.todo_backend.dtos.ActivityDTO;
import com.example.todo_backend.dtos.CreateActivityRequest;
import com.example.todo_backend.dtos.UpdateActivityRequest;

public interface ActivityService {
    ActivityDTO createActivity(CreateActivityRequest request, Long organizerId);
    ActivityDTO getActivityById(Long activityId);
    List<ActivityDTO> getUserActivities(Long userId);
    List<ActivityDTO> getUserActivitiesByDateRange(Long userId, LocalDateTime start, LocalDateTime end);
    ActivityDTO updateActivity(Long activityId, UpdateActivityRequest request);
    void deleteActivity(Long activityId);
    void addParticipant(Long activityId, Long userId);
    void removeParticipant(Long activityId, Long userId);
}