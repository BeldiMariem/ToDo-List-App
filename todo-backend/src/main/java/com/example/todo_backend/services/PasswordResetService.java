package com.example.todo_backend.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.todo_backend.entities.User;
import com.example.todo_backend.repositories.UserRepository;


public interface PasswordResetService {


    public void createPasswordResetToken(String email);
    public void resetPassword(String token, String newPassword);
    public void sendEmail(String to, String resetUrl);


    
}
