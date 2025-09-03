package com.example.todo_backend.services;

import java.util.List;
import com.example.todo_backend.dtos.NotificationDTO;
import com.example.todo_backend.entities.User;


public interface NotificationService {
    public void sendNotification(User user, String message);
    public List<NotificationDTO> getUserNotifications(Long userId);
    public void markAsRead(Long id);
}
