import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HomeService } from '../../services/home/home.service';
import { ProfileService } from '../../services/profile/profile.service';
import { Topic } from '../../interfaces/topic';
import { Comment, TopicCommentInput } from '../../interfaces/comment';
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
  commentInputs: { [key: number]: string } = {}; // To manage unique input for each topic
  replyInputs: { [key: number]: { [key: number]: string } } = {}; // To manage unique inputs for nested comments
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
            this.commentInputs[topic.id] = ''; // Set to empty string for each topic
            this.replyInputs[topic.id] = {}; // Initialize nested replies for each topic
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

  addCommentToComment(
    // topicId: number, commentId: number
  ) {
    // const replyBody = this.replyInputs[topicId]?.[commentId]?.trim();
    // if (replyBody) {
    //   this.homeService.addCommentToComment(topicId, commentId, replyBody).subscribe(
    //     (response) => {
    //       if (response.status === 201) {
    //         this.snackBar.open('Reply added', 'Dismiss', { duration: 3000 });
    //         const newComment = response.data;

    //         const topic = this.topics.find(t => t.id === topicId);
    //         const parentComment = topic?.comments?.find(c => c.id === commentId);

    //         if (parentComment) {
    //           parentComment.comments = parentComment.comments || [];
    //           parentComment.comments.push(newComment);
    //         }

    //         // Reset the reply input after successful addition
    //         this.replyInputs[topicId][commentId] = '';
    //       }
    //     },
    //     (error) => {
    //       this.snackBar.open('Error adding reply', 'Dismiss', { duration: 3000 });
    //     }
    //   );
    // }
  }

  removeComment() {
    console.log('removeComment')
    // this.homeService.removeComment(topic.id, comment.id).subscribe(
    //   (response) => {
    //     comment.removed = true;
    //     this.snackBar.open('Comment removed', 'Dismiss', { duration: 3000 });
    //   },
    //   (error) => {
    //     this.snackBar.open('Error removing comment', 'Dismiss', { duration: 3000 });
    //   }
    // );
  }

  addCommentToTopic(topicId: number) {
    const commentBody = this.commentInputs[topicId]?.trim();
    if (commentBody && this.userData) {
      console.log('commentBody', topicId, commentBody, this.userData);
      const newCommentForRoot: TopicCommentInput = {
        body: commentBody,
        author: {
          id: this.userData.data.id,
          name: this.userData.data.name,
          email: this.userData.data.email,
          role: this.userData.data.role,
        }
      }
      this.homeService.addCommentToRoot(topicId, newCommentForRoot).subscribe(
        (response) => {
          if (response.status === 200) {
            this.snackBar.open('Comment added', 'Dismiss', { duration: 3000 });
            const newComment = response.data;

            // const topic = this.topics.find(t => t.id === topicId);
            // if (topic) {
            //   topic.comments = topic.comments || [];
            //   topic.comments.push(newComment);
            // }


            // Reset the input after successful addition
            this.commentInputs[topicId] = '';
            this.loadTopics(); // Reload the topics to reflect the new addition
          }
        },
        (error) => {
          this.snackBar.open('Error adding comment', 'Dismiss', { duration: 3000 });
        }
      );
    }
  }

  markCommentRemoved(topic: Topic, comment: Comment) {
    topic.removed = true; // Set the removed flag to true
    // Optionally, inform the backend of the change
    this.homeService.removeComment(topic.id, comment.id).subscribe(
      (response) => {
        this.snackBar.open('Comment removed', 'Dismiss', { duration: 3000 });
      },
      (error) => {
        this.snackBar.open('Error removing comment', 'Dismiss', { duration: 3000 });
      }
    );
  }

}