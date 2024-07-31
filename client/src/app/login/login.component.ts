import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppService } from '../app.service';
import { localStorageService } from '../service/local-storage.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  userForm!: FormGroup;
  constructor(
    private service: AppService,
    private ls: localStorageService,
    private toast: ToastService
  ) { }
  ngOnInit(): void {
    this.userForm = new FormGroup({
      username: new FormControl(null),
      password: new FormControl(null)
    });
  }
  onLogin() {
    this.service
      .loginUser(this.userForm.value.username, this.userForm.value.password)
      .subscribe({
        next: (data) => {
          this.ls.setUser(data);
          this.toast.showSuccess("Successfully Logged!!")
        },
        error: (err) => {
          this.toast.showDanger('failed to login');
        },
      });
  }
}