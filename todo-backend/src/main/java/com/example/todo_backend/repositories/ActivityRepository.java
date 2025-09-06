package com.example.todo_backend.repositories;

import com.example.todo_backend.entities.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByOrganizerId(Long organizerId);
    
    List<Activity> findByParticipantsId(Long participantId);
    
    @Query("SELECT a FROM Activity a " +
           "LEFT JOIN a.participants p " +
           "WHERE a.organizer.id = :userId OR p.id = :userId")
    List<Activity> findByUserId(@Param("userId") Long userId);
    
    List<Activity> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT a FROM Activity a " +
           "LEFT JOIN a.participants p " +
           "WHERE (a.organizer.id = :userId OR p.id = :userId) " +
           "AND a.startTime BETWEEN :start AND :end")
    List<Activity> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                           @Param("start") LocalDateTime start, 
                                           @Param("end") LocalDateTime end);

}