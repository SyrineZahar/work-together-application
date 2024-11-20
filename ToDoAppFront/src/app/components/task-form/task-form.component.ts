import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TaskStatus } from 'src/app/classe/Enum/TaskStatus.enum';
import { GroupEntity } from 'src/app/classe/GroupEntity';
import { Task } from 'src/app/classe/Task';
import { User } from 'src/app/classe/User';
import { AuthService } from 'src/app/service/Auth.service';
import { GroupService } from 'src/app/service/group.service';
import { taskService } from 'src/app/service/Task.service';
import { userService } from 'src/app/service/User.service';
import { futureDateValidator } from './future-date.validator';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  groupId: number;
  task!: Task;
  taskForm!: FormGroup;
  taskStatuses = Object.values(TaskStatus);
  users: User[] = []; 
  groups!: GroupEntity[]; 
  isUpdate: boolean = false; 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    private fb: FormBuilder,
    private taskService: taskService, 
    private userService: userService,
    private router: Router,
    private groupService: GroupService,
    private authService: AuthService,
  ) {
    this.groupId = data.group_id; 
    this.task = data.task || null; 
    this.isUpdate = !!this.task;
  }

  ngOnInit(): void {
    this.createForm(); 
    this.fetchUsers(); 
  }

  private createForm(): void {
    this.taskForm = this.fb.group({
      title: [this.task?.title || '', Validators.required],
      description: [this.task?.description || '', Validators.required],
      status: [this.task?.status || TaskStatus.todo, Validators.required],
      deadline: [
        this.task?.deadline ? this.formatDate(this.task.deadline) : '', 
        [Validators.required, futureDateValidator()]
      ],
      user_id: [this.task?.user_id || null, Validators.required],
      group_id: [this.groupId]
    });
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error("Invalid date:", date);
      return ''; 
    }
    d.setHours(23, 59, 59, 999); 

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); 
    const day = String(d.getDate()).padStart(2, '0'); 
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; 
  }

  private fetchUsers(): void {
    this.userService.getUsersbygroup(this.groupId).subscribe(
      (data: User[]) => {
        this.users = data; 
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      console.log('Form Data:', this.taskForm.value);

      let taskDeadline = this.taskForm.value.deadline;
      
      if (!(taskDeadline instanceof Date)) {
        taskDeadline = new Date(taskDeadline);
      }

      if (isNaN(taskDeadline.getTime())) {
        console.error("Invalid deadline:", taskDeadline);
        return; 
      }

      taskDeadline.setHours(23, 59, 59, 999); 

      const formattedDeadline = this.formatDate(taskDeadline);

      const taskData = new Task(
        this.taskForm.value.title,
        this.taskForm.value.description,
        this.taskForm.value.status,
        new Date(formattedDeadline), 
        Number(this.taskForm.value.group_id),
        Number(this.taskForm.value.user_id),
        this.taskForm.value.isDesactivated
      );

      if (this.isUpdate && this.task) {
        this.taskService.updateTask(Number(this.task.id), taskData).subscribe(() => {
          this.dialogRef.close(); 
        }, (error) => {
          console.error('Error updating task:', error);
        });
      } else {
        this.taskService.addTask(taskData).subscribe(() => {
          console.log(taskData)
          this.dialogRef.close(); 
        }, (error) => {
          console.error('Error adding task:', error);
        });
      }
    } else {
      console.log('Form is invalid');
    }
  }

  navigateToTasks(): void {
    this.dialogRef.close(); 
  }
}
