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

  addComment(endpoint: string, body: string): Observable<TopicResponse> {
    return this.http.post<TopicResponse>(endpoint, { body });
  }
}