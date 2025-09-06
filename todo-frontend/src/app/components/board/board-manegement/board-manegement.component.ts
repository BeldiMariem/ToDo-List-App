import { FormsModule } from '@angular/forms';
import { BoardDTO } from '../../../core/models/board.model';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { BoardService } from '../../../core/services/board.service';
import { Router } from '@angular/router';
import { TitleTruncatePipe } from '../../../core/pipes/title-truncate.pipe';

@Component({
  selector: 'app-boards-page',
  standalone: true,
  imports: [CommonModule, FormsModule,TitleTruncatePipe],
  templateUrl: './board-manegement.component.html',
  styleUrls: ['./board-manegement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardManegementComponent implements OnInit {
  public boardService = inject(BoardService);
  private router = inject(Router);

  boards = this.boardService.boards;
  loading = this.boardService.loading;
  error = this.boardService.error;
  progressValues = signal<number[]>([]);

  viewMode = signal<'grid' | 'list' | 'masonry'>('grid');
  
  showCreateModal = signal(false);
  showDeleteModal = signal(false);
  newBoardName = signal('');
  boardToDelete = signal<BoardDTO | null>(null);
  isDeleting = signal(false);
  isCreating = signal(false);

  private colorGradients = [
    'linear-gradient(135deg, #5e99e7ff 0%, #b490ca 100%)',
  ];

  constructor() {
    effect(() => {
      const boards = this.boards();
      if (boards && boards.length > 0) {
        this.progressValues.set(boards.map(() => Math.floor(Math.random() * 100)));
      }
    });
  }

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

  getStableProgress(boardId: number): number {
    return 30 + (boardId * 13) % 65;
  }
}