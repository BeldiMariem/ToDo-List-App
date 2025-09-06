package com.example.todo_backend.controllers;

import com.example.todo_backend.dtos.ActivityDTO;
import com.example.todo_backend.dtos.CreateActivityRequest;
import com.example.todo_backend.dtos.UpdateActivityRequest;
import com.example.todo_backend.entities.ActivityType;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.services.ActivityService;
import com.example.todo_backend.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ActivityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ActivityService activityService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ActivityController activityController;

    private ObjectMapper objectMapper;
    private ActivityDTO testActivityDTO;
    private CreateActivityRequest testCreateRequest;
    private UpdateActivityRequest testUpdateRequest;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        
        mockMvc = MockMvcBuilders.standaloneSetup(activityController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testActivityDTO = new ActivityDTO();
        testActivityDTO.setId(1L);
        testActivityDTO.setTitle("Test Activity");
        testActivityDTO.setDescription("Test Description");
        testActivityDTO.setStartTime(LocalDateTime.now().plusHours(1));
        testActivityDTO.setEndTime(LocalDateTime.now().plusHours(2));
        testActivityDTO.setType(ActivityType.MEETING);
        testActivityDTO.setOrganizerId(1L);
        testActivityDTO.setOrganizerName("testUser");
        testActivityDTO.setParticipantIds(List.of(2L, 3L));
        testActivityDTO.setParticipantNames(List.of("user2", "user3"));

        testCreateRequest = new CreateActivityRequest();
        testCreateRequest.setTitle("New Activity");
        testCreateRequest.setDescription("New Description");
        testCreateRequest.setStartTime(LocalDateTime.now().plusHours(1));
        testCreateRequest.setEndTime(LocalDateTime.now().plusHours(2));
        testCreateRequest.setType(ActivityType.CALL);
        testCreateRequest.setParticipantIds(List.of(2L));

        testUpdateRequest = new UpdateActivityRequest();
        testUpdateRequest.setTitle("Updated Activity");
        testUpdateRequest.setDescription("Updated Description");
        testUpdateRequest.setStartTime(LocalDateTime.now().plusHours(3));
        testUpdateRequest.setEndTime(LocalDateTime.now().plusHours(4));
        testUpdateRequest.setType(ActivityType.EVENT);
        testUpdateRequest.setParticipantIds(List.of(2L, 3L));
    }

    @Test
    void createActivity_shouldReturnActivityDTO() throws Exception {
        Long userId = 1L;
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(activityService.createActivity(any(CreateActivityRequest.class), eq(userId))).thenReturn(testActivityDTO);

        mockMvc.perform(post("/api/activities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCreateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Activity"))
                .andExpect(jsonPath("$.type").value("MEETING"));

        verify(authService).getCurrentUserId();
        verify(activityService).createActivity(any(CreateActivityRequest.class), eq(userId));
    }

    @Test
    void createActivity_shouldHandleServiceException() throws Exception {
        Long userId = 1L;
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(activityService.createActivity(any(CreateActivityRequest.class), eq(userId)))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(post("/api/activities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCreateRequest)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Service error")));

        verify(authService).getCurrentUserId();
        verify(activityService).createActivity(any(CreateActivityRequest.class), eq(userId));
    }

    @Test
    void getActivity_shouldReturnActivityDTO() throws Exception {
        Long activityId = 1L;
        when(activityService.getActivityById(activityId)).thenReturn(testActivityDTO);

        mockMvc.perform(get("/api/activities/{id}", activityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Activity"));

        verify(activityService).getActivityById(activityId);
    }

    @Test
    void getActivity_shouldHandleNotFound() throws Exception {
        Long activityId = 999L;
        when(activityService.getActivityById(activityId))
                .thenThrow(new ResourceNotFoundException("Activity", "id", activityId));

        mockMvc.perform(get("/api/activities/{id}", activityId))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("Activity not found with id")));

        verify(activityService).getActivityById(activityId);
    }

    @Test
    void getUserActivities_shouldReturnListOfActivityDTOs() throws Exception {
        Long userId = 1L;
        List<ActivityDTO> activities = List.of(testActivityDTO);
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(activityService.getUserActivities(userId)).thenReturn(activities);

        mockMvc.perform(get("/api/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Test Activity"));

        verify(authService).getCurrentUserId();
        verify(activityService).getUserActivities(userId);
    }

    @Test
    void getActivitiesByDateRange_shouldReturnFilteredActivities() throws Exception {
        Long userId = 1L;
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(1);
        List<ActivityDTO> activities = List.of(testActivityDTO);
        
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(activityService.getUserActivitiesByDateRange(userId, start, end)).thenReturn(activities);

        mockMvc.perform(get("/api/activities/date-range")
                .param("start", start.toString())
                .param("end", end.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Test Activity"));

        verify(authService).getCurrentUserId();
        verify(activityService).getUserActivitiesByDateRange(userId, start, end);
    }

    @Test
    void getActivitiesByDateRange_shouldHandleInvalidDateParameters() throws Exception {
        mockMvc.perform(get("/api/activities/date-range"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/activities/date-range")
                .param("start", "invalid-date")
                .param("end", "invalid-date"))
                .andExpect(status().isBadRequest());

        verify(authService, never()).getCurrentUserId();
        verify(activityService, never()).getUserActivitiesByDateRange(any(), any(), any());
    }

    @Test
    void updateActivity_shouldReturnUpdatedActivityDTO() throws Exception {
        Long activityId = 1L;
        when(activityService.updateActivity(eq(activityId), any(UpdateActivityRequest.class))).thenReturn(testActivityDTO);

        mockMvc.perform(put("/api/activities/{id}", activityId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUpdateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Activity"));

        verify(activityService).updateActivity(eq(activityId), any(UpdateActivityRequest.class));
    }

    @Test
    void updateActivity_shouldHandleInvalidActivityId() throws Exception {
        Long invalidActivityId = 999L;
        when(activityService.updateActivity(eq(invalidActivityId), any(UpdateActivityRequest.class)))
                .thenThrow(new ResourceNotFoundException("Activity", "id", invalidActivityId));

        mockMvc.perform(put("/api/activities/{id}", invalidActivityId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUpdateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("Activity not found with id")));

        verify(activityService).updateActivity(eq(invalidActivityId), any(UpdateActivityRequest.class));
    }

    @Test
    void deleteActivity_shouldReturnNoContent() throws Exception {
        Long activityId = 1L;
        doNothing().when(activityService).deleteActivity(activityId);

        mockMvc.perform(delete("/api/activities/{id}", activityId))
                .andExpect(status().isNoContent());

        verify(activityService).deleteActivity(activityId);
    }

    @Test
    void addParticipant_shouldReturnOk() throws Exception {
        Long activityId = 1L;
        Long userId = 2L;
        doNothing().when(activityService).addParticipant(activityId, userId);

        mockMvc.perform(post("/api/activities/{activityId}/participants/{userId}", activityId, userId))
                .andExpect(status().isOk());

        verify(activityService).addParticipant(activityId, userId);
    }

    @Test
    void addParticipant_shouldHandleInvalidIds() throws Exception {
        Long invalidActivityId = 999L;
        Long userId = 2L;
        doThrow(new ResourceNotFoundException("Activity", "id", invalidActivityId))
                .when(activityService).addParticipant(invalidActivityId, userId);

        mockMvc.perform(post("/api/activities/{activityId}/participants/{userId}", invalidActivityId, userId))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("Activity not found with id")));

        verify(activityService).addParticipant(invalidActivityId, userId);
    }

    @Test
    void removeParticipant_shouldReturnOk() throws Exception {
        Long activityId = 1L;
        Long userId = 2L;
        doNothing().when(activityService).removeParticipant(activityId, userId);

        mockMvc.perform(delete("/api/activities/{activityId}/participants/{userId}", activityId, userId))
                .andExpect(status().isOk());

        verify(activityService).removeParticipant(activityId, userId);
    }
}