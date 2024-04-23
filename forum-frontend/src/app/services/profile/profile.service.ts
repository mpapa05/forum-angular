import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, mergeMap } from 'rxjs';
import { TopicResponse } from '../../interfaces/topic';
import { UserResponse, UserWithRoleCommentsTopics } from '../../interfaces/user';
import { RoleResponse } from '../../interfaces/role';
import { Comment } from '../../interfaces/comment';

@Injectable({
  providedIn: 'root', // Ensures the service is a singleton at the root level
})

export class ProfileService {
  private baseUrl = 'http://localhost:8888/api/user'; // Base URL for your API endpoints

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl); // Fetch all users
  }

  getUserById(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${userId}`);
  }

  logInUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/login`); // Log in a user
  }

  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${user.id}`, user); // Update a user
  }

  getRoleById(roleId: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`http://localhost:8888/api/role/${roleId}`);
  }

  getTopics(): Observable<TopicResponse> {
    return this.http.get<TopicResponse>(`http://localhost:8888/api/topics`);
  }

  // Combine information to create UserWithRoleCommentsTopics
  getUserWithRoleCommentsTopics(userId: number): Observable<UserWithRoleCommentsTopics> {
    const userObservable = this.getUserById(userId);
    const topicsObservable = this.getTopics();
  
    return forkJoin({ user: userObservable, topics: topicsObservable }).pipe(
      map(({ user, topics }) => {
        if (user.status !== 200 || !user.data) {
          throw new Error("Failed to fetch user or user data is missing");
        }
  
        const userData = user.data;
  
        if (!("role" in userData)) {
          throw new Error("User role information is missing");
        }
  
        if (!topics?.data || !Array.isArray(topics.data)) {
          throw new Error("Topics data is missing or not in the expected format");
        }
  
        // Define the counting functions
        const topicsTotal = topics.data.filter((topic) => {
          return topic.author && topic.author.id === userId; // Check if author and author.id are defined
        }).length;
  
        // Function to count comments recursively
        function countComments(comments: Comment[]): number {
          let count = 0;
          comments.forEach((comment) => {
            if (comment.author && comment.author.id === userId) {
              count += 1;
            }
            count += countComments(comment?.comments ?? []); // Recursive count, default to empty array
          });
          return count;
        }
  
        // Count total comments for the user
        let commentsTotal = 0;
        topics.data.forEach((topic) => {
          commentsTotal += countComments(topic.comments);
        });
  
        // Get the user's role
        const roleObservable = this.getRoleById(userData.role);
  
        return roleObservable.pipe(
          map((role) => {
            if (role.status !== 200 || !role.data) {
              throw new Error("Failed to fetch role or role data is missing");
            }
  
            const roleData = role.data;
  
            return {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              roleId: roleData.id,
              roleName: roleData.name,
              roleRights: roleData.rights,
              password: userData.password,
              commentsTotal,
              topicsTotal,
            } as UserWithRoleCommentsTopics;
          })
        );
      }),
      mergeMap((observable) => observable)
    );
  }
}