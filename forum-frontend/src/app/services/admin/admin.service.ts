import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { RoleResponse, UserResponse, TopicResponse } from '../../interfaces';
// import { Role, User, Topic, Comment } from './models'; // Make sure to define your models appropriately
import { Role, RoleResponse, RolesResponse } from '../../interfaces/role';
import { User, UserResponse, UsersResponse } from '../../interfaces/user';
import { Topic, TopicResponse } from '../../interfaces/topic';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private roleBaseUrl = 'http://localhost:8888/api/role'; // Base URL for role-related endpoints
  private userBaseUrl = 'http://localhost:8888/api/user'; // Base URL for user-related endpoints
  private topicBaseUrl = 'http://localhost:8888/api/topic'; // Base URL for topic-related endpoints

  constructor(private http: HttpClient) {}

  // Fetch all roles
  getRoles(): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(`${this.roleBaseUrl}s`);
  }

  // Fetch a specific role by ID
  getRoleById(roleId: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.roleBaseUrl}/${roleId}`);
  }

  // Update a specific role
  updateRole(role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.roleBaseUrl}/${role.id}`, role);
  }

  // Get users for a specific role
  getUsersForRole(roleId: number): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.roleBaseUrl}/${roleId}/users`);
  }

  // Fetch all users
  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.userBaseUrl}s`);
  }

  // Update a user's role
  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.put<User>(`${this.userBaseUrl}/${userId}/role`, { roleId });
  }

  // Update a user's data
  updateUserById(userId: number, roleId: number): Observable<UserResponse> {
    console.log(userId, roleId)
    return this.http.put<UserResponse>(`${this.userBaseUrl}/${userId}`, { role: roleId });
  }

  // Fetch all topics
  getAllTopics(): Observable<TopicResponse[]> {
    return this.http.get<TopicResponse[]>(`${this.topicBaseUrl}s`);
  }

  // Add a new topic
  addTopic(topic: Topic): Observable<Topic> {
    return this.http.post<Topic>(`${this.topicBaseUrl}/add`, topic);
  }

  // Delete a specific topic by ID
  deleteTopic(topicId: number): Observable<void> {
    return this.http.delete<void>(`${this.topicBaseUrl}/${topicId}`);
  }

  // Add a new comment to a specific topic
  addCommentToTopic(topicId: number, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.topicBaseUrl}/${topicId}/comment/add`,
      comment
    );
  }

  // Delete a specific comment from a topic
  deleteComment(topicId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.topicBaseUrl}/${topicId}/comment/${commentId}`
    );
  }
}
