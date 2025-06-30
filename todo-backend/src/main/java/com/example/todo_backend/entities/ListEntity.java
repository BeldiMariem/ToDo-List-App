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
@Table(name = "lists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListEntity {
  @Id 
@GeneratedValue(strategy = GenerationType.IDENTITY)  
private Long id;

  private String name;
  private String color;

  @ManyToOne
  private Board board;

  @OneToMany(mappedBy= "list", cascade = CascadeType.ALL)
  private List<Card> cards;
}

