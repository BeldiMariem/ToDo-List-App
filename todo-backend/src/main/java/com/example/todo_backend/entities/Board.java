package com.example.todo_backend.entities;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "boards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Board {
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
  @JsonIgnore
  private List<BoardMember> members = new ArrayList<>();

  @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
  private List<ListEntity> lists = new ArrayList<>();

  public String toString() {
    return "Board{id=" + id + ", name='" + name + "'}"; 
  }

}
