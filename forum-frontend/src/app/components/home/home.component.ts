import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HomeService } from '../../services/home/home.service';
import { ProfileService } from '../../services/profile/profile.service';
import { Topic } from '../../interfaces/topic';
import { Comment } from '../../interfaces/comment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { USER_ID } from '../../constants/constant';
import { UserResponse } from '../../interfaces/user';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  topics: Topic[] = [];
  newTopicForm: FormGroup;
  newCommentBody: string = ''; // Declare newCommentBody
  userId = USER_ID; // Example user ID
  userData: UserResponse | undefined; 

  constructor(
    private homeService: HomeService,
    private profileService: ProfileService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.newTopicForm = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
    });
    this.profileService.getUserById(this.userId).subscribe(
      (response) => {
        if (response.status === 200) {
          this.userData = response;
        }
      },
      (error) => {
        this.snackBar.open('Error loading user data', 'Dismiss', { duration: 3000 });
      }
    );
  }

  ngOnInit() {
    this.loadTopics();
  }

  loadTopics() {
    this.homeService.getAllTopics().subscribe(
      (response) => {
        if (response.status === 200) {
          this.topics = response.data;
          console.log(this.topics)
          // Initialize the expanded property for all topics
          this.topics.forEach((topic) => {
            topic.expanded = false;
            // Ensure comments are initialized to prevent undefined errors
            if (!topic.comments) {
              topic.comments = [];
            }
          });
        }
      },
      (error) => {
        this.snackBar.open('Error loading topics', 'Dismiss', { duration: 3000 });
      }
    );
  }


  addNewTopic() {
    if (this.newTopicForm.valid && this.userData) {
      const newTopic = {
        id: 0, //( db will generate id)
        author: this.userData.data,
        title: this.newTopicForm?.get('title')?.value,
        body: this.newTopicForm?.get('body')?.value,
        comments: []
      }
      console.log(newTopic);
      this.homeService.addTopic(newTopic).subscribe(
        (response) => {
          console.log(response)
          if (response.status === 200) {
            this.snackBar.open('Topic added successfully', 'Dismiss', { duration: 3000 });
            this.newTopicForm.reset();
            this.loadTopics(); // Reload the topics to reflect the new addition
          } else {
            this.snackBar.open('Error adding topic', 'Dismiss', { duration: 3000 });
          }
        },
        (error) => {
          this.snackBar.open('Error adding topic', 'Dismiss', { duration: 3000 });
        }
      );
    }
  }

  toggleComments(topic: Topic) {
    topic.expanded = !topic.expanded; // Toggle the expanded state
    if (topic.expanded && !topic.comments) {
      this.homeService.getTopicComments(topic.id).subscribe(
        (response) => {
          if (response.status === 200) {
            topic.comments = response.data;
          } else {
            this.snackBar.open('Error loading comments', 'Dismiss', { duration: 3000 });
          }
        },
        (error) => {
          this.snackBar.open('Error loading comments', 'Dismiss', { duration: 3000 });
        }
      );
    }
  }

  addComment(topic: Topic, parentComment?: Comment) {
    const commentBody = this.newCommentBody.trim();
  
    if (commentBody) {
      const endpoint = parentComment
        ? `http://localhost:8888/api/topic/${topic.id}/comment/${parentComment.id}/add`
        : `http://localhost:8888/api/topic/${topic.id}/comment/add`;
  
      // Add the correct data object
      this.homeService.addComment(endpoint, commentBody ).subscribe(
        (response) => {
          if (response.status === 201) {
            this.snackBar.open('Comment added successfully', 'Dismiss', { duration: 3000 });
            
            const newComment = response.data; // Confirm `response.data` is of type `Comment`
            
            if (parentComment) {
              // Ensure `parentComment.comments` is defined and is a `Comment[]`
              parentComment.comments ??= []; // Use nullish coalescing operator
              // parentComment.comments.push(newComment); // Add the new comment
              console.log('newComment2', newComment);
            } else {
              // Ensure `topic.comments` is defined and is a `Comment[]`
              topic.comments ??= []; // Use nullish coalescing operator
              // topic.comments.push(newComment); // Add the new comment
              console.log('newComment22222', newComment);
            }
          }
        },
        (error) => {
          this.snackBar.open('Error adding comment', 'Dismiss', { duration: 3000 });
        }
      );
    }
  }

  markCommentRemoved(comment: Comment) {
    comment.removed = true;
  }

}