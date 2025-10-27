package com.example.todo_backend.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "board_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardMember {
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

  private String role;
  public String toString() {
    return "BoardMember{id=" + id + ", role=" + role + "}"; 
}
  
}
