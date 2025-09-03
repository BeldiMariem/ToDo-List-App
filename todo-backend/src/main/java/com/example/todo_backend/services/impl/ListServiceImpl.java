package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.ListMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.ListService;
import com.example.todo_backend.services.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ListServiceImpl implements ListService {

    private final ListEntityRepository listRepository;
    private final ListMapper listMapper;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ListDTO createList(ListDTO listDto) {
        Board board = findBoardById(listDto.getBoardId());
        ListEntity newList = createNewList(listDto, board);
        ListEntity savedList = listRepository.save(newList);
        
        notifyBoardMembersAboutNewList(board, savedList);
        
        return listMapper.toDto(savedList);
    }

    @Override
    public List<ListDTO> getListsByBoardId(Long boardId) {
        return listRepository.findByBoardId(boardId).stream()
                .map(listMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteList(Long listId) {
        ListEntity list = findListById(listId);
        Board board = list.getBoard();
        
        notifyBoardMembersAboutDeletedList(board, list);
        listRepository.delete(list);
    }

    @Override
    @Transactional
    public ListDTO updateList(ListDTO listDto) {
        ListEntity list = findListById(listDto.getId());
        updateListProperties(list, listDto);
        
        ListEntity updatedList = listRepository.save(list);
        return listMapper.toDto(updatedList);
    }

    private ListEntity createNewList(ListDTO listDto, Board board) {
        ListEntity list = new ListEntity();
        list.setName(listDto.getName());
        list.setColor(listDto.getColor());
        list.setBoard(board);
        return list;
    }

    private void updateListProperties(ListEntity list, ListDTO listDto) {
        list.setName(listDto.getName());
        list.setColor(listDto.getColor());
    }

    private void notifyBoardMembersAboutNewList(Board board, ListEntity newList) {
        User currentUser = getCurrentUser();
        String notificationMessage = createNewListNotificationMessage(currentUser, newList, board);
        
        notifyAllBoardMembersExceptCurrentUser(board, notificationMessage);
    }

    private void notifyBoardMembersAboutDeletedList(Board board, ListEntity deletedList) {
        User currentUser = getCurrentUser();
        String notificationMessage = createDeletedListNotificationMessage(currentUser, deletedList, board);
        
        notifyAllBoardMembersExceptCurrentUser(board, notificationMessage);
    }

    private void notifyAllBoardMembersExceptCurrentUser(Board board, String message) {
        Long currentUserId = authService.getCurrentUserId();
        
        board.getMembers().stream()
            .filter(member -> !member.getUser().getId().equals(currentUserId))
            .forEach(member -> 
                notificationService.sendNotification(member.getUser(), message)
            );
    }

    private String createNewListNotificationMessage(User user, ListEntity list, Board board) {
        return String.format("%s created new list: %s in board: %s", 
            user.getUsername(), list.getName(), board.getName());
    }

    private String createDeletedListNotificationMessage(User user, ListEntity list, Board board) {
        return String.format("%s deleted list: %s from board: %s", 
            user.getUsername(), list.getName(), board.getName());
    }

    private Board findBoardById(Long boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
    }

    private ListEntity findListById(Long listId) {
        return listRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List", "id", listId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private User getCurrentUser() {
        Long currentUserId = authService.getCurrentUserId();
        return findUserById(currentUserId);
    }
}