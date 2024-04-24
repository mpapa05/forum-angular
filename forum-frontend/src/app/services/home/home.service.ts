import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topic, TopicResponse, TopicsResponse } from '../../interfaces/topic';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = 'http://localhost:8888/api'; // Adjust if needed based on server configuration

  constructor(private http: HttpClient) {}

  getAllTopics(): Observable<TopicsResponse> {
    return this.http.get<TopicsResponse>(`${this.baseUrl}/topics`);
  }

  addTopic(topic: Topic): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/topic/add`, topic );
  }

  getTopicComments(topicId: number): Observable<TopicResponse> {
    return this.http.get<TopicResponse>(`${this.baseUrl}/topic/${topicId}`);
  }

  addCommentToRoot(topicId: number, commentBody: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/topic/${topicId}/comment/add`, { body: commentBody });
  }

  addCommentToComment(topicId: number, commentId: number, commentBody: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/topic/${topicId}/comment/${commentId}/add`, { body: commentBody });
  }

  removeComment(topicId: number, commentId: number): Observable<TopicResponse> {
    return this.http.delete<TopicResponse>(`${this.baseUrl}/topic/${topicId}/comment/${commentId}`);
  }
}