package com.example.todo_backend.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.example.todo_backend.entities.ActivityType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateActivityRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ActivityType type;
    private List<Long> participantIds;
}