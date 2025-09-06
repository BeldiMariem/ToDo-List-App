package com.example.todo_backend.services.impl;

import com.example.todo_backend.dtos.ActivityDTO;
import com.example.todo_backend.dtos.CreateActivityRequest;
import com.example.todo_backend.dtos.UpdateActivityRequest;
import com.example.todo_backend.entities.Activity;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.repositories.ActivityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.ActivityService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.NotificationService;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ActivityDTO createActivity(CreateActivityRequest request, Long organizerId) {
        User organizer = findUserById(organizerId);
        
        Activity activity = new Activity();
        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setType(request.getType());
        activity.setOrganizer(organizer);
        
        if (request.getParticipantIds() != null) {
            List<User> participants = userRepository.findAllById(request.getParticipantIds());
            activity.setParticipants(participants);
        }
        
        Activity savedActivity = activityRepository.save(activity);
        notifyMembersAboutActivityCreate(activity, organizer);

        return convertToDTO(savedActivity);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityDTO getActivityById(Long activityId) {
        Activity activity = findActivityById(activityId);
        return convertToDTO(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityDTO> getUserActivities(Long userId) {
        List<Activity> activities = activityRepository.findByUserId(userId);
        return activities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityDTO> getUserActivitiesByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        List<Activity> activities = activityRepository.findByUserIdAndDateRange(userId, start, end);
        return activities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ActivityDTO updateActivity(Long activityId, UpdateActivityRequest request) {
        Activity activity = findActivityById(activityId);
        
        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setType(request.getType());
        
        if (request.getParticipantIds() != null) {
            List<User> participants = userRepository.findAllById(request.getParticipantIds());
            activity.setParticipants(participants);
        }
        
        Activity updatedActivity = activityRepository.save(activity);
        return convertToDTO(updatedActivity);
    }

    @Override
    @Transactional
    public void deleteActivity(Long activityId) {
        Activity activity = findActivityById(activityId);
        notifyMembersAboutActivityDeletion(activity);
        activityRepository.delete(activity);
    }

    @Override
    @Transactional
    public void addParticipant(Long activityId, Long userId) {
        Activity activity = findActivityById(activityId);
        User user = findUserById(userId);
        
        if (!activity.getParticipants().contains(user)) {
            activity.getParticipants().add(user);
            activityRepository.save(activity);
        }
    }

    @Override
    @Transactional
    public void removeParticipant(Long activityId, Long userId) {
        Activity activity = findActivityById(activityId);
        User user = findUserById(userId);
        
        activity.getParticipants().remove(user);
        activityRepository.save(activity);
    }

    private Activity findActivityById(Long activityId) {
        return activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", activityId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    public ActivityDTO convertToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setTitle(activity.getTitle());
        dto.setDescription(activity.getDescription());
        dto.setStartTime(activity.getStartTime());
        dto.setEndTime(activity.getEndTime());
        dto.setType(activity.getType());
        dto.setOrganizerId(activity.getOrganizer().getId());
        dto.setOrganizerName(activity.getOrganizer().getUsername());
        dto.setParticipantIds(activity.getParticipants().stream()
                .map(User::getId)
                .collect(Collectors.toList()));
        dto.setParticipantNames(activity.getParticipants().stream()
                .map(User::getUsername)
                .collect(Collectors.toList()));
        dto.setCreatedAt(activity.getCreatedAt());
        dto.setUpdatedAt(activity.getUpdatedAt());
        return dto;
    }
    private void notifyMembersAboutActivityDeletion(Activity activity) {
        User currentUser = findUserById(authService.getCurrentUserId());
        String notificationMessage = String.format("%s deleted %s : %s ", 
            currentUser.getUsername(),activity.getType() , activity.getTitle());
        
        activity.getParticipants().stream()
            .filter(member -> !isCurrentUser(member))
            .forEach(member -> 
                notificationService.sendNotification(member, notificationMessage)
            );
    }
    private void notifyMembersAboutActivityCreate(Activity activity, User creattingUser) {
        String notificationMessage = String.format("You have been added by %s to a new %s : %s ", 
            creattingUser.getUsername(), activity.getType(), activity.getTitle());
        
        activity.getParticipants().stream()
            .filter(member -> !isCurrentUser(member))
            .forEach(member -> 
                notificationService.sendNotification(member, notificationMessage)
            );
    }

    private boolean isCurrentUser(User user) {
        return user.getId().equals(authService.getCurrentUserId());
    }
}