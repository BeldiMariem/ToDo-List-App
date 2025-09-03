import { Injectable, inject } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, map } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationDTO } from '../models/notification.model';


@Injectable({ providedIn: 'root' })
export class NotificationService {
    private stompClient!: Client;
    private notificationsSubject = new BehaviorSubject<NotificationDTO[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();
    private authService = inject(AuthService);
    private http = inject(HttpClient);
    private isConnected = false;
    private panelOpenSubject = new BehaviorSubject<boolean>(false);
    public panelOpen$ = this.panelOpenSubject.asObservable();

    get unreadCount$() {
        return this.notifications$.pipe(
            map(notifications => notifications.filter(n => !n.seen).length)
        );
    }

    connect() {
        if (!this.authService.isAuthenticated() || this.isConnected) {
            return;
        }
        try {
            const wsUrl = `${environment.apiBaseUrl}/ws`;
            this.stompClient = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                reconnectDelay: 5000,
                connectHeaders: {
                    Authorization: `Bearer ${this.authService.token()}`
                },
                onConnect: () => {
                    console.log('Connected to WebSocket successfully');
                    this.isConnected = true;
                    this.subscribeToNotifications();
                    this.loadInitialNotifications();
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame.headers['message'], frame.body);
                    this.isConnected = false;
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                    this.isConnected = false;
                },
                onDisconnect: () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                }
            });

            this.stompClient.activate();
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
        }
    }

    setPanelOpen(isOpen: boolean) {
        this.panelOpenSubject.next(isOpen);
    }

    private subscribeToNotifications() {
        const userId = this.authService.getCurrentUser()?.id;
        if (userId && this.stompClient?.connected) {
            this.stompClient.subscribe(
                `/topic/notifications/${userId}`,
                (message: IMessage) => {
                    this.handleNotification(message.body);
                }
            );
        }
    }

    private handleNotification(message: string) {
        try {
            const newNotification: NotificationDTO = {
                id: Date.now(),
                message: message,
                seen: false,
                createdAt: new Date().toISOString()
            };

            const currentNotifications = this.notificationsSubject.value;
            this.notificationsSubject.next([newNotification, ...currentNotifications]);
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    }

    loadInitialNotifications() {
        const userId = this.authService.getCurrentUser()?.id;
        if (userId) {
            this.http.get<NotificationDTO[]>(`${environment.apiUrl}/notifications`)
                .subscribe({
                    next: (notifications) => {
                        const reversedNotifications = [...notifications].reverse();
                        this.notificationsSubject.next(reversedNotifications);
                    },
                    error: (error) => {
                        console.error('Failed to load notifications:', error);
                    }
                });
        }
    }

    markAsRead(notificationId: number) {
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(n =>
            n.id === notificationId ? { ...n, seen: true } : n
        );
        this.notificationsSubject.next(updatedNotifications);

        this.http.post(`${environment.apiUrl}/notifications/${notificationId}/mark-read`, {})
            .subscribe({
                next: () => {
                    console.log('Notification marked as read on server');
                },
                error: () => {
                    this.notificationsSubject.next(currentNotifications);
                }
            });
    }

    clearAllNotifications() {
        const currentNotifications = this.notificationsSubject.value;        
        this.notificationsSubject.next([]);
        const userId = this.authService.getCurrentUser()?.id;
        if (userId) {
            this.http.delete(`${environment.apiUrl}/notifications/clear-all`, {
                params: { userId }
            }).subscribe({
                next: () => {
                    console.log('All notifications cleared on server');
                },
                error: (error) => {
                    console.error('Failed to clear all notifications on server:', error);
                    this.notificationsSubject.next(currentNotifications);
                }
            });
        }
    }

    testConnection() {
        this.connect();
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.isConnected = false;
        }
    }
}