import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServices } from '../../services/auth-services';
import { Router, RouterLink } from '@angular/router';
import { NotificationServices } from '../../services/notification-services';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  public showPassword: boolean = false;

  public remember: boolean = false;

  private readonly fb = inject(FormBuilder);

  constructor(private authService: AuthServices,
    private router: Router,
    private cd: ChangeDetectorRef,
    private notificationService: NotificationServices) { }

  ngOnInit(): void {

  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [false]
  });

  public login(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }

    const email = this.loginForm.value.email!;
    const password = this.loginForm.value.password!;
    const rememberMe = this.loginForm.value.remember ?? false;

    const request = {
      email,
      password
    };

    this.authService.login(request, rememberMe).subscribe({

      next: () => {

        this.router.navigate(['/home']);
      },
      error: (error) => {

        this.notificationService.error('Inicio Sesión', error?.error?.message);
        console.log(error.message);
      }
    });
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

}
