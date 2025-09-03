package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import com.example.todo_backend.dtos.NotificationDTO;
import com.example.todo_backend.entities.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationDTO toDTO(Notification notification);

    Notification toEntity(NotificationDTO dto);
}
