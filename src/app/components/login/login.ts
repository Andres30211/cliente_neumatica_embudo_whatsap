import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServices } from '../../services/auth-services';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{

  public showPassword: boolean = false;

  private readonly fb = inject(FormBuilder);

  public loading:boolean = false;
  public errorMessage:string = '';

  public cargandoServidor:boolean = true;
  public mensajeServidor:string = "Neumática Induatrial está poniendo a disposición el servidor... Esto podría tardar un minúto";

  constructor(private authService: AuthServices, private router: Router, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
  }

  loginForm = this.fb.group({
    email: ['',[Validators.required,Validators.email]],
    password: ['',[Validators.required]]
  });

  public onSubmit(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    };

    this.authService.login(request).subscribe({

      next: (response) => {

        this.loading = false;

        // Aquí posteriormente puedes navegar
        this.router.navigate(['/home']);

      }
    });
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

}
