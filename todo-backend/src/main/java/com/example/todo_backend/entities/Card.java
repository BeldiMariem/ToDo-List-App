package com.example.todo_backend.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Card {
  @Id 
@GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String tag;

  private String description;

  @ManyToOne
  private ListEntity list;

  @OneToMany(mappedBy = "card", cascade = CascadeType.ALL)
  private List<CardMember> members;

  @OneToMany(mappedBy = "card", cascade = CascadeType.ALL)
  private List<Comment> comments;
}
