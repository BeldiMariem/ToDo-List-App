package com.example.todo_backend.services.impl;

import com.example.todo_backend.dtos.ActivityDTO;
import com.example.todo_backend.dtos.CreateActivityRequest;
import com.example.todo_backend.dtos.UpdateActivityRequest;
import com.example.todo_backend.entities.Activity;
import com.example.todo_backend.entities.ActivityType;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.repositories.ActivityRepository;
import com.example.todo_backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Activity Service Implementation Tests")
class ActivityServiceImplTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ActivityServiceImpl activityService;

    private User organizer;
    private User participant;
    private Activity activity;
    private CreateActivityRequest createRequest;
    private UpdateActivityRequest updateRequest;

    @BeforeEach
    void setUp() {
        organizer = createUser(1L, "organizerUser", "organizer@example.com");
        participant = createUser(2L, "participantUser", "participant@example.com");
        activity = createActivity();
        createRequest = createCreateRequest();
        updateRequest = createUpdateRequest();
    }

    // Helper methods for test data creation
    private User createUser(Long id, String username, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        return user;
    }

    private Activity createActivity() {
        Activity activity = new Activity();
        activity.setId(1L);
        activity.setTitle("Test Activity");
        activity.setDescription("Test Description");
        activity.setStartTime(LocalDateTime.now().plusHours(1));
        activity.setEndTime(LocalDateTime.now().plusHours(2));
        activity.setType(ActivityType.MEETING);
        activity.setOrganizer(organizer);
        activity.setParticipants(new ArrayList<>(List.of(participant)));
        activity.setCreatedAt(LocalDateTime.now());
        activity.setUpdatedAt(LocalDateTime.now());
        return activity;
    }

    private CreateActivityRequest createCreateRequest() {
        CreateActivityRequest request = new CreateActivityRequest();
        request.setTitle("New Activity");
        request.setDescription("New Description");
        request.setStartTime(LocalDateTime.now().plusHours(1));
        request.setEndTime(LocalDateTime.now().plusHours(2));
        request.setType(ActivityType.CALL);
        request.setParticipantIds(List.of(2L));
        return request;
    }

    private UpdateActivityRequest createUpdateRequest() {
        UpdateActivityRequest request = new UpdateActivityRequest();
        request.setTitle("Updated Activity");
        request.setDescription("Updated Description");
        request.setStartTime(LocalDateTime.now().plusHours(3));
        request.setEndTime(LocalDateTime.now().plusHours(4));
        request.setType(ActivityType.EVENT);
        request.setParticipantIds(List.of(2L));
        return request;
    }

    @Nested
    @DisplayName("Create Activity Tests")
    class CreateActivityTests {

        @Test
        @DisplayName("Should create activity successfully")
        void createActivity_ShouldCreateActivitySuccessfully() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(organizer));
            when(userRepository.findAllById(any())).thenReturn(List.of(participant));
            when(activityRepository.save(any(Activity.class))).thenReturn(activity);

            ActivityDTO result = activityService.createActivity(createRequest, 1L);

            assertNotNull(result);
            assertEquals(activity.getTitle(), result.getTitle());
            assertEquals(activity.getDescription(), result.getDescription());
            assertEquals(organizer.getId(), result.getOrganizerId());
            assertEquals(1, result.getParticipantIds().size());
            assertEquals(ActivityType.MEETING, result.getType());

            verify(userRepository).findById(1L);
            verify(userRepository).findAllById(any());
            verify(activityRepository).save(any(Activity.class));
        }

        @Test
        @DisplayName("Should throw exception when organizer not found")
        void createActivity_WhenOrganizerNotFound_ShouldThrowException() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                activityService.createActivity(createRequest, 1L);
            });

            verify(userRepository).findById(1L);
            verifyNoInteractions(activityRepository);
        }

        @Test
        @DisplayName("Should handle null participant IDs gracefully")
        void createActivity_WithNullParticipantIds_ShouldHandleGracefully() {
            createRequest.setParticipantIds(null);
            when(userRepository.findById(1L)).thenReturn(Optional.of(organizer));
            when(activityRepository.save(any(Activity.class))).thenReturn(activity);

            ActivityDTO result = activityService.createActivity(createRequest, 1L);

            assertNotNull(result);
            verify(userRepository).findById(1L);
            verify(userRepository, never()).findAllById(any());
            verify(activityRepository).save(any(Activity.class));
        }
    }

    @Nested
    @DisplayName("Get Activity Tests")
    class GetActivityTests {

        @Test
        @DisplayName("Should return activity by ID")
        void getActivityById_ShouldReturnActivity() {
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));

            ActivityDTO result = activityService.getActivityById(1L);

            assertNotNull(result);
            assertEquals(activity.getId(), result.getId());
            assertEquals(activity.getTitle(), result.getTitle());
            verify(activityRepository).findById(1L);
        }

        @Test
        @DisplayName("Should throw exception when activity not found")
        void getActivityById_WhenNotFound_ShouldThrowException() {
            when(activityRepository.findById(1L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                activityService.getActivityById(1L);
            });

            verify(activityRepository).findById(1L);
        }

        @Test
        @DisplayName("Should return user activities")
        void getUserActivities_ShouldReturnUserActivities() {
            when(activityRepository.findByUserId(1L)).thenReturn(List.of(activity));

            List<ActivityDTO> result = activityService.getUserActivities(1L);

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(activity.getId(), result.get(0).getId());
            verify(activityRepository).findByUserId(1L);
        }

        @Test
        @DisplayName("Should return filtered activities by date range")
        void getUserActivitiesByDateRange_ShouldReturnFilteredActivities() {
            LocalDateTime start = LocalDateTime.now().minusDays(1);
            LocalDateTime end = LocalDateTime.now().plusDays(1);
            when(activityRepository.findByUserIdAndDateRange(1L, start, end)).thenReturn(List.of(activity));

            List<ActivityDTO> result = activityService.getUserActivitiesByDateRange(1L, start, end);

            assertNotNull(result);
            assertEquals(1, result.size());
            verify(activityRepository).findByUserIdAndDateRange(1L, start, end);
        }
    }

    @Nested
    @DisplayName("Update Activity Tests")
    class UpdateActivityTests {

        @Test
        @DisplayName("Should update activity successfully")
        void updateActivity_ShouldUpdateActivitySuccessfully() {
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
            when(userRepository.findAllById(any())).thenReturn(List.of(participant));
            when(activityRepository.save(any(Activity.class))).thenReturn(activity);

            ActivityDTO result = activityService.updateActivity(1L, updateRequest);

            assertNotNull(result);
            assertEquals(updateRequest.getTitle(), result.getTitle());
            verify(activityRepository).findById(1L);
            verify(userRepository).findAllById(any());
            verify(activityRepository).save(any(Activity.class));
        }

        @Test
        @DisplayName("Should throw exception when activity not found for update")
        void updateActivity_WhenActivityNotFound_ShouldThrowException() {
            when(activityRepository.findById(1L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                activityService.updateActivity(1L, updateRequest);
            });

            verify(activityRepository).findById(1L);
            verifyNoMoreInteractions(activityRepository);
            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("Should handle null participant IDs gracefully during update")
        void updateActivity_WithNullParticipantIds_ShouldHandleGracefully() {
            updateRequest.setParticipantIds(null);
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
            when(activityRepository.save(any(Activity.class))).thenReturn(activity);

            ActivityDTO result = activityService.updateActivity(1L, updateRequest);

            assertNotNull(result);
            verify(activityRepository).findById(1L);
            verify(userRepository, never()).findAllById(any());
            verify(activityRepository).save(any(Activity.class));
        }
    }

    @Nested
    @DisplayName("Delete Activity Tests")
    class DeleteActivityTests {

        @Test
        @DisplayName("Should delete activity successfully")
        void deleteActivity_ShouldDeleteActivity() {
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
            doNothing().when(activityRepository).delete(activity);

            activityService.deleteActivity(1L);

            verify(activityRepository).findById(1L);
            verify(activityRepository).delete(activity);
        }

        @Test
        @DisplayName("Should throw exception when activity not found for deletion")
        void deleteActivity_WhenActivityNotFound_ShouldThrowException() {
            when(activityRepository.findById(1L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                activityService.deleteActivity(1L);
            });

            verify(activityRepository).findById(1L);
            verifyNoMoreInteractions(activityRepository);
        }
    }

    @Nested
    @DisplayName("Participant Management Tests")
    class ParticipantManagementTests {

        @Test
        @DisplayName("Should add participant successfully")
        void addParticipant_ShouldAddParticipant() {
            User newParticipant = createUser(3L, "newParticipant", "new@example.com");
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
            when(userRepository.findById(3L)).thenReturn(Optional.of(newParticipant));
            when(activityRepository.save(any(Activity.class))).thenReturn(activity);

            activityService.addParticipant(1L, 3L);

            verify(activityRepository).findById(1L);
            verify(userRepository).findById(3L);
            verify(activityRepository).save(activity);
        }

        @Test
        @DisplayName("Should not add duplicate participant")
        void addParticipant_WhenParticipantAlreadyExists_ShouldNotAddDuplicate() {
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
            when(userRepository.findById(2L)).thenReturn(Optional.of(participant));

            activityService.addParticipant(1L, 2L);

            verify(activityRepository).findById(1L);
            verify(userRepository).findById(2L);
            verify(activityRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should remove participant successfully")
        void removeParticipant_ShouldRemoveParticipant() {
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
            when(userRepository.findById(2L)).thenReturn(Optional.of(participant));
            when(activityRepository.save(any(Activity.class))).thenReturn(activity);

            activityService.removeParticipant(1L, 2L);

            verify(activityRepository).findById(1L);
            verify(userRepository).findById(2L);
            verify(activityRepository).save(activity);
        }

        @Test
        @DisplayName("Should handle removal of non-existent participant gracefully")
        void removeParticipant_WhenParticipantNotInActivity_ShouldStillTryToRemove() {
            User nonParticipant = createUser(3L, "nonParticipant", "non@example.com");
            when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
            when(userRepository.findById(3L)).thenReturn(Optional.of(nonParticipant));
            when(activityRepository.save(any(Activity.class))).thenReturn(activity);

            activityService.removeParticipant(1L, 3L);

            verify(activityRepository).findById(1L);
            verify(userRepository).findById(3L);
            verify(activityRepository).save(activity);
        }
    }

    @Nested
    @DisplayName("DTO Conversion Tests")
    class DtoConversionTests {

        @Test
        @DisplayName("Should convert activity to DTO correctly")
        void convertToDTO_ShouldConvertCorrectly() {
            ActivityDTO result = activityService.convertToDTO(activity);

            assertNotNull(result);
            assertEquals(activity.getId(), result.getId());
            assertEquals(activity.getTitle(), result.getTitle());
            assertEquals(activity.getDescription(), result.getDescription());
            assertEquals(activity.getOrganizer().getId(), result.getOrganizerId());
            assertEquals(activity.getOrganizer().getUsername(), result.getOrganizerName());
            assertEquals(1, result.getParticipantIds().size());
            assertEquals(1, result.getParticipantNames().size());
            assertEquals(participant.getId(), result.getParticipantIds().get(0));
            assertEquals(participant.getUsername(), result.getParticipantNames().get(0));
        }
    }
}