import { FormsModule } from '@angular/forms';
import { BoardDTO } from '../../../core/models/board.model';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { BoardService } from '../../../core/services/board.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-boards-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board-manegement.component.html',
  styleUrls: ['./board-manegement.component.scss']
})
export class BoardManegementComponent implements OnInit {
  public boardService = inject(BoardService);
  private router = inject(Router);

  boards = this.boardService.boards;
  loading = this.boardService.loading;
  error = this.boardService.error;

  viewMode = signal<'grid' | 'list' | 'masonry'>('grid');
  
  showCreateModal = signal(false);
  showDeleteModal = signal(false);
  newBoardName = signal('');
  boardToDelete = signal<BoardDTO | null>(null);
  isDeleting = signal(false);
  isCreating = signal(false);

  private colorGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
  ];

  ngOnInit(): void {
    this.boardService.getBoards();
  }

  openBoard(boardId: number): void {
    this.router.navigate(['/board-detail', boardId]);
  }

  toggleCreateModal(): void {
    this.showCreateModal.set(!this.showCreateModal());
    this.newBoardName.set('');
  }

  openDeleteModal(board: BoardDTO): void {
    this.boardToDelete.set(board);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.boardToDelete.set(null);
  }

  createBoard(): void {
    const name = this.newBoardName().trim();
    if (!name) return;

    this.isCreating.set(true);
    this.boardService.createBoard({ name }).subscribe({
      next: () => {
        this.boardService.getBoards();
        this.newBoardName.set('');
        this.showCreateModal.set(false);
        this.isCreating.set(false);
      },
      error: (err) => {
        console.error('Failed to create board:', err);
        this.isCreating.set(false);
      }
    });
  }

  deleteBoard(): void {
    const board = this.boardToDelete();
    if (!board) return;

    this.isDeleting.set(true);
    this.boardService.deleteBoard(board.id).subscribe({
      next: () => {
        this.boardService.getBoards();
        this.closeDeleteModal();
        this.isDeleting.set(false);
      },
      error: (err) => {
        console.error('Failed to delete board:', err);
        this.isDeleting.set(false);
      }
    });
  }

  getBoardGradient(index: number): string {
    return this.colorGradients[index % this.colorGradients.length];
  }

  getRandomProgress(): number {
    return Math.floor(Math.random() * 100);
  }
}