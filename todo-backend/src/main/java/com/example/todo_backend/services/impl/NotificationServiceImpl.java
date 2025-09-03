package com.example.todo_backend.services.impl;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.NotificationDTO;
import com.example.todo_backend.entities.Notification;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.mappers.NotificationMapper;
import com.example.todo_backend.repositories.NotificationRepository;
import com.example.todo_backend.services.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService{
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public void sendNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), message);
    }

    @Override
    @Transactional
    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(notificationMapper::toDTO)
                .toList();
    }
    
    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setSeen(true);
        notificationRepository.save(notif);
    }
}
