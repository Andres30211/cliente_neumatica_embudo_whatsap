import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { AuthServices } from '../../services/auth-services';
import Swal from 'sweetalert2';
import { NotificationServices } from '../../services/notification-services';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private readonly fb = inject(FormBuilder);

  public showPassword:boolean = false;

  public showConfirmPassword:boolean = false;


  // ================================================
  // SEGURIDAD DE CONTRASEÑA
  // ================================================

  public passwordStrength:string = '';

  public passwordStrengthPercentage:number = 0;

  public passwordStrengthMessage:string = '';


  constructor(private authService: AuthServices, 
    private router: Router, 
    private notificationServices: NotificationServices) {}

    registerForm = this.fb.group({
      name: ['',[Validators.required,Validators.minLength(3)]],
      email: ['',[Validators.required,Validators.email]],
      password: ['',[Validators.required,Validators.minLength(8)]],
      confirmPassword: ['',[Validators.required]]},
      {
        validators: this.passwordMatchValidator
      });


  // ================================================
  // MOSTRAR / OCULTAR PASSWORD
  // ================================================

  togglePassword(): void {

    this.showPassword = !this.showPassword;

  }


  // ================================================
  // MOSTRAR / OCULTAR CONFIRM PASSWORD
  // ================================================

  toggleConfirmPassword(): void {

    this.showConfirmPassword = !this.showConfirmPassword;

  }


  // ================================================
  // SEGURIDAD DE PASSWORD
  // ================================================

  checkPasswordStrength(): void {

    const password = this.registerForm.get('password') ?.value || '';

    /*
     * Si no hay contraseña
     */

    if (!password) {

      this.passwordStrength = '';

      this.passwordStrengthPercentage = 0;

      this.passwordStrengthMessage = '';

      return;

    }

    let score = 0;


    // --------------------------------------------
    // LONGITUD
    // --------------------------------------------

    if (password.length >= 8) {

      score++;

    }


    if (password.length >= 12) {

      score++;

    }

    // --------------------------------------------
    // MINÚSCULAS
    // --------------------------------------------

    if (/[a-z]/.test(password)) {

      score++;

    }


    // --------------------------------------------
    // MAYÚSCULAS
    // --------------------------------------------

    if (/[A-Z]/.test(password)) {

      score++;

    }


    // --------------------------------------------
    // NÚMEROS
    // --------------------------------------------

    if (/[0-9]/.test(password)) {

      score++;

    }


    // --------------------------------------------
    // CARACTERES ESPECIALES
    // --------------------------------------------

    if (/[^A-Za-z0-9]/.test(password)) {

      score++;

    }


    // ============================================
    // RESULTADO
    // ============================================

    if (score <= 2) {

      this.passwordStrength = 'Débil';

      this.passwordStrengthPercentage = 30;

      this.passwordStrengthMessage = 'Utiliza al menos 8 caracteres, mayúsculas, números y símbolos.';

    }

    else if (score <= 4) {

      this.passwordStrength = 'Media';

      this.passwordStrengthPercentage = 65;

      this.passwordStrengthMessage = 'Tu contraseña es aceptable, pero puedes hacerla más segura.';

    }

    else {

      this.passwordStrength = 'Fuerte';

      this.passwordStrengthPercentage = 100;

      this.passwordStrengthMessage = 'Excelente. Tu contraseña tiene un buen nivel de seguridad.';

    }

  }


  // ================================================
  // VALIDAR QUE LAS CONTRASEÑAS COINCIDAN
  // ================================================

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {

    const password = form.get('password')?.value;

    const confirmPassword = form.get('confirmPassword')?.value;


    /*
     * Mientras alguno esté vacío,
     * no hacemos la comparación.
     */

    if (!password || !confirmPassword) {

      return null;

    }


    /*
     * Las contraseñas son diferentes
     */

    if (password !== confirmPassword) {

      return {passwordMismatch: true};

    }


    /*
     * Las contraseñas coinciden
     */

    return null;

  }


  // ================================================
  // REGISTRAR
  // ================================================

  register(): void {

    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      return;
    }

    const request = {
      name: this.registerForm.value.name!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!
    };

    this.authService.register(request).subscribe({

      next: (response) => {

        this.notificationServices.success('Registro completado', 'Tu cuenta ha sido creada correctamente.');

        this.router.navigate(['/home']);

      }

    });
  }


}