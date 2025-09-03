package com.example.todo_backend.controllers;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo_backend.dtos.NotificationDTO;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authenticationService;


    @GetMapping
    public List<NotificationDTO> getUserNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = authenticationService.getCurrentUserId();

        return notificationService.getUserNotifications(userId);
    }

    @PostMapping("/{id}/mark-read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }
}

