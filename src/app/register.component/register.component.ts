import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service'
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar.component/navbar.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Registration failed';
      }
    });
  }
}