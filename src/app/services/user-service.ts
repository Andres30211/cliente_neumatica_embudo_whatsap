import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleName, User } from '../interfaces/User';

export interface UpdateUserRequest {
  name: string;
  email: string;
}

export interface ChangeRoleRequest {role: RoleName;}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  
  private apiUrl:string = 'https://security-service-neumatica.onrender.com/api/users';

  constructor(private http: HttpClient) {}

  // =========================================
  // LISTAR USUARIOS
  // =========================================

  getUsers(): Observable<User[]> {

    return this.http.get<User[]>(this.apiUrl);
  }

  // =========================================
  // OBTENER USUARIO
  // =========================================

  getUserById(id: number): Observable<User> {

    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }


  // =========================================
  // ACTUALIZAR DATOS
  // =========================================

  updateUser(id: number,data: UpdateUserRequest): Observable<User> {

    return this.http.put<User>(`${this.apiUrl}/${id}`,data);
  }

  // =========================================
  // CAMBIAR ROL
  // =========================================

  changeRole(id: number,role: RoleName): Observable<User> {

    return this.http.patch<User>(`${this.apiUrl}/${id}/role`,{role});
  }

  // =========================================
  // ELIMINAR
  // =========================================

  deleteUser(id: number): Observable<void> {

    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
